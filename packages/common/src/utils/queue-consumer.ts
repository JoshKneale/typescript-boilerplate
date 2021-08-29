import { AWSError, SQS } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { logger } from './logger';

class SQSError extends Error {
  public code?: string;
  public statusCode?: number;
  public region?: string;
  public hostname?: string;
  public time?: Date;
  public retryable?: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out.') {
    super(message);
    this.message = message;
    this.name = 'TimeoutError';
  }
}

type ReceiveMessageResponse = PromiseResult<SQS.Types.ReceiveMessageResult, AWSError>;
type SQSMessage = SQS.Types.Message;
type ReceiveMessageRequest = SQS.Types.ReceiveMessageRequest;

function isMethod(propertyName: string, value: any): boolean {
  return propertyName !== 'constructor' && typeof value === 'function';
}

function autoBind(obj: object): void {
  const propertyNames = Object.getOwnPropertyNames(obj.constructor.prototype);
  propertyNames.forEach(propertyName => {
    // @ts-ignore
    const value = obj[propertyName];
    if (isMethod(propertyName, value)) {
      // @ts-ignore
      obj[propertyName] = value.bind(obj);
    }
  });
}

const isConnectionError = (err: Error): boolean => {
  if (err instanceof SQSError) {
    return err.statusCode === 403 || err.code === 'CredentialsError' || err.code === 'UnknownEndpoint';
  }
  return false;
};

const toSQSError = (err: AWSError, message: string): SQSError => {
  const sqsError = new SQSError(message);
  sqsError.code = err.code;
  sqsError.statusCode = err.statusCode;
  sqsError.region = err.region;
  sqsError.retryable = err.retryable;
  sqsError.hostname = err.hostname;
  sqsError.time = err.time;

  return sqsError;
};

interface ConsumerOptions {
  queueUrl: string;
  attributeNames?: string[];
  messageAttributeNames?: string[];
  stopped?: boolean;
  batchSize?: number;
  visibilityTimeout?: number;
  waitTimeSeconds?: number;
  authenticationErrorTimeout?: number;
  pollingWaitTimeMs?: number;
  terminateVisibilityTimeout?: boolean;
  sqs: SQS;
  handleMessageTimeout?: number;

  handleMessage(message: SQSMessage): Promise<void>;
}

export class Consumer {
  private readonly queueUrl: string;
  private readonly handleMessage: (message: SQSMessage) => Promise<void>;
  private readonly handleMessageTimeout: number | undefined;
  private readonly attributeNames: string[];
  private readonly messageAttributeNames: string[];
  private readonly batchSize: number;
  private readonly visibilityTimeout: number | undefined;
  private readonly waitTimeSeconds: number;
  private readonly pollingWaitTimeMs: number;

  private authenticationErrorTimeout: number;
  private stopped: boolean;
  private sqs: SQS;

  constructor(options: ConsumerOptions) {
    logger.info('Instantiating new consumer');
    if (options.batchSize && (options.batchSize > 10 || options.batchSize < 1)) {
      throw new Error('SQS batchSize option must be between 1 and 10.');
    }

    this.queueUrl = options.queueUrl;
    this.handleMessage = options.handleMessage;
    this.handleMessageTimeout = options.handleMessageTimeout;
    this.attributeNames = options.attributeNames || [];
    this.messageAttributeNames = options.messageAttributeNames || [];
    this.stopped = true;
    this.batchSize = options.batchSize || 1;
    this.visibilityTimeout = options.visibilityTimeout;
    this.waitTimeSeconds = options.waitTimeSeconds || 20;
    this.authenticationErrorTimeout = options.authenticationErrorTimeout || 10000;
    this.pollingWaitTimeMs = options.pollingWaitTimeMs || 0;
    this.sqs = options.sqs;

    autoBind(this);
  }

  public start(): void {
    if (this.stopped) {
      logger.info('Starting consumer');
      this.stopped = false;
      this.poll();
    }
  }

  public stop(): void {
    logger.info('Stopping consumer');
    this.stopped = true;
  }

  private async handleSqsResponse(response: ReceiveMessageResponse): Promise<void> {
    if (response) {
      if (response.Messages && response.Messages.length) {
        await this.processMessageBatch(response.Messages);
      }
    }
  }

  private async receiveMessage(params: ReceiveMessageRequest): Promise<ReceiveMessageResponse> {
    try {
      return await this.sqs.receiveMessage(params).promise();
    } catch (err) {
      throw toSQSError(err, `SQS receive message failed: ${err.message}`);
    }
  }

  private async deleteMessage(message: SQSMessage): Promise<void> {
    const deleteParams = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.ReceiptHandle!, // NOTE: why is this marked as possibly undefined?
    };

    try {
      await this.sqs.deleteMessage(deleteParams).promise();
    } catch (err) {
      throw toSQSError(err, `SQS delete message failed: ${err.message}`);
    }
  }

  private async executeHandler(message: SQSMessage): Promise<void> {
    try {
      await this.handleMessage(message);
    } catch (err) {
      if (err instanceof TimeoutError) {
        err.message = `Message handler timed out after ${this.handleMessageTimeout}ms: Operation timed out.`;
      } else {
        err.message = `Unexpected message handler failure: ${err.message}`;
      }
      throw err;
    }
  }

  private poll(): void {
    if (this.stopped) {
      return;
    }

    logger.info('Polling for messages');
    const receiveParams = {
      QueueUrl: this.queueUrl,
      AttributeNames: this.attributeNames,
      MessageAttributeNames: this.messageAttributeNames,
      MaxNumberOfMessages: this.batchSize,
      WaitTimeSeconds: this.waitTimeSeconds,
      VisibilityTimeout: this.visibilityTimeout,
    };

    let currentPollingTimeout = this.pollingWaitTimeMs;
    this.receiveMessage(receiveParams)
      .then(this.handleSqsResponse)
      .catch(err => {
        if (isConnectionError(err)) {
          console.error('There was an authentication error. Pausing before retrying.', err);
        }

        console.error('Something went wrong. Pausing before retrying. \n', err);
        currentPollingTimeout = this.authenticationErrorTimeout;

        return;
      })
      .then(() => {
        setTimeout(this.poll, currentPollingTimeout);
      })
      .catch(err => {
        console.error(err);
      });
  }

  private async processMessageBatch(messages: SQSMessage[]): Promise<void> {
    messages.forEach(message => {
      logger.info('message_received', message);
    });

    // NOTE: processes all the messages in the batch at the same time - swap to async for each if we want iterative handling
    await Promise.all(
      messages.map(async message => {
        try {
          await this.executeHandler(message);
          await this.deleteMessage(message);
        } catch (err) {
          console.error(err, message);
        }
      }),
    );
  }
}

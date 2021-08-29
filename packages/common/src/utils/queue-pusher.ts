import type {SQS} from 'aws-sdk';

const asyncForEach = async (
  array: any[],
  callback: (element: any, index?: number, arr?: any[]) => Promise<void>,
): Promise<void> => {
  for (let index = 0; index < array.length; index = index + 1) {
    await callback(array[index], index, array);
  }
};

const chunkArray = (array: any[], size: number): any[] => {
  const result = [];
  const arrayCopy = [...array];
  while (arrayCopy.length > 0) {
    result.push(arrayCopy.splice(0, size));
  }
  return result;
};

/**
 * Adds batches of messages to a queue - which are then consumed by the relevant service
 */
export const batchPushToQueue = async (args: object[], sqs: SQS, queueUrl: string): Promise<void> => {
  // Split args array into chunks of 10 (the max batch size for SQS)
  const batchedArgs = chunkArray(args, 10);

  // For each of the chunks, push to the queue
  await asyncForEach(batchedArgs, async batch => {
    await sqs
      .sendMessageBatch({
        QueueUrl: queueUrl,
        Entries: batch.map((b: object, i: number) => {
          return {
            Id: i.toString(),
            MessageBody: JSON.stringify(b),
          };
        }),
      })
      .promise();
  });
};

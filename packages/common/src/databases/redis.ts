import IORedis from 'ioredis';
import { logger } from '../utils/logger';
import { validate } from '../utils/validateEnv';

export class RedisDB {
  private readonly REDIS_HOST: string;
  private readonly REDIS_PASSWORD?: string;
  private readonly REDIS_PORT: number;
  public client?: IORedis.Redis;

  constructor() {
    this.REDIS_HOST = validate('REDIS_HOST');
    this.REDIS_PASSWORD = process.env.REDIS_PASSWORD; // Optional
    this.REDIS_PORT = parseInt(validate('REDIS_PORT'), 10)
  }

  public async connect(): Promise<IORedis.Redis> {
    this.client = new IORedis({
      password: this.REDIS_PASSWORD,
      host: this.REDIS_HOST,
      port: this.REDIS_PORT,
    })

    // await this.client.connect()

    logger.info('Redis connected')

    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect()
    }

    logger.info('Redis disconnected')
  }
}

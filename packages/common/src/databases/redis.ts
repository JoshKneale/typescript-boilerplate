import IORedis from 'ioredis';
import { logger } from '../utils/logger';
import { validate } from '../utils/validateEnv';

export class RedisDB {
  private readonly REDIS_HOSTS: string;
  private readonly REDIS_PASSWORD: string;
  private readonly REDIS_PORT: number;
  public client?: IORedis.Cluster;

  constructor() {
    this.REDIS_HOSTS = validate('REDIS_HOSTS');
    this.REDIS_PASSWORD = validate('REDIS_PASSWORD');
    this.REDIS_PORT = parseInt(validate('REDIS_PORT'), 10)
  }

  public async connect(): Promise<IORedis.Cluster> {
    const nodes = this.REDIS_HOSTS.split(',').map(host => ({ host, port: this.REDIS_PORT }));
    this.client = new IORedis.Cluster(nodes, {
      redisOptions: {
        password: this.REDIS_PASSWORD
      }
    })

    await this.client.connect()

    logger.info('Redis connected')

    return this.client;
  }
}

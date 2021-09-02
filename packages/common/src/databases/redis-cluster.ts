import IORedis from 'ioredis';
import { logger } from '../utils/logger';
import { validate } from '../utils/validateEnv';

export class RedisClusterDB {
  private readonly REDIS_CLUSTER_HOSTS: string;
  private readonly REDIS_CLUSTER_PASSWORD: string;
  private readonly REDIS_CLUSTER_PORT: number;
  public client?: IORedis.Cluster;

  constructor() {
    this.REDIS_CLUSTER_HOSTS = validate('REDIS_CLUSTER_HOSTS');
    this.REDIS_CLUSTER_PASSWORD = validate('REDIS_CLUSTER_PASSWORD');
    this.REDIS_CLUSTER_PORT = parseInt(validate('REDIS_CLUSTER_PORT'), 10)
  }

  public async connect(): Promise<IORedis.Cluster> {
    const nodes = this.REDIS_CLUSTER_HOSTS.split(',').map(host => ({ host, port: this.REDIS_CLUSTER_PORT }));
    this.client = new IORedis.Cluster(nodes, {
      redisOptions: {
        password: this.REDIS_CLUSTER_PASSWORD
      }
    })

    await this.client.connect()

    logger.info('Redis cluster connected')

    return this.client;
  }
}

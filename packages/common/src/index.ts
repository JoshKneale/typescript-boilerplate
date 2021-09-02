import { logger } from './utils/logger'

// Utils
export { validate } from './utils/validateEnv';
export { logger } from './utils/logger';
export * from './utils/constants';

// Databases
export { CassandraDB } from './databases/cassandra';
export { RedisDB } from './databases/redis';
export { RedisClusterDB } from './databases/redis-cluster';

// Errors
export { ControlledError } from './errors/controlled';

// Components


// Stores
export { exampleStaticData } from './store/example';

// Types
export * from './types/settings';

// SDKs
export * from './sdks/settings';

// Exception logging
process.on('uncaughtException', function (err) {
  logger.error(err);
  throw err;
});

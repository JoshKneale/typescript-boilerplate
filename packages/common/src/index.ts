// Utils
export { validate } from './utils/validateEnv';
export { logger } from './utils/logger';
export * from './utils/constants';

// Databases
export { CassandraDB } from './databases/cassandra';

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
    console.error(err.stack || err);
    throw err;
});

process.on('unhandledRejection', function (err) {
    console.error(err);
    throw err;
});

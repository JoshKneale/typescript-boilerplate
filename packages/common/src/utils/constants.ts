import { validate } from './validateEnv';

/**
 * Environment the process is running on
 */
export const NODE_ENV = validate('NODE_ENV');

/**
 * The port to start the service on
 */
export const PORT = parseInt(process.env.PORT || '0', 10) || 8080;

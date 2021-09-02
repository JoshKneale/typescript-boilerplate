import {ENVIRONMENT} from '../types/environment';
import {validate} from './validateEnv';

/**
 * Environment the process is running on
 */
export const NODE_ENV = validate('NODE_ENV', Object.values(ENVIRONMENT));

/**
 * The port to start the service on
 */
export const PORT = parseInt(validate('PORT'));

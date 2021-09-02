import pino from 'pino';
import {ENVIRONMENT} from '../types/environment';
import {NODE_ENV} from './constants';

export const logger = pino({
  timestamp: true,
  safe: true,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  prettyPrint:
    NODE_ENV === ENVIRONMENT.LOCAL
      ? {
          translateTime: true,
          levelFirst: true,
        }
      : false,
});

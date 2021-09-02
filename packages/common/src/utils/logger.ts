import pino from 'pino';
import { NODE_ENV } from './constants';

export const logger = pino({
  timestamp: true,
  safe: true,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  prettyPrint: NODE_ENV === 'local' ? {
    translateTime: true,
    levelFirst: true,
  } : false
});

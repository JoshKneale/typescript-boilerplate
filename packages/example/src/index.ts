import {logger, PORT} from '@example/common';
import express from 'express';
import glob from 'glob';
import {promisify} from 'util';
import {redis} from './utils/databases';
import http from 'http';

let server: http.Server;

const start = async () => {
  const app = express();

  // Connect databases
  await redis.connect();

  const globPromise = promisify(glob);
  const files = await globPromise('./routes/*.ts', {cwd: './src'});

  files.forEach(file => {
    logger.info(`Loading route from ${file}`);
    require(file.replace(/\.[^/.]+$/, '')).default(app); // eslint-disable-line @typescript-eslint/no-var-requires
  });

  server = app.listen(PORT, () => {
    logger.info(`Service started on port ${PORT}`);
  });
};

start();

const stop = async (signal: string) => {
  logger.info(`Received signal to terminate: ${signal}`);

  // Close database connections
  logger.info(`Closing database connections...`);
  await redis.disconnect();

  logger.info(`Stopping server...`);
  server.close(err => {
    if (err) {
      logger.error(err);
    }
    process.exit();
  });
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

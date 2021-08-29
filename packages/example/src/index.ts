import { logger, PORT } from '@example/common';
import express from 'express';
import glob from 'glob';
import { promisify } from 'util';
import {cassandra} from './utils/databases';

const start = async () => {
    const app = express();

    // Connect databases
    await cassandra.connect();

    const globPromise = promisify(glob)
    const files = await globPromise('./routes/*.ts', { cwd: './src' })

    files.forEach(file => {
        logger.info('Loading route from', file)
        require(file.replace(/\.[^/.]+$/, "")).default(app)
    })

    app.listen(PORT, () => {
        logger.info('Service started on port', PORT)
    })
}

start();
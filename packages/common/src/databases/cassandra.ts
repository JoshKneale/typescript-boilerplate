import cassandra, { ArrayOrObject } from 'cassandra-driver';
import { logger } from '../utils/logger';
import { validate } from '../utils/validateEnv';

export class CassandraDB {
    private readonly CASSANDRA_USERNAME: string;
    private readonly CASSANDRA_PASSWORD: string;
    private readonly CASSANDRA_KEYSPACE: string;
    private readonly CASSANDRA_CONTACT_POINTS: string;
    private readonly CASSANDRA_LOCAL_DATA_CENTER: string;
    private readonly CASSANDRA_QUERY_LOGGING_ENABLED: boolean;
    private client?: cassandra.Client;

    constructor() {
        this.CASSANDRA_USERNAME = validate('CASSANDRA_USERNAME');
        this.CASSANDRA_PASSWORD = validate('CASSANDRA_PASSWORD');
        this.CASSANDRA_KEYSPACE = validate('CASSANDRA_KEYSPACE');
        this.CASSANDRA_CONTACT_POINTS = validate('CASSANDRA_CONTACT_POINTS');
        this.CASSANDRA_LOCAL_DATA_CENTER = validate('CASSANDRA_LOCAL_DATA_CENTER');
        this.CASSANDRA_QUERY_LOGGING_ENABLED = process.env.CASSANDRA_QUERY_LOGGING_ENABLED === 'true';
    }

    public async connect(): Promise<cassandra.Client> {
        this.client = new cassandra.Client({
            credentials: {
                username: this.CASSANDRA_USERNAME,
                password: this.CASSANDRA_PASSWORD,
            },
            keyspace: this.CASSANDRA_KEYSPACE,
            contactPoints: this.CASSANDRA_CONTACT_POINTS.split(','),
            localDataCenter: this.CASSANDRA_LOCAL_DATA_CENTER,
        })

        await this.client.connect()
        logger.info('Cassandra connected')

        return this.client;
    }

    public async runQuery<T>(query: string, params: ArrayOrObject | undefined): Promise<T | undefined> {
        if (!this.client) {
            throw new Error('Cassandra client not connected. Run the "connect" method before making queries')
        }

        const startTime = new Date().getTime();

        const response = await this.client.execute(query, params, { prepare: true })

        const diff = new Date().getTime() - startTime;
        if (this.CASSANDRA_QUERY_LOGGING_ENABLED) console.log(`Cassandra query log: \n Query: ${query} \n Time: ${diff} ms`)

        return response.rows[0] as unknown as T;
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.shutdown()
        }
        logger.info('Cassandra disconnected')
    }
}

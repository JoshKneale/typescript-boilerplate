import {Pool, PoolClient} from 'pg';
import {logger} from '../utils/logger';
import {validate} from '../utils/validateEnv';

export class PostgresDB {
  private readonly PGUSER: string;
  private readonly PGHOST: string;
  private readonly PGPASSWORD: string;
  private readonly PGDATABASE: string;
  private readonly PGPORT: number;
  private readonly PG_QUERY_LOGGING_ENABLED: boolean;
  private pool?: Pool;

  constructor() {
    this.PGUSER = validate('PGUSER');
    this.PGHOST = validate('PGHOST');
    this.PGPASSWORD = validate('PGPASSWORD');
    this.PGDATABASE = validate('PGDATABASE');
    this.PGPORT = parseInt(validate('PGPORT'));
    this.PG_QUERY_LOGGING_ENABLED = process.env.PG_QUERY_LOGGING_ENABLED === 'true';
  }

  public async connect(): Promise<void> {
    this.pool = new Pool({
      host: this.PGHOST,
      user: this.PGUSER,
      password: this.PGPASSWORD,
      database: this.PGDATABASE,
      port: this.PGPORT,
    });

    await this.pool.query('SELECT NOW();');
    logger.info('Postgres connected');
  }

  public async query<T>(query: string, params: (string | number | boolean)[]): Promise<T> {
    if (!this.pool) {
      throw new Error('Postgres client not connected. Run the "connect" method before making queries');
    }

    const startTime = new Date().getTime();

    const response = await this.pool.query(query, params);

    const diff = new Date().getTime() - startTime;
    if (this.PG_QUERY_LOGGING_ENABLED) console.log(`Postgres query log: \n Query: ${query} \n Time: ${diff} ms`);

    return response as unknown as T;
  }

  /**
   * See https://node-postgres.com/features/transactions for reference of best practices
   */
  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Postgres client not connected. Run the "connect" method before making queries');
    }

    const client = await this.pool.connect();
    // const query = client.query;
    // const release = client.release;

    // // set a timeout of 5 seconds, after which we will log this client's last query
    // const timeout = setTimeout(() => {
    //   console.error('A client has been checked out for more than 5 seconds!');
    //   console.error(`The last executed query on this client was: ${client.lastQuery}`);
    // }, 5000);

    // // monkey patch the query method to keep track of the last query executed
    // client.query = (...args) => {
    //   client.lastQuery = args;
    //   return query.apply(client, args);
    // };

    // client.release = () => {
    //   // clear our timeout
    //   clearTimeout(timeout);

    //   // set the methods back to their old un-monkey-patched version
    //   client.query = query;
    //   client.release = release;
    //   return release.apply(client);
    // };

    return client;
  }

  // public async transaction<T>(): Promise<T> {
  //     if (!this.pool) {
  //         throw new Error('Postgres client not connected. Run the "connect" method before making queries')
  //     }

  //     const startTime = new Date().getTime();

  //     const client = await this.pool.connect()
  //     try {
  //       await client.query('BEGIN')
  //       const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
  //       const res = await client.query(queryText, ['brianc'])
  //       const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
  //       const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
  //       await client.query(insertPhotoText, insertPhotoValues)
  //       await client.query('COMMIT')
  //     } catch (e) {
  //       await client.query('ROLLBACK')
  //       throw e
  //     } finally {
  //       client.release()
  //     }

  //     const diff = new Date().getTime() - startTime;
  //     if (this.PG_QUERY_LOGGING_ENABLED) console.log(`Postgres query log: \n Query: ${query} \n Time: ${diff} ms`)

  //     return 1 as unknown as T;
  // }
}

import sql from 'mssql';
import {ENVIRONMENT} from '../types/environment';
import {NODE_ENV} from '../utils/constants';
import {logger} from '../utils/logger';
import {validate} from '../utils/validateEnv';

export class MsSqlDB {
  private readonly MSSQL_USER: string;
  private readonly MSSQL_PASSWORD: string;
  private readonly MSSQL_SERVER: string;
  private readonly MSSQL_DATABASE: string;
  private readonly MSSQL_POOL_MAX: string;
  private readonly MSSQL_POOL_MIN: string;
  private readonly MSSQL_QUERY_LOGGING_ENABLED: boolean;
  private client?: sql.ConnectionPool;

  constructor() {
    this.MSSQL_USER = validate('MSSQL_USER');
    this.MSSQL_PASSWORD = validate('MSSQL_PASSWORD');
    this.MSSQL_SERVER = validate('MSSQL_SERVER');
    this.MSSQL_DATABASE = validate('MSSQL_DATABASE');
    this.MSSQL_POOL_MAX = validate('MSSQL_POOL_MAX');
    this.MSSQL_POOL_MIN = validate('MSSQL_POOL_MIN');
    this.MSSQL_QUERY_LOGGING_ENABLED = process.env.MSSQL_QUERY_LOGGING_ENABLED === 'true';
  }

  public async connect(): Promise<sql.ConnectionPool> {
    this.client = new sql.ConnectionPool({
      user: this.MSSQL_USER,
      password: this.MSSQL_PASSWORD,
      server: this.MSSQL_SERVER,
      database: this.MSSQL_DATABASE,
      pool: {
        min: parseInt(this.MSSQL_POOL_MIN, 10),
        max: parseInt(this.MSSQL_POOL_MAX, 10),
      },
      options: {
        trustServerCertificate: NODE_ENV === ENVIRONMENT.LOCAL ? true : false, // change to true for local dev / self-signed certs
      },
    });

    await this.client.connect();

    logger.info('MSSQL connected');

    return this.client;
  }

  /**
   * Query builder to take advantage of the MSSQL library SQL injection logic. Each of the args is applied to the request as an 'input'.
   *
   * Be sure to use the '@' syntax in the query.
   *
   * e.g. 'SELECT * FROM mytable WHERE id = @MYVARIABLE'
   */
  public async runQuery<T>(query: string, args: Record<string, string | number | boolean>): Promise<T> {
    if (!this.client) {
      throw new Error('MSSQL client not connected. Run the "connect" method before making queries');
    }

    const request = this.client.request();

    Object.keys(args).forEach(key => {
      // Make sure key exists in query
      if (!query.includes(`@${key}`)) {
        throw new Error(`Value replacement key not found in query. \n key: ${key} \n query: ${query}`);
      }

      request.input(key, args[key]);
    });

    const startTime = new Date().getTime();

    const response = await request.query(query);

    const diff = new Date().getTime() - startTime;
    if (this.MSSQL_QUERY_LOGGING_ENABLED) console.log(`MSSQL query log: \n Query: ${query} \n Time: ${diff} ms`);

    return response.recordset as unknown as T;
  }
}

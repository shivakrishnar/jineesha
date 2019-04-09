import { ConnectionPool, IResult, ISOLATION_LEVEL, Request, Transaction } from 'mssql';
import { IQuery } from './queries/query';

/**
 * Creates a database connection pool
 * @param {string} user: The username to associated with the database
 * @param {string} password: The user's password
 * @param {string} server: The database server instance URI
 * @param {string} [database]: The database name
 * @returns {ConnectionPool}: A dedicated connection pool to the database
 */
export function createConnectionPool(user: string, password: string, server: string, database?: string): Promise<ConnectionPool> {
    console.info('services.dao.createConnection');

    const config: any = {
        user,
        password,
        server,
        database,
        port: 1433,
        options: {
            encrypt: false,
            abortTransactionOnError: true,
        },
        pool: {
            max: 2,
            min: 1,
        },
    };

    if (database) {
        config.database = database;
    }

    return new ConnectionPool(config).connect();
}

/**
 * Executes a SQL query on a given database connection
 * @param {Transaction} transaction: The connection to the database
 * @param {IQuery} query: The query to be executed
 * @returns {Promise<IResult<{}>>}: Promise of the query's execution result set
 */
export function executeQuery(transaction: Transaction, query: IQuery): Promise<IResult<any>> {
    console.info('services.dao.executeQuery');

    transaction.on('begin', () => console.info(`transaction begun: ${query.name}`));
    transaction.on('commit', () => console.info(`transaction committed: ${query.name}`));
    transaction.on('rollback', () => console.info(`transaction rolledback ${query.name}`));

    return new Promise((resolve, reject) => {
        transaction.begin(ISOLATION_LEVEL.READ_COMMITTED, (err) => {
            if (err) {
                reject(err);
            } else {
                const request = transaction.request();
                request.query(query.value, (cmdExecutionError, results) => {
                    if (cmdExecutionError) {
                        reject(cmdExecutionError);
                    } else {
                        transaction.commit((commitError) => {
                            if (commitError) {
                                reject(commitError);
                            } else {
                                console.log(`Success: ${query.name}: ${results.rowsAffected[0]} rows affected`);
                                resolve(results);
                            }
                        });
                    }
                });
            }
        });
    });
}

/**
 * Executes SQL batch statements on a given database connection
 * @param {ConnectionPool} pool: The connection to the database
 * @param {string} batchStatment: The batch statement to be executed
 */
export async function executeBatch(pool: ConnectionPool, batchStatement: string): Promise<void> {
    console.info('services.dao.executeQuery');

    const request = new Request(pool);
    const statements: string[] = batchStatement.split(/\bGO\b/g).filter((statement) => statement !== '');
    for (const statement of statements) {
        await request.batch(statement);
    }
}

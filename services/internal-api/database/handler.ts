import { Context, ProxyCallback } from 'aws-lambda';
import { IResult } from 'mssql';
import * as configService from '../../config.service';
import { ErrorMessage } from '../../errors/errorMessage';
import * as utilService from '../../util.service';
import { createConnectionPool, executeBatch, executeQuery, findConnectionString } from './database.service';
import { DatabaseEvent, QueryType } from './events';

/**
 * Executes a given query request
 * @param {DatabaseEvent} event: The request event
 * @param {Context} context: The lambda execution context
 * @param {ProxyCallback} callback: The proxy callback invoked by lambda upon execution completion
 */
export async function execute(event: DatabaseEvent, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('database.handler.executeQuery');

    console.info(`received event: ${JSON.stringify(event)}`);

    const { tenantId, queryName, query, queryType } = event;

    let pool;
    try {
        const [connectionString, credentials] = await Promise.all([
            findConnectionString(tenantId),
            utilService.getSecret(configService.getRdsCredentials()),
        ]);

        const rdsCredentials = JSON.parse(credentials);
        pool = await createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        if (queryType === QueryType.Simple) {
            const result: IResult<any> = await executeQuery(pool.transaction(), queryName, query);
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify(result),
            });
        }
        await executeBatch(pool.transaction(), query);
        return callback(undefined, {
            statusCode: 200,
            // tslint:disable no-null-keyword
            body: null,
        });
    } catch (error) {
        console.log(`Query failed to execute. Reason: ${JSON.stringify(error)}`);
        if (error instanceof ErrorMessage) {
            return callback(undefined, {
                statusCode: error.statusCode,
                body: JSON.stringify(error),
            });
        }

        return callback(JSON.stringify(error));
    } finally {
        if (pool && pool.connected) {
            pool.close();
        }
    }
}

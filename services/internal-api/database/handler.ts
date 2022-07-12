import 'reflect-metadata'; // required by asure.auth dependency

import { Context, ProxyCallback } from 'aws-lambda';
import { IResult } from 'mssql';
import * as configService from '../../config.service';
import { ErrorMessage } from '../../errors/errorMessage';
import * as utilService from '../../util.service';
import { createConnectionPool, executeBatch, executeQuery, executeStoredProcedure, findConnectionString, saveDocumentToS3 } from './database.service';
import { DatabaseEvent, QueryType } from './events';

/**
 * Executes a given query request
 * @param {DatabaseEvent} event: The request event
 * @param {Context} context: The lambda execution context
 * @param {ProxyCallback} callback: The proxy callback invoked by lambda upon execution completion
 */
export const execute = async (event: DatabaseEvent, context: Context, callback: ProxyCallback): Promise<void> => {
    console.info('database.handler.executeQuery');

    context.callbackWaitsForEmptyEventLoop = false;

    console.info(`received event: ${JSON.stringify(event)}`);

    const { tenantId, queryName, query, queryType, saveToS3 } = event;

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
            // Note: if the query that is being executed retrieves a file binary from the database,
            // the result may be too large to return to the invoking service. In these cases, we
            // will first save the document to S3 before returning an S3 pointer to the invoking service.
            if (saveToS3) {
                const { key, extension } = await saveDocumentToS3(result, tenantId);
                return callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify({
                        s3Key: key,
                        extension,
                    }),
                });
            }
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify(result),
            });
        } else if (queryType === QueryType.StoredProcedure) {
            const result: IResult<any> = await executeStoredProcedure(pool, query);
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify(result),
            });
        }
        await executeBatch(pool, query);
        return callback(undefined, {
            statusCode: 200,
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
};

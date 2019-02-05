import * as AWS from 'aws-sdk';
import * as directDepositDao from './api/direct-deposits/direct-deposit.dao';
import * as configService from './config.service';
import * as utilService from './util.service';

import { DBInstance } from 'aws-sdk/clients/rds';
import { ConnectionPool, IResult } from 'mssql';
import { getErrorResponse } from './errors/error.service';
import { ErrorMessage } from './errors/errorMessage';
import { Queries } from './queries/queries';
import { Query } from './queries/query';

export type ConnectionString = {
    rdsEndpoint: string;
    databaseName: string;
};

/**
 *  Finds the RDS instance and associated database name  a given tenant is hosted on.
 * @param {string} tenantId: The unique identifier for a tenant.
 * @return {Promise<ConnectionString>}: Returns a promise of the RDS endpoint and database name.
 */
export async function findConnectionString(tenantId: string): Promise<ConnectionString> {
    console.info('dbConnections.findConnectionString');

    const rdsClient = new AWS.RDS({
        region: configService.getAwsRegion(),
    });

    try {
        const response = await rdsClient.describeDBInstances().promise();
        const rdsInstances: string[] = response.DBInstances.map((instance: DBInstance) => {
            return instance.Endpoint.Address;
        });

        /**
         * NB: This is temporary until pre-production RDS instances switch to using
         * the tenant GUID  as database names.
         */
        if (configService.getStage() === 'development' && tenantId === 'c807d7f9-b391-4525-ac0e-31dbc0cf202b') {
            return {
                rdsEndpoint: 'hrnext.cvm5cdcqwljp.us-east-1.rds.amazonaws.com',
                databaseName: 'adhr-1',
            };
        }

        if (configService.getStage() === 'staging' && tenantId === 'c807d7f9-b391-4525-ac0e-31dbc0cf202b') {
            return {
                rdsEndpoint: 'hrnext.cf6z2vngxgsk.us-east-1.rds.amazonaws.com',
                databaseName: 'adhr-1',
            };
        }

        for (const instance of rdsInstances) {
            const databaseList: string[] = await listAvailableDatabases(instance);

            if (databaseList.includes(tenantId)) {
                return {
                    rdsEndpoint: instance,
                    databaseName: tenantId,
                };
            }
        }

        const errorMessage: ErrorMessage = getErrorResponse(50);
        errorMessage.setDeveloperMessage(`tenantId: ${tenantId} not found`);
        throw errorMessage;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(`Error determining RDS connection parameters: ${JSON.stringify(error)}`);
        throw getErrorResponse(0);
    }
}

/**
 * List all client databases with the exception of restricted system-only versions
 * within a given RDS instance. System-only databases are: master, model,
 * tempdb, msdb and rdsadmin
 * @param {string} rdsInstanceEndpoint: The RDS instance endpoint
 * @returns {Promise<string[]>}: Promise of an array of database names
 */
async function listAvailableDatabases(rdsInstanceEndpoint: string): Promise<string[]> {
    console.info('dbConnections.listAvailableDatabases');

    const restrictedDatabases = ['master', 'model', 'tempdb', 'msdb', 'rdsadmin'];
    let databaseList: string[] = [];
    let pool: ConnectionPool;

    // Filter out restricted databases
    try {
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await directDepositDao.createConnectionPool(rdsCredentials.username, rdsCredentials.password, rdsInstanceEndpoint);

        const query = new Query('DatabaseList', Queries.databaseList);
        const results: IResult<{}> = await directDepositDao.executeQuery(pool.transaction(), query);
        const recordSet = results.recordset;
        databaseList = Object.keys(recordSet)
            .map((key) => recordSet[key].name)
            .filter((database) => !restrictedDatabases.includes(database));
    } catch (error) {
        console.error('unable to list databases');
        throw error;
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }

    return databaseList;
}

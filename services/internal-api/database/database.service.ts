import * as AWS from 'aws-sdk';
import { ConnectionPool, IResult, ISOLATION_LEVEL, Request, Transaction } from 'mssql';
import * as configService from '../../config.service';
import * as utilService from '../../util.service';

import { DBInstance } from 'aws-sdk/clients/rds';
import { getErrorResponse } from '../../errors/error.service';
import { ErrorMessage } from '../../errors/errorMessage';
import { Queries } from '../../queries/queries';
import { Query } from '../../queries/query';
import { ConnectionString } from './events';

/**
 * Creates a database connection pool
 * @param {string} user: The username to associated with the database
 * @param {string} password: The user's password
 * @param {string} server: The database server instance URI
 * @param {string} [database]: The database name
 * @returns {ConnectionPool}: A dedicated connection pool to the database
 */
export function createConnectionPool(user: string, password: string, server: string, database?: string): Promise<ConnectionPool> {
    console.info('database.service.createConnectionPool');

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
 * Executes a SQL query within a transaction on a given database connection
 * @param {Transaction} transaction: The connection to the database
 * @param {string} query: The name of query to be executed
 * @param {string} query: The SQL-string representation of the query
 * @returns {Promise<IResult<{}>>}: Promise of the query's execution result set
 */
export function executeQuery(transaction: Transaction, name: string, query: string): Promise<IResult<any>> {
    console.info('database.service.executeQuery');

    transaction.on('begin', () => console.info(`transaction begun: ${name}`));
    transaction.on('commit', () => console.info(`transaction committed: ${name}`));
    transaction.on('rollback', () => console.info(`transaction rolledback ${name}`));

    return new Promise((resolve, reject) => {
        transaction.begin(ISOLATION_LEVEL.READ_COMMITTED, (err) => {
            if (err) {
                reject(err);
            } else {
                const request = transaction.request();
                request.query(query, (cmdExecutionError, results) => {
                    if (cmdExecutionError) {
                        reject(cmdExecutionError);
                    } else {
                        transaction.commit((commitError) => {
                            if (commitError) {
                                reject(commitError);
                            } else {
                                console.log(`Success: ${name}: ${results.rowsAffected[0]} rows affected`);
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
 * Executes a stored procedure on a given database connection
 * @param {ConnectionPool} pool: The connection to the database
 * @param {string} query: The SQL-string representation of the query
 * @returns {Promise<IResult<{}>>}: Promise of the stored procedure's execution result set
 */
 export async function executeStoredProcedure(pool: ConnectionPool, query: string): Promise<IResult<any>> {
    console.info('database.service.executeStoredProcedure');

    const request = new Request(pool);
    return await request.query(query);
}

/**
 * Executes SQL batch statements on a given database connection
 * @param {ConnectionPool} pool: The connection to the database
 * @param {string} batchStatment: The batch statement to be executed
 */
export async function executeBatch(pool: ConnectionPool, batchStatement: string): Promise<void> {
    console.info('database.service.executeBatch');

    const request = new Request(pool);
    const statements: string[] = batchStatement.split(/\bGO\b/g).filter((statement) => statement !== '');
    for (const statement of statements) {
        await request.batch(statement);
    }
}

/**
 * List all client databases with the exception of restricted system-only versions
 * within a given RDS instance. System-only databases are: master, model,
 * tempdb, msdb and rdsadmin
 * @param {string} rdsInstanceEndpoint: The RDS instance endpoint
 * @returns {Promise<string[]>}: Promise of an array of database names
 */
export async function listAvailableDatabases(rdsInstanceEndpoint: string): Promise<string[]> {
    console.info('database.service.listAvailableDatabases');

    const restrictedDatabases = ['master', 'model', 'tempdb', 'msdb', 'rdsadmin'];
    let databaseList: string[] = [];
    let pool: ConnectionPool;

    // Filter out restricted databases
    try {
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await createConnectionPool(rdsCredentials.username, rdsCredentials.password, rdsInstanceEndpoint);

        const query = new Query('DatabaseList', Queries.databaseList);
        const results: IResult<{}> = await executeQuery(pool.transaction(), query.name, query.value);
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

/**
 *  Finds the RDS instance and associated database name  a given tenant is hosted on.
 * @param {string} tenantId: The unique identifier for a tenant.
 * @return {Promise<ConnectionString>}: Returns a promise of the RDS endpoint and database name.
 */
export async function findConnectionString(tenantId: string): Promise<ConnectionString> {
    console.info('database.service.findConnectionString');

    const rdsClient = new AWS.RDS({
        region: configService.getAwsRegion(),
    });

    try {
        const response = await rdsClient.describeDBInstances().promise();
        console.info('RDS instances: ', response.DBInstances);

        //filter out RDS instances that are not in 'available' status (e.g. 'creating', 'deleting', etc.)
        const availableInstances: DBInstance[] = response.DBInstances.filter((instance: DBInstance) => {
            return instance.DBInstanceStatus === 'available';
        });
        console.info('RDS instances in available status: ', availableInstances);

        const rdsInstances: string[] = availableInstances.map((instance: DBInstance) => {
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
        console.error(`Error determining RDS connection parameters: ${JSON.stringify(error)}`);
        throw error;
    }
}

const s3Client = new AWS.S3({
    region: configService.getAwsRegion(),
    useAccelerateEndpoint: true,
});

/**
 * Uploads a file to S3 along with the document's metadata.
 * @param {IResult<any>} databaseRecord: The document record that was retrieved from the database
 * @param {string} tenantId: The unique identifier of the tenant
 * @returns {Promise<any>}: Promise of an object that contains the key that points to the file in S3 and the file extension.
 */
export async function saveDocumentToS3(databaseRecord: IResult<any>, tenantId: string): Promise<any> {
    console.info('database.service.saveDocumentToS3');

    try {
        if (databaseRecord.recordset.length > 0) {
            const {
                ID: documentId,
                CompanyID: companyId,
                EmployeeID: employeeId,
                EmployeeName: employeeName,
                EmployeeCode: employeeCode,
                Filename: fileName,
                FSDocument: file,
                ContentType: contentType,
                Extension: extension,
                Title: title,
                IsPrivateDocument: isPrivate,
                UploadByUsername: uploadedBy,
                IsPublishedToEmployee: isPublishedToEmployee,
            } = databaseRecord.recordset[0];
            const uploadS3Filename = fileName.replace(/[^a-zA-Z0-9.]/g, '');

            let key;
            let employeeMetadata;
            if (companyId) {
                key = `${tenantId}/${companyId}`;
                if (employeeId) {
                    key = key + `/${employeeId}`;
                    if (isPublishedToEmployee) {
                        employeeMetadata = {
                            employeeId: employeeId.toString(),
                            employeeName,
                            employeeCode,
                        };
                    }
                }
                key = key + `/${uploadS3Filename}`;
                key = utilService.sanitizeForS3(key);
            }

            if (key) {
                // Check for file existence to avoid overwritting - duplicates allowed.
                const [updatedFilename, s3UploadKey] = await utilService.checkForFileExistence(
                    key,
                    uploadS3Filename,
                    tenantId,
                    companyId,
                    employeeId,
                );

                const fileBuffer = new Buffer(file, 'base64');
                const metadata = {
                    fileName: updatedFilename,
                    title: title || '',
                    isPrivate: isPrivate.toString(),
                    uploadedBy,
                    tenantId,
                    companyId: companyId.toString(),
                    documentId: documentId.toString(),
                    isLegacyDocument: 'true',
                    ...employeeMetadata,
                };
                s3Client
                    .upload({
                        Bucket: configService.getFileBucketName(),
                        Key: s3UploadKey,
                        Body: fileBuffer,
                        Metadata: metadata,
                        ContentEncoding: 'base64',
                        ContentType: contentType,
                    })
                    .promise()
                    .catch((e) => {
                        throw new Error(e);
                    });
                key = s3UploadKey;
            }
            return { key, extension };
        } else {
            throw new Error('Not found');
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

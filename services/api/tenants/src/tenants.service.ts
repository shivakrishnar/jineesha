import * as AWS from 'aws-sdk';
import * as stripBom from 'strip-bom';

import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as ssoService from '../../../remote-services/sso.service';

import * as utilService from '../../../util.service';

import { DBInstance } from 'aws-sdk/clients/rds';
import { ConnectionPool } from 'mssql';

import { ErrorMessage } from '../../../errors/errorMessage';
import { SecurityContext } from '../../../internal-api/authentication/securityContext';
import * as databaseService from '../../../internal-api/database/database.service';
import { IPayrollApiCredentials } from '../../models/IPayrollApiCredentials';
import { SsoAccount } from '../../../remote-services/sso.service';

const teamsGood = '#4caf50';
/**
 * Adds the HR Global administrator account to a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} accountId: The identifier of the principal's SSO account invoking the action
 * @param {string}  accessToken: The access token authorizing the action
 */
export async function addHrGlobalAdminAccount(tenantId: string, accountId: string, accessToken: string): Promise<void> {
    console.info('tenants.service.addHrGlobalAdminAccount');

    try {
        const { evoApiUsername, evoApiPassword }: IPayrollApiCredentials = JSON.parse(
            await utilService.getSecret(configService.getPayrollApiCredentials()),
        );

        const accountDetails: SsoAccount = {
            username: evoApiUsername,
            password: evoApiPassword,
            email: evoApiUsername, // Within SSO the Global Admin username = email address
            givenName: 'AHR Global',
            surname: 'Admin',
        };

        // Note: Ideally, it would be preferable to check for the existence of the account before creation.
        //       However, SSO account-related apis only support querying for an account by id and not username or email.
        const createdAccount = await ssoService.createSsoAccount(tenantId, accountDetails, accessToken);
        await ssoService.addRoleToAccount(tenantId, createdAccount.id, configService.getEvoHrGlobalAdmin(), accessToken);
        await ssoService.addRoleToAccount(tenantId, createdAccount.id, configService.getTlmReadRole(), accessToken);
        await ssoService.addRoleToAccount(tenantId, createdAccount.id, configService.getTlmWriteRole(), accessToken);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        throw errorService.getErrorResponse(0);
    }
}

export type TenantDatabase = {
    id: string;
    name: string;
    subdomain: string;
};

/**
 * Creates a tenant database in RDS
 * @param {TenantDatabase} dbInfo: The details of the tenant database to create
 */
export async function addRdsDatabase(dbInfo: TenantDatabase, securityContext: SecurityContext): Promise<void> {
    console.info('tenants.service.addRdsDatabase');

    const stepFunctions = new AWS.StepFunctions();
    const {
        principal: { id: accountId },
        accessToken,
    } = securityContext;
    const params = {
        stateMachineArn: configService.getHrDatabaseCreatorStateMachineArn(),
        input: JSON.stringify({
            dbInfo,
            accountId,
            accessToken,
        }),
    };

    await stepFunctions.startExecution(params).promise();
}

/**
 * Checks for the existence of a tenant across available RDS instances
 * @param {string} tenantId: The unique identifier of the tenant.
 * @returns {Promise<boolean>}: A boolean Promise indicating whether the tenant exists
 */
export async function exists(tenantId: string): Promise<boolean> {
    console.info('tenants.service.exists');
    try {
        await databaseService.findConnectionString(tenantId);
        return true; // tenant already exists
    } catch (error) {
        return false;
    }
}

/**
 *  Selects the RDS instance with the fewest databases
 * @returns {Promise<string>}: A promise of the RDS instance with the fewest databases
 */
export async function rdsDatabasePlacement(): Promise<string> {
    console.info('tenants.service.rdsDatabasePlacement');

    const rdsClient = new AWS.RDS({
        region: configService.getAwsRegion(),
    });

    const maxDatabasesPerRdsInstance = 100;

    try {
        const response = await rdsClient.describeDBInstances().promise();
        const rdsInstances: string[] = response.DBInstances.map((instance: DBInstance) => {
            return instance.Endpoint.Address;
        });

        let chosenInstance: string = rdsInstances[0];
        let chosenInstanceDbCount = (await databaseService.listAvailableDatabases(chosenInstance)).length;

        for (const instance of rdsInstances) {
            const dbCount = (await databaseService.listAvailableDatabases(instance)).length;
            if (dbCount < chosenInstanceDbCount) {
                chosenInstanceDbCount = dbCount;
                chosenInstance = instance;
            }
        }

        /*
        Note: By default, AWS customers are allowed to have up to a total of 40
              Amazon RDS DB instances. Of those 40, up to 10 can be Oracle or
              SQL Server DB Instances under the "License Included" model.
              Each RDS instance can contain a max of 100 databases.
              https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_SQLServer.html
        */
        if (chosenInstanceDbCount === maxDatabasesPerRdsInstance) {
            throw errorService
                .getErrorResponse(0)
                .setDeveloperMessage('Max database count reached')
                .setMoreInfo(`RDS (SQL Server) supports a max of ${maxDatabasesPerRdsInstance} databases per instance`);
        }

        return chosenInstance;
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

const s3Client = new AWS.S3({
    region: configService.getAwsRegion(),
});

/**
 *  Executes a series of btach statements on a given database connection.
 * @param {string} s3FilePath: The path to the object within an S3 Bucket
 * @param {ConnectionPool} pool: The connection to the database.
 */
async function applyDatabaseSchemaScript(s3FilePath: string, pool: ConnectionPool): Promise<void> {
    console.info('tenants.service.applyDatabaseSchemaScript');

    const data = await s3Client
        .getObject({
            Bucket: `${configService.getStage()}.hr.database-schema-scripts`,
            Key: s3FilePath,
        })
        .promise();

    const script = data.Body.toString();
    await databaseService.executeBatch(pool, stripBom(script));
}

/**
 * Executes all SQL scripts found in the specified folder
 * @param {string} s3FolderPath: The path to the S3 folder containing scripts to the executed.
 * @param {ConnectionPool} pool: The connection to the database.
 */
async function applyScriptsInS3Folder(s3FolderPath: string, pool: ConnectionPool): Promise<void> {
    console.info('tenants.service.applyScriptsInS3Folder');
    const folderScripts = await s3Client
        .listObjects({
            Bucket: `${configService.getStage()}.hr.database-schema-scripts`,
            Marker: `${s3FolderPath}/`,
        })
        .promise();

    const sqlScriptFilePathUris: string[] = folderScripts.Contents.map((item) => item.Key);
    for (const scriptS3Path of sqlScriptFilePathUris) {
        console.info(`applying script at: ${scriptS3Path}`);
        await applyDatabaseSchemaScript(scriptS3Path, pool);
    }
}

/**
 * Builds a Teams message attachment
 * {@link https://docs.microsoft.com/en-us/microsoftteams/platform/}
 * @param {TenantDatabase} dbInfo: The created tenant database details
 * @param {string} rdsInstance: The RDS instance a tenant was created on
 * @param {string} title: Title to be used for the notification
 * @param {string} themeColor: color in hex format for Teams notification border
 * @returns {string}:  A formatted Teams message attachment
 */
export function buildMessageAttachment(dbInfo: TenantDatabase, rdsInstance: string, title: string, themeColor: string): string {
    console.info('tenants.service.buildMessageAttachment');

    const messageAttachment = {
        title,
        text: `<div>Tenant ID: ${dbInfo.id}</div><div>Tenant URL: ${
            dbInfo.subdomain
        }.${configService.getDomain()}</div><div>RDS Instance: ${rdsInstance}</div><div>Environment: ${configService.getStage()}</div>`,
        themeColor,
    };

    return JSON.stringify(messageAttachment);
}

function createConnectionString(dbInfo: TenantDatabase, rdsInstance: string): any {
    console.info('tenants.service.createConnectionString');

    const dbConnectionString = `data source=${rdsInstance};initial catalog=${dbInfo.id};`;
    const domain = `${dbInfo.subdomain}.${configService.getDomain()}`;
    const tenantId = `${dbInfo.id}`;

    return {
        ConnectionString: dbConnectionString,
        Domain: domain,
        TenantID: tenantId,
    };
}

async function addConnectionString(dbInfo: TenantDatabase, rdsInstance: string): Promise<void> {
    console.info('tenants.service.addConnectionString');

    const connectionString = createConnectionString(dbInfo, rdsInstance);

    const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'ConnectionStrings',
        Item: connectionString,
    };

    await dynamoDbClient.put(params).promise();
}

/**
 * Publishes a message to an SNS topic
 * @param {string} message: The message to publish
 * @returns {Promise}: Promise of message publication result
 */
export async function publishMessage(message: any): Promise<void> {
    console.info('tenants.service.publishMessage');
    const sns = new AWS.SNS();
    const params = {
        Message: message,
        Subject: 'RDS Database Creation',
        TopicArn: `${configService.getTeamNotificationTopicArn()}`,
    };

    sns.publish(params).promise();
}

/**
 * Creates a tenant database on a given RDS instance.
 * @param {string} rdsEndpoint: The url of the RDS instance that will host the database
 * @param {TenantDatase} dbInfo: The tenant database to be created
 */
export async function createRdsTenantDb(rdsEndpoint: string, dbInfo: TenantDatabase): Promise<TenantDatabase> {
    console.info('tenants.service.createRdsTenantDb');

    let pool: ConnectionPool;

    try {
        let data = await s3Client
            .getObject({
                Bucket: `${configService.getStage()}.hr.database-schema-scripts`,
                Key: 'create-tenant-db.sql',
            })
            .promise();

        const createDbScript = data.Body.toString().replace(/(HR_TENANT_ID)/g, dbInfo.id);

        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));
        pool = await databaseService.createConnectionPool(rdsCredentials.username, rdsCredentials.password, rdsEndpoint);
        await databaseService.executeBatch(pool, createDbScript);

        // Close existing connection since it's connected to the master db
        if (pool && pool.connected) {
            await pool.close();
        }

        // Connect to newly created database
        pool = await databaseService.createConnectionPool(rdsCredentials.username, rdsCredentials.password, rdsEndpoint, dbInfo.id);

        // Create database tables &  stored procedures
        await applyScriptsInS3Folder('dbo', pool);

        // Post deployment script (auth-setup.sql)
        data = await s3Client
            .getObject({
                Bucket: `${configService.getStage()}.hr.database-schema-scripts`,
                Key: 'auth-setup.sql',
            })
            .promise();

        const postDeploymentScript = data.Body.toString()
            .replace(/(NEW_HR_TENANT_ID)/g, dbInfo.id)
            .replace(/(NEW_HR_TENANT_NAME)/g, dbInfo.name.toLowerCase())
            .replace(/(NEW_HR_TENANT_SUBDOMAIN)/g, dbInfo.subdomain.toLowerCase())
            .replace(/(API_DOMAIN)/g, configService.getApiDomain())
            .replace(/(DOMAIN)/g, configService.getDomain())
            .replace(/(PAYROLL_BASE_URL)/g, configService.getPayrollBaseUrl());

        console.info('executing auth-setup.sql...');
        await databaseService.executeBatch(pool, stripBom(postDeploymentScript));

        // Send notification of successful creation:
        const success = buildMessageAttachment(dbInfo, rdsEndpoint, 'RDS Database Creation', teamsGood);
        await addConnectionString(dbInfo, rdsEndpoint);
        await publishMessage(success);
        return dbInfo;
    } catch (error) {
        console.error(error);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

//Old code for Slack
// export function buildMessageAttachment(dbInfo: TenantDatabase, rdsInstance: string, title: string, color: string): string {
//     console.info('tenants.service.buildMessageAttachment');

//     const messageAttachment = {
//         attachments: [
//             {
//                 fallback: 'RDS Database Creation',
//                 color,
//                 title,
//                 fields: [
//                     {
//                         title: 'Tenant ID',
//                         value: `${dbInfo.id}`,
//                         short: true,
//                     },
//                     {
//                         title: 'Tenant URL',
//                         value: `${dbInfo.subdomain}.${configService.getDomain()}`,
//                         short: true,
//                     },
//                     {
//                         title: 'RDS Instance',
//                         value: rdsInstance,
//                         short: true,
//                     },
//                     {
//                         title: 'Environment',
//                         value: `${configService.getStage()}`,
//                         short: true,
//                     },
//                 ],
//                 footer: 'Mojojojo',
//             },
//         ],
//     };

//     return JSON.stringify(messageAttachment);
// }

/**
 * Returns the connection string data for a given tenant
 * @param {string} tenantId: The tenantId to find
 * @returns {Promise}: Promise of the connection string data
 */
export async function getConnectionStringByTenant(tenantId: string): Promise<any> {
    console.info('tenants.service.getConnectionStringByTenant: ', tenantId);
    const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'ConnectionStrings',
        IndexName: 'tenantId-index',
        KeyConditionExpression: 'TenantID = :TenantID',
        ExpressionAttributeValues: {
            ':TenantID': tenantId,
        },
    };
    try {
        const { Items } = await dynamoDbClient.query(params).promise();
        return Items.length > 0 ? Items : { statusCode: 204, headers: new Headers() };
    } catch (error) {
        console.error(error);
    }
}

/**
 * Returns the connection string data for a given tenant
 * @returns {Promise}: Promise of the connection string data
 */
export async function listConnectionStrings(): Promise<any> {
    console.info('tenants.service.listConnectionStrings');
    const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'ConnectionStrings',
        IndexName: 'tenantId-index',
    };
    try {
        return dynamoDbClient.scan(params).promise();
    } catch (error) {
        console.error(error);
    }
}

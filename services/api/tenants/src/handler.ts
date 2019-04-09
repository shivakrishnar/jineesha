import * as utilService from '../../../util.service';
import * as tenantService from './tenants.service';

import * as UUID from '@smallwins/validate/uuid';
import { IGatewayEventInput } from '../../../util.service';
import { Headers } from '../../models/headers';

import { Context, ProxyCallback } from 'aws-lambda';
import { IAccount } from '../../../internal-api/authentication/account';
import { IPayrollApiCredentials } from '../../models/IPayrollApiCredentials';

const headerSchema = {
    authorization: { required: true, type: String },
};

const adminsUriSchema = {
    tenantId: { required: true, type: UUID },
};

const createTenantDbSchema = {
    id: { required: true, type: UUID },
    name: { required: true, type: String },
    subdomain: { required: true, type: String },
};

/**
 * Adds an SSO global admin account to a specified tenant
 */
export const addAdmin = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('tenants.handler.addAdmin');

    securityContext.requireAsureAdmin();

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);

    const { tenantId } = event.pathParameters;
    const account: IAccount = securityContext.principal;
    const accessToken = event.headers.authorization.replace(/Bearer /i, '');
    const globalAdminCredentials: IPayrollApiCredentials = securityContext.payrollApiCredentials;

    await tenantService.addHrGlobalAdminAccount(tenantId, account.id, accessToken, globalAdminCredentials);

    return { statusCode: 204, headers: new Headers() };
});

/**
 * Creates a tenant in an available RDS instance
 */
export const addTenantDb = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('tenants.handler.addTenantDb');

    // Note: this is the guards against at-will creation of databases in the Production tier
    securityContext.requireAsureAdmin();

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(requestBody, createTenantDbSchema);
    utilService.checkAdditionalProperties(createTenantDbSchema, requestBody, 'Tenant DB');

    await tenantService.addRdsDatabase(requestBody);

    return { statusCode: 204, headers: new Headers() };
});

/**
 *  Checks for a tenants existence
 */
export async function checkTenantExistence(event: any, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('tenants.handler.checkTenantExistence');

    try {
        const tenantId = event.dbInfo.id;
        const exists: boolean = await tenantService.exists(tenantId);
        return exists ? callback('tenant exists') : callback(undefined, { statusCode: 200, body: JSON.stringify('tenant not found') });
    } catch (error) {
        console.error(`unable to check if tenant exists. Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
}

/**
 *  Determines RDS instance a new tenant is to be created on
 */
export async function dbPlacement(event: any, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('tenants.handler.dbPlacement');

    console.info(`received event: ${JSON.stringify(event)}`);

    try {
        const rdsInstanceEndpoint: string = await tenantService.rdsDatabasePlacement();
        return callback(undefined, {
            statusCode: 200,
            body: rdsInstanceEndpoint,
        });
    } catch (error) {
        console.error(`unable to determine RDS for database placement: ${JSON.stringify(error)}`);
        return callback(error);
    }
}

/**
 *  creates a tenant on an RDS instance
 */
export async function createRdsTenantDb(event: any, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('tenants.handler.createRdsTenantDb');

    console.info(`received event: ${JSON.stringify(event)}`);

    const rdsEndpoint: string = event.placement.body;

    try {
        await tenantService.createRdsTenantDb(rdsEndpoint, event.dbInfo);
        return callback(undefined, {
            statusCode: 200,
            body: JSON.stringify('tenant db successfully created'),
        });
    } catch (error) {
        return callback(error);
    }
}

/**
 *  handles errors
 *  TODO: In future we want this serve as a generic error handler for
 *        the tenant database creation state machine. This might involve deleting
 *        a partially created database and needs some thought around that.
 */
export async function errorHandler(event: any, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('tenants.handler.errorHandler');

    console.info(`received event: ${JSON.stringify(event)}`);

    try {
        const message = 'message successfully received';
        console.log(message);
        return callback(undefined, {
            statusCode: 200,
            body: JSON.stringify(message),
        });
    } catch (error) {
        console.log('message sending failed');
        return callback(error);
    }
}

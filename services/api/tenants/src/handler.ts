import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as companyService from './company.service';
import * as employeeService from './employee.service';
import * as tenantService from './tenants.service';

import * as UUID from '@smallwins/validate/uuid';
import { IGatewayEventInput } from '../../../util.service';
import { Headers } from '../../models/headers';

import { Context, ProxyCallback } from 'aws-lambda';
import { IAccount } from '../../../internal-api/authentication/account';
import { SecurityPolicyAuthorizer } from '../../../internal-api/authentication/securityPolicyAuthorizer';
import { Role } from '../../models/Role';

const headerSchema = {
    authorization: { required: true, type: String },
};

const adminsUriSchema = {
    tenantId: { required: true, type: UUID },
};

const companyUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
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

    securityContext.requireRole(Role.asureAdmin);

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);

    const { tenantId } = event.pathParameters;
    const account: IAccount = securityContext.principal;
    const accessToken = event.headers.authorization.replace(/Bearer /i, '');

    await tenantService.addHrGlobalAdminAccount(tenantId, account.id, accessToken);

    return { statusCode: 204, headers: new Headers() };
});

/**
 * Creates a tenant in an available RDS instance
 */
export const addTenantDb = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('tenants.handler.addTenantDb');
    const { id: tenantId } = requestBody;
    // Note: this is the guards against at-will creation of databases in the Production tier
    const isAsureAdmin = securityContext.roleMemberships.some((role) => role === Role.asureAdmin);
    const requiredPolicy = {
        action: 'tenant:add-ahr-database',
        resource: `tenants/${tenantId}`,
    };

    if (!isAsureAdmin && !new SecurityPolicyAuthorizer(securityContext.policy).isAuthorizedTo(requiredPolicy)) {
        throw errorService
            .getErrorResponse(20)
            .setMoreInfo(
                `This user does not have the required role - asure-admin or the required policy ${JSON.stringify(
                    requiredPolicy,
                )} - to use this endpoint.`,
            );
    }

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(requestBody, createTenantDbSchema);
    utilService.checkAdditionalProperties(createTenantDbSchema, requestBody, 'Tenant DB');

    await tenantService.addRdsDatabase(requestBody, securityContext);

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
 * Invoked from the HrDatabaseCreator step function, Adds an SSO global admin account to a specified tenant
 */

export async function addAdminAccount(event: any, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('tenants.handler.addAdminAccount');

    console.info(`received event: ${JSON.stringify(event)}`);

    try {
        const {
            accountId,
            accessToken,
            dbInfo: { id: tenantId },
        } = event;

        await tenantService.addHrGlobalAdminAccount(tenantId, accountId, accessToken);
        return callback(undefined, { statusCode: 200, body: JSON.stringify('Admin account created') });
    } catch (error) {
        console.error(`Unable to create admin account. Reason: ${JSON.stringify(error)}`);
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

/**
 * Returns a listing of the companies a user has access to.
 */
export const companyList = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('tenants.handler.companyList');

    const { tenantId } = event.pathParameters;
    const email = securityContext.principal.email;

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await companyService.list(tenantId, email, domainName, path, queryStringParameters);
});

/**
 * Returns a listing of the employees a user has access to under a tenant.
 */
export const listEmployeesByTenant = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('tenants.handler.listEmployeesByTenant');

    const { tenantId } = event.pathParameters;
    const email = securityContext.principal.email;

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return role === Role.globalAdmin || role === Role.serviceBureauAdmin || role === Role.superAdmin;
    });

    if (!isAuthorized) {
        return errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await employeeService.listByTenant(tenantId, email, securityContext.roleMemberships, domainName, path, queryStringParameters);
});

/**
 * Returns a listing of the employees a user has access to under a company.
 */
export const listEmployeesByCompany = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('tenants.handler.listEmployeesByCompany');

    const { tenantId, companyId } = event.pathParameters;
    const email = securityContext.principal.email;

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.hrManager ||
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        return errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await employeeService.listByCompany(
        tenantId,
        companyId,
        email,
        securityContext.roleMemberships,
        domainName,
        path,
        queryStringParameters,
    );
});

/**
 * Returns a listing of the roles that the user belongs to
 */
export const listUserRoles = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('tenants.handler.listUserRoles');
    return { roles: securityContext.roleMemberships };
});

/**
 * Returns the connection string for a given tenant stored in DynamoDB
 */
export const getConnectionStringByTenant = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('tenants.handler.getConnectionStringByTenant');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);

    const isAsureAdmin = securityContext.roleMemberships.some((role) => role === Role.asureAdmin);
    const action = 'tenant:list-ahr-connection-strings';

    if (!isAsureAdmin && !new SecurityPolicyAuthorizer(securityContext.policy).isAuthorizedTo({ action })) {
        throw errorService
            .getErrorResponse(20)
            .setMoreInfo(
                `This user does not have the required role - asure-admin or the required policy action ${action} - to use this endpoint.`,
            );
    }
    try {
        const { tenantId } = event.pathParameters;
        return await tenantService.getConnectionStringByTenant(tenantId);
    } catch (error) {
        console.error(error);
    }
});

/**
 * Returns a listing of the connection strings stored in DynamoDB
 */
export const listConnectionStrings = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('tenants.handler.listConnectionStrings');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);

    const isAsureAdmin = securityContext.roleMemberships.some((role) => role === Role.asureAdmin);
    const action = 'tenant:list-ahr-connection-strings';

    if (!isAsureAdmin && !new SecurityPolicyAuthorizer(securityContext.policy).isAuthorizedTo({ action })) {
        throw errorService
            .getErrorResponse(20)
            .setMoreInfo(
                `This user does not have the required role - asure-admin or the required policy action ${action} - to use this endpoint.`,
            );
    }
    return await tenantService.listConnectionStrings();
});

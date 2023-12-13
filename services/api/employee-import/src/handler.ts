import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as employeeImportService from './EmployeeImport.Service';
import * as UUID from '@smallwins/validate/uuid';

import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';
import { Context, ProxyCallback } from 'aws-lambda';

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

const dataImportTypeUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    dataImportTypeId: { required: true, type: String },
};

const dataImportEventDetailUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    dataImportId: { required: true, type: String },
};

const getTemplateUriSchema = {
    tenantId: { required: true, type: String },
    dataImportTypeId: { required: true, type: String },
};

const saveFileHeaderUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
};

const saveFileBodySchema = {
    fileName: { required: true, type: String },
};

const dataImportsUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
};

const dataImportsBodySchema = {
    dataImportTypeId: { required: true, type: String },
    fileName: { required: true, type: String },
    userId: { required: true, type: Number },
};

const employeeUpdateBodySchema = {
    row: { required: true, type: null },
    rowNumber: { required: true, type: Number },
    tenantId: { required: true, type: String },
    companyId: { required: true, type: String },
    dataImportTypeId: { required: true, type: String },
    dataImportEventId: { required: true, type: String }
};

/**
 * Returns the data import types from the specific Tenant
 */
export const getDataImportTypes = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('employee-import.handler.getDataImportTypes');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);
    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId } = event.pathParameters;

    return await employeeImportService.listDataImportTypes(tenantId);
});

/**
 * Returns the data imports from the specific Tenant and Company
 */
export const getDataImportEvent = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('employee-import.handler.getDataImportEvent');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyUriSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, companyId } = event.pathParameters;
    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await employeeImportService.listDataImports(tenantId, companyId, '', queryStringParameters, domainName, path);
});

/**
 * Returns the data imports from the specific Tenant, Company and Data Import Type
 */
export const getDataImportEventByType = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('employee-import.handler.getDataImportEventByType');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, dataImportTypeUriSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, companyId, dataImportTypeId } = event.pathParameters;
    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await employeeImportService.listDataImports(tenantId, companyId, dataImportTypeId, queryStringParameters, domainName, path);
});

/**
 * Returns the data event details from the specific event
 */
export const getDataImportEventDetails = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('employee-import.handler.getDataImportEventDetails');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, dataImportEventDetailUriSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, companyId, dataImportId } = event.pathParameters;
    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await employeeImportService.listDataImportEventDetails(
        tenantId,
        companyId,
        dataImportId,
        queryStringParameters,
        domainName,
        path,
    );
});

/**
 * Returns the file from the AWS S3
 */
export const getTemplate = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('employee-import.handler.getTemplate');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, getTemplateUriSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, dataImportTypeId } = event.pathParameters;

    return await employeeImportService.getTemplate(tenantId, dataImportTypeId);
});

/**
 * Returns a signed URL
 */
export const uploadUrl = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('employee-import.handler.uploadUrl');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, saveFileHeaderUriSchema);

    await utilService.requirePayload(requestBody);
    utilService.validateAndThrow(requestBody, saveFileBodySchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, companyId } = event.pathParameters;
    const { fileName } = requestBody;

    utilService.validateExtensions(fileName, ['csv']);

    return await employeeImportService.uploadUrl(tenantId, companyId, fileName);
});

/**
 * Get the CSV file from S3 and import into the database
 */
export const dataImports = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('employee-import.handler.dataImports');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, dataImportsUriSchema);

    const hrAccessToken = event.headers.authorization.replace(/Bearer /i, '');

    await utilService.requirePayload(requestBody);
    utilService.validateAndThrow(requestBody, dataImportsBodySchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, companyId } = event.pathParameters;
    const { dataImportTypeId, fileName, userId } = requestBody;

    utilService.validateExtensions(fileName, ['csv']);

    return await employeeImportService.dataImports(tenantId, companyId, dataImportTypeId, fileName, userId, hrAccessToken);
});

/**
 * Set 'Processing' in the Employee Import record
 */
export const setProcessingStatusGlobal = async (event: any, context: Context, callback: ProxyCallback) => {
    try {
        console.info('employee-import.handler.setProcessingStatusGlobal');
        console.info(`employee-import.handler.received event: ${JSON.stringify(event)}`);

        const { tenantId, dataImportEventId, dataImportTypeId, hrAccessToken } = event;

        console.log('Variables parsed');

        employeeImportService.setDataImportEventStatusGlobal(tenantId, dataImportEventId, dataImportTypeId, 'Processing', 1, hrAccessToken);

        console.log('Status processed');

        return callback(undefined, event);
    } catch (error) {
        console.error(`Unable to set Processing status to DataImportEvent data. Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
};

/**
 * Set 'Completed', 'Partially Processed' or 'Failed' status in the Employee Import record
 * A notification will be send to the user with the result
 */
export const setCompletedStatusGlobal = async (event: any, context: Context, callback: ProxyCallback) => {
    try {
        console.info('employee-import.handler.setCompletedStatusGlobal');
        console.info(`employee-import.handler.received event: ${JSON.stringify(event)}`);

        const { tenantId, dataImportEventId, dataImportTypeId, hrAccessToken } = event;

        console.log('Variables parsed');

        employeeImportService.processFinalStatusAndNotify(tenantId, dataImportEventId, dataImportTypeId, hrAccessToken);

        return callback(undefined, { statusCode: 200, body: JSON.stringify('Employee import completed') });
    } catch (error) {
        console.error(`Unable to set completed status to Employee import process. Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
};

/**
 * Set 'Failed' in the Employee Import record
 */
export const setFailedStatusGlobal = async (event: any, context: Context, callback: ProxyCallback) => {
    try {
        console.info('employee-import.handler.setFailedStatusGlobal');
        console.info(`employee-import.handler.received event: ${JSON.stringify(event)}`);

        const { tenantId, dataImportEventId, errorMessage, dataImportTypeId, hrAccessToken } = event;

        employeeImportService.setFailedDataImportEvent(tenantId, dataImportEventId, dataImportTypeId, errorMessage, hrAccessToken);
        return callback(undefined, {
            statusCode: 200,
            body: JSON.stringify('End of failed status assignment and error message on the database'),
        });
    } catch (error) {
        console.error(`Unable to set failed status to Employee import process. Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
};

/**
 * Update an employee
 */
export const updateEmployee = async (event: any, context: Context, callback: ProxyCallback) => {
    try {
        console.info('employee-import.handler.updateEmployee');
        console.info(`employee-import.handler.updateEmployee event: ${JSON.stringify(event)}`);

        await utilService.requirePayload(event);
        utilService.validateAndThrow(event, employeeUpdateBodySchema);

        const { row, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken } = event;

        return await employeeImportService.updateEmployee(row, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken);
    } catch (error) {
        console.error(`Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
};

/**
 * Get the original CSV file or get the CSV row from database and return in CSV format
 */
export const downloadImportData = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('employee-import.handler.downloadImportData');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, dataImportEventDetailUriSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin,
        Role.serviceBureauAdmin,
        Role.superAdmin,
        Role.hrAdmin,
    ]);

    const { tenantId, companyId, dataImportId } = event.pathParameters;
    const {
        requestContext: { domainName, path },
        queryStringParameters,
    } = event;

    return await employeeImportService.downloadImportData(tenantId, companyId, dataImportId, queryStringParameters, domainName, path);
});

/**
 * Update compensation
 */
export const updateCompensation = async (event: any, context: Context, callback: ProxyCallback) => {
    try {
        console.info('employee-import.handler.updateCompensation');
        console.info(`employee-import.handler.updateCompensation event: ${JSON.stringify(event)}`);

        await utilService.requirePayload(event);
        utilService.validateAndThrow(event, employeeUpdateBodySchema);

        const { row, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken } = event;

        return await employeeImportService.updateCompensation(row, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken);
    } catch (error) {
        console.error(`Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
};

/**
 * Update Altenate Rate
 */
export const updateAlternateRate = async (event: any, context: Context, callback: ProxyCallback) => {
    try {
        console.info('employee-import.handler.updateAlternateRate');
        console.info(`employee-import.handler.updateAlternateRate event: ${JSON.stringify(event)}`);

        await utilService.requirePayload(event);
        utilService.validateAndThrow(event, employeeUpdateBodySchema);

        const { row, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken } = event;

        return await employeeImportService.updateAlternateRate(row, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken);
    } catch (error) {
        console.error(`Reason: ${JSON.stringify(error)}`);
        return callback(error);
    }
};
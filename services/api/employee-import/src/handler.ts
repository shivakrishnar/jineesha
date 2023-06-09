import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as employeeImportService from './EmployeeImport.Service';
import * as UUID from '@smallwins/validate/uuid';

import { IGatewayEventInput } from '../../../util.service';
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

const dataImportTypeUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    dataImportTypeId: { required: true, type: String },
};


/**
 * Returns the data import types from the specific Tenant
 */
export const getDataImportTypes = utilService.gatewayEventHandlerV2(
    async ({ event, securityContext }: IGatewayEventInput) => {
        console.info('tenants.handler.getDataImportTypes');

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
    },
);

/**
 * Returns the data imports from the specific Tenant and Company
 */
export const getDataImportEvent = utilService.gatewayEventHandlerV2(
    async ({ event, securityContext }: IGatewayEventInput) => {
        console.info('tenants.handler.getDataImportEvent');

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
            queryStringParameters
        } = event;

        return await employeeImportService.listDataImports(tenantId, companyId, "", queryStringParameters, domainName, path);
    },
);

/**
 * Returns the data imports from the specific Tenant, Company and Data Import Type
 */
export const getDataImportEventByType = utilService.gatewayEventHandlerV2(
    async ({ event, securityContext }: IGatewayEventInput) => {
        console.info('tenants.handler.getDataImportEventByType');

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
            queryStringParameters
        } = event;

        return await employeeImportService.listDataImports(tenantId, companyId, dataImportTypeId, queryStringParameters, domainName, path);
    },
);

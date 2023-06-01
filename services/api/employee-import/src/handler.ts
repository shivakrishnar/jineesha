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

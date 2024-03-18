import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Returns a list of ATSoftStatusType by tenant.
 */
export const getSoftStatusTypesByTenant = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerSoftStatusType.getSoftStatusTypesByTenant');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId } = event.pathParameters;
    const { requestContext: { domainName, path } } = event;

    return await applicantTrackingService.softStatusTypeService.getSoftStatusTypesByTenant(tenantId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATSoftStatusType by company.
 */
export const getSoftStatusTypesByCompany = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerSoftStatusType.getSoftStatusTypesByCompany');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndCompanyIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, companyId } = event.pathParameters;

    return await applicantTrackingService.softStatusTypeService.getSoftStatusTypesByCompany(tenantId, companyId, event.queryStringParameters);
});

/**
 * Returns a list of ATSoftStatusType by tenant.
 */
export const getSoftStatusTypesById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerSoftStatusType.getSoftStatusTypesById');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndCompanyIdAndIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, companyId, id } = event.pathParameters;

    return await applicantTrackingService.softStatusTypeService.getSoftStatusTypesById(tenantId, companyId, id, event.queryStringParameters);
});

/**
 * Returns a list of ATSoftStatusType by Company and HardStatusType.
 */
export const getSoftStatusTypesByCompanyAndHardStatusType = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerSoftStatusType.getSoftStatusTypesByCompanyAndHardStatusType');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndCompanyIdAndHardStatusTypeIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, companyId, hardStatusTypeId } = event.pathParameters;

    return await applicantTrackingService.
        softStatusTypeService.
            getSoftStatusTypesByCompanyAndHardStatusType(tenantId, companyId, hardStatusTypeId, event.queryStringParameters);
});

/**
 * Returns a list of ATSoftStatusType by HardStatusType.
 */
export const getSoftStatusTypesByHardStatusType = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerSoftStatusType.getSoftStatusTypesByHardStatusType');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndHardStatusTypeIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, hardStatusTypeId } = event.pathParameters;

    return await applicantTrackingService.
        softStatusTypeService.
        getSoftStatusTypesByHardStatusType(tenantId, hardStatusTypeId, event.queryStringParameters);
});

import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Returns a list of ATApplication by company.
 */
export const getApplicationByCompany = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplication.getApplicationByCompany');

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
    const { requestContext: { domainName, path } } = event;

    return await applicantTrackingService.applicationService.getApplicationByCompany(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATApplication by Key.
 */
export const getApplicationByKey = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplication.getApplicationByKey');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndApplicationKey);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, applicationKey } = event.pathParameters;

    return await applicantTrackingService.applicationService.getApplicationByKey(tenantId, applicationKey);
});

/**
 * Create ATApplication.
 */
export const createApplication = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplication.createApplication');

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
    const userEmail = securityContext.principal.email;

    await utilService.validateRequestBody(schemas.createApplicationValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createApplicationCheckPropertiesSchema, requestBody, 'Application');

    const apiResult = await applicantTrackingService.applicationService.createApplication(tenantId, userEmail, requestBody);
    return { statusCode: 201, body: apiResult }
});

/**
 * Update ATApplication.
 */
export const updateApplication = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplication.ATApplication');

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
    const userEmail = securityContext.principal.email;

    await utilService.validateRequestBody(schemas.updateApplicationValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateApplicationCheckPropertiesSchema, requestBody, 'Application');

    const apiResult = await applicantTrackingService.applicationService.updateApplication(tenantId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

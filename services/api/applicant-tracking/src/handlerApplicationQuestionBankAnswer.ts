import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';


/**
 * Returns a list of ATApplicationQuestionBankAnswer by id.
 */
export const getApplicationQuestionBankAnswerById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationQuestionBankAnswer.getApplicationQuestionBankAnswerById');

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

    return await applicantTrackingService.applicationQuestionBankAnswerService.getApplicationQuestionBankAnswerById(tenantId, companyId, id);
});

/**
 * Returns a list of ATApplicationQuestionBankAnswer by tenant.
 */
export const getApplicationQuestionBankAnswerByTenant = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationQuestionBankAnswer.getApplicationQuestionBankAnswerByTenant');

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

    return await applicantTrackingService.applicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByTenant(tenantId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATApplicationQuestionBankAnswer by company.
 */
export const getApplicationQuestionBankAnswerByCompany = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationQuestionBankAnswer.getApplicationQuestionBankAnswerByCompany');

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

    return await applicantTrackingService.applicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByCompany(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 * Create ATApplicationQuestionBankAnswer.
 */
export const createApplicationQuestionBankAnswer = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationQuestionBankAnswer.createApplicationQuestionBankAnswer');

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
    const userEmail = securityContext.principal.email;

    await utilService.validateRequestBody(schemas.createApplicationQuestionBankAnswerValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createApplicationQuestionBankAnswerCheckPropertiesSchema, requestBody, 'ApplicationQuestionBankAnswer');

    const apiResult = await applicantTrackingService.applicationQuestionBankAnswerService.createApplicationQuestionBankAnswer(tenantId, companyId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Update ATApplicationQuestionBankAnswer.
 */
export const updateApplicationQuestionBankAnswer = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationQuestionBankAnswer.updateApplicationQuestionBankAnswer');

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
    const userEmail = securityContext.principal.email;

    await utilService.validateRequestBody(schemas.updateApplicationQuestionBankAnswerValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateApplicationQuestionBankAnswerCheckPropertiesSchema, requestBody, 'ApplicationQuestionBankAnswer');

    const apiResult = await applicantTrackingService.applicationQuestionBankAnswerService.updateApplicationQuestionBankAnswer(tenantId, companyId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

/**
 * Delete ATApplicationQuestionBankAnswer.
 */
export const deleteApplicationQuestionBankAnswer = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationQuestionBankAnswer.deleteApplicationQuestionBankAnswer');

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
    const userEmail = securityContext.principal.email;

    const apiResult = await applicantTrackingService.applicationQuestionBankAnswerService.deleteApplicationQuestionBankAnswer(tenantId, companyId, userEmail, id);

    return { statusCode: 200, body: apiResult }
});

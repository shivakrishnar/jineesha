import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Returns a list of ATQuestionBank by tenant.
 */
export const getQuestionBankByTenant = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBank.getQuestionBankByTenant');

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

    return await applicantTrackingService.questionBankService.getQuestionBankByTenant(tenantId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATQuestionBank by company.
 */
export const getQuestionBankByCompany = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBank.getQuestionBankByCompany');

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

    return await applicantTrackingService.questionBankService.getQuestionBankByCompany(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATQuestionBank by id.
 */
export const getQuestionBankById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBank.getQuestionBankById');

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

    return await applicantTrackingService.questionBankService.getQuestionBankById(tenantId, companyId, id);
});

/**
 * Create ATQuestionBank.
 */
export const createQuestionBank = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBank.createQuestionBank');

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

    await utilService.validateRequestBody(schemas.createQuestionBankValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createQuestionBankCheckPropertiesSchema, requestBody, 'QuestionBank');

    const apiResult = await applicantTrackingService.questionBankService.createQuestionBank(tenantId, companyId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Update ATQuestionBank.
 */
export const updateQuestionBank = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBank.updateQuestionBank');

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

    await utilService.validateRequestBody(schemas.updateQuestionBankValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateQuestionBankCheckPropertiesSchema, requestBody, 'QuestionBank');

    const apiResult = await applicantTrackingService.questionBankService.updateQuestionBank(tenantId, companyId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

/**
 * Delete ATQuestionBank.
 */
export const deleteQuestionBank = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBank.deleteQuestionBank');

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

    const apiResult = await applicantTrackingService.questionBankService.deleteQuestionBank(tenantId, companyId, userEmail, id);

    return { statusCode: 200, body: apiResult }
});

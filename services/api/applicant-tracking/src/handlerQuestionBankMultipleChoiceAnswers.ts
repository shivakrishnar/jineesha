import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Returns a list of ATQuestionBankMultipleChoiceAnswers by id.
 */
export const getQuestionBankMultipleChoiceAnswersById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBankMultipleChoiceAnswers.getQuestionBankMultipleChoiceAnswersById');

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

    return await applicantTrackingService.questionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersById(tenantId, companyId, id);
});

/**
 * Returns a list of ATQuestionBankMultipleChoiceAnswers by tenant.
 */
export const getQuestionBankMultipleChoiceAnswersByTenant = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBankMultipleChoiceAnswers.getQuestionBankMultipleChoiceAnswersByTenant');

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

    return await applicantTrackingService.questionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByTenant(tenantId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATQuestionBankMultipleChoiceAnswers by company.
 */
export const getQuestionBankMultipleChoiceAnswersByCompany = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBankMultipleChoiceAnswers.getQuestionBankMultipleChoiceAnswersByCompany');

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

    return await applicantTrackingService.questionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByCompany(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 * Create ATQuestionBankMultipleChoiceAnswers.
 */
export const createQuestionBankMultipleChoiceAnswers = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBankMultipleChoiceAnswers.createQuestionBankMultipleChoiceAnswers');

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

    await utilService.validateRequestBody(schemas.createQuestionBankMultipleChoiceAnswersValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createQuestionBankMultipleChoiceAnswersCheckPropertiesSchema, requestBody, 'QuestionBankMultipleChoiceAnswers');

    const apiResult = await applicantTrackingService.questionBankMultipleChoiceAnswersService.createQuestionBankMultipleChoiceAnswers(tenantId, companyId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Update ATQuestionBankMultipleChoiceAnswers.
 */
export const updateQuestionBankMultipleChoiceAnswers = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerQuestionBankMultipleChoiceAnswers.updateQuestionBankMultipleChoiceAnswers');

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

    await utilService.validateRequestBody(schemas.updateQuestionBankMultipleChoiceAnswersValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateQuestionBankMultipleChoiceAnswersCheckPropertiesSchema, requestBody, 'QuestionBankMultipleChoiceAnswers');

    const apiResult = await applicantTrackingService.questionBankMultipleChoiceAnswersService.updateQuestionBankMultipleChoiceAnswers(tenantId, companyId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

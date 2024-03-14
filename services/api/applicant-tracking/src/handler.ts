import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';


// import * as errorService from '../../../errors/error.service';
// import * as companyService from './company.service';
// import * as tenantService from './tenants.service';
// import * as UUID from '@smallwins/validate/uuid';
// import * as mime from 'mime-types';
// import { Headers } from '../../models/headers';
// import { IAccount } from '@asuresoftware/asure.auth';
// import { Context, ProxyCallback } from 'aws-lambda';
// import { PatchInstruction, PatchOperation } from './patchInstruction';


/**
 * Returns a list of ATQuestionType by tenant.
 */
export const getQuestionTypesByTenant = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionTypes');

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

    return await applicantTrackingService.questionTypeService.getQuestionTypesByTenant(tenantId, event.queryStringParameters);
});

/**
 * Returns a list of ATQuestionBank by tenant.
 */
export const getQuestionBanksByTenant = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionBanksByTenant');

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

    return await applicantTrackingService.questionBankService.getQuestionBanksByTenant(tenantId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATQuestionBank by company.
 */
export const getQuestionBanksByCompany = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionBanksByCompany');

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

    return await applicantTrackingService.questionBankService.getQuestionBanksByCompany(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATQuestionBank by id.
 */
export const getQuestionBankById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionBankById');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, id } = event.pathParameters;

    return await applicantTrackingService.questionBankService.getQuestionBankById(tenantId, id);
});

/**
 * Create ATQuestionBank.
 */
export const createQuestionBank = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.createQuestionBank');

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

    await utilService.validateRequestBody(schemas.createQuestionBankValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createQuestionBankCheckPropertiesSchema, requestBody, 'QuestionBank');

    const apiResult = await applicantTrackingService.questionBankService.createQuestionBank(tenantId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Update ATQuestionBank.
 */
export const updateQuestionBank = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.updateQuestionBank');

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

    await utilService.validateRequestBody(schemas.updateQuestionBankValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateQuestionBankCheckPropertiesSchema, requestBody, 'QuestionBank');

    const apiResult = await applicantTrackingService.questionBankService.updateQuestionBank(tenantId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

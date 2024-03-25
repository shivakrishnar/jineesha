import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Create ATApplicationVersionCustomQuestion.
 */
export const createApplicationVersionCustomQuestion = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.ApplicationVersionCustomQuestionHandler.createApplicationVersionCustomQuestion');

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

    await utilService.validateRequestBody(schemas.createApplicationVersionQuestionBankValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createApplicationVersionQuestionBankCheckPropertiesSchema, requestBody, 'ApplicationVersionQuestionBank');

    const apiResult = await applicantTrackingService.applicationVersionCustomQuestionService.createApplicationVersionCustomQuestion(tenantId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Delete ATApplicationVersionCustomQuestion.
 */
export const deleteApplicationVersionCustomQuestion = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.ApplicationVersionCustomQuestionHandler.deleteApplicationVersionCustomQuestion');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndApplicationVersionIdAndQuestionBankIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, applicationVersionId, questionBankId } = event.pathParameters;
    const userEmail = securityContext.principal.email;

    const apiResult = await applicantTrackingService.applicationVersionCustomQuestionService
        .deleteApplicationVersionCustomQuestion(tenantId, applicationVersionId, questionBankId, userEmail);

    return { statusCode: 200, body: apiResult }
});

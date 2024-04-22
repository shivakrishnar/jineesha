import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Returns a list of ATApplicationNote by applicationId.
 */
export const getApplicationNoteByApplicationId = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationNote.getApplicationNoteByApplicationId');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndApplicationIdSchema);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, applicationId } = event.pathParameters;
    const { requestContext: { domainName, path } } = event;

    return await applicantTrackingService.applicationNoteService.getApplicationNoteByApplicationId(tenantId, applicationId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATApplicationNote by id.
 */
export const getApplicationNoteById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationNote.getApplicationNoteById');

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

    return await applicantTrackingService.applicationNoteService.getApplicationNoteById(tenantId, id);
});

/**
 * Create ATApplicationNote.
 */
export const createApplicationNote = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationNote.createApplicationNote');

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

    await utilService.validateRequestBody(schemas.createApplicationNoteValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createApplicationNoteCheckPropertiesSchema, requestBody, 'ApplicationNote');

    const apiResult = await applicantTrackingService.applicationNoteService.createApplicationNote(tenantId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Update ATApplicationNote.
 */
export const updateApplicationNote = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerJobPosting.updateApplicationNote');

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

    await utilService.validateRequestBody(schemas.updateApplicationNoteValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateApplicationNoteCheckPropertiesSchema, requestBody, 'ApplicationNote');

    const apiResult = await applicantTrackingService.applicationNoteService.updateApplicationNote(tenantId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

/**
 * Delete ATApplicationNote.
 */
export const deleteApplicationNote = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerApplicationNote.deleteApplicationNote');

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
    const userEmail = securityContext.principal.email;

    const apiResult = await applicantTrackingService.applicationNoteService.deleteApplicationNote(tenantId, userEmail, id);

    return { statusCode: 200, body: apiResult }
});

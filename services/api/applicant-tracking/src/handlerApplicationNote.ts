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
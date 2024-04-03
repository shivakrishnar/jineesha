import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import { Role } from '../../models/Role';

/**
 * Create ATJobPostingResponsibleUser.
 */
export const createJobPostingResponsibleUser = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.JobPostingResponsibleUserHandler.createJobPostingResponsibleUser');

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

    await utilService.validateRequestBody(schemas.createJobPostingResponsibleUserValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createJobPostingResponsibleUserCheckPropertiesSchema, requestBody, 'JobPostingResponsibleUser');

    const apiResult = await applicantTrackingService.jobPostingResponsibleUserService.createJobPostingResponsibleUser(tenantId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});
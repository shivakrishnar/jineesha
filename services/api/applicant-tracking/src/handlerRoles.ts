import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
import * as schemas from './ApplicantTracking.Schemas';
import { IGatewayEventInput } from '../../../util.service';
import * as atEnums from './ApplicantTracking.Enums';

/**
 * Returns a list of Roles by id.
 */
export const getRolesById = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerRoles.getRolesById');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndIdSchema);

    await utilService.checkUserAccessPermissions(
        securityContext, 
        event, 
        atEnums.Systems.ATS, 
        atEnums.ATSClaims.RolesPage, 
        atEnums.Operations.READ, 
        false
    );

    const { tenantId, id } = event.pathParameters;

    return await applicantTrackingService.rolesService.getRolesById(tenantId, id);
});

/**
 * Returns a list of Roles by tenant.
 */
export const getRolesByTenant = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerRoles.getRolesByTenant');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdSchema);

    await utilService.checkUserAccessPermissions(
        securityContext, 
        event, 
        atEnums.Systems.ATS, 
        atEnums.ATSClaims.RolesPage, 
        atEnums.Operations.READ, 
        false
    );
    
    const { tenantId } = event.pathParameters;
    const { requestContext: { domainName, path } } = event;

    return await applicantTrackingService.rolesService.getRolesByTenant(tenantId, event.queryStringParameters, domainName, path);
});

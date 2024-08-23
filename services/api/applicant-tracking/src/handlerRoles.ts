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

/**
 * Create Roles.
 */
export const createRoles = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerRoles.createRoles');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdSchema);

    await utilService.checkUserAccessPermissions(
        securityContext, 
        event, 
        atEnums.Systems.ATS, 
        atEnums.ATSClaims.RolesPage, 
        atEnums.Operations.ADD, 
        false
    );

    const { tenantId } = event.pathParameters;
    const userEmail = securityContext.principal.email;

    await utilService.validateRequestBody(schemas.createRolesValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.createRolesCheckPropertiesSchema, requestBody, 'Roles');

    const apiResult = await applicantTrackingService.rolesService.createRoles(tenantId, userEmail, requestBody);

    return { statusCode: 201, body: apiResult }
});

/**
 * Update Roles.
 */
export const updateRoles = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerRoles.updateRoles');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdSchema);

    await utilService.checkUserAccessPermissions(
        securityContext, 
        event, 
        atEnums.Systems.ATS, 
        atEnums.ATSClaims.RolesPage, 
        atEnums.Operations.EDIT, 
        false
    );

    const { tenantId } = event.pathParameters;
    const userEmail = securityContext.principal.email;

    await utilService.validateRequestBody(schemas.updateRolesValidationSchema, requestBody);
    utilService.checkAdditionalProperties(schemas.updateRolesCheckPropertiesSchema, requestBody, 'Roles');

    const apiResult = await applicantTrackingService.rolesService.updateRoles(tenantId, userEmail, requestBody);

    return { statusCode: 200, body: apiResult }
});

/**
 * Delete Roles.
 */
export const deleteRoles = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handlerRoles.deleteRoles');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, schemas.authorizationHeaderSchema);
    utilService.validateAndThrow(event.pathParameters, schemas.pathParametersForTenantIdAndIdSchema);

    await utilService.checkUserAccessPermissions(
        securityContext, 
        event, 
        atEnums.Systems.ATS, 
        atEnums.ATSClaims.RolesPage, 
        atEnums.Operations.DELETE, 
        false
    );

    const { tenantId, id } = event.pathParameters;
    const userEmail = securityContext.principal.email;

    const apiResult = await applicantTrackingService.rolesService.deleteRoles(tenantId, userEmail, id);

    return { statusCode: 200, body: apiResult }
});

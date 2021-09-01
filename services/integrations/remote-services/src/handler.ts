import 'reflect-metadata'; // required by asure.auth dependency

import { IGatewayEventInput } from '../../../util.service';
import * as utilService from '../../../util.service';
import * as UUID from '@smallwins/validate/uuid';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as errorService from '../../../errors/error.service';
import { Role } from '../../../api/models/Role';

const integrationDetailsResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    clientId: { required: true, type: String },
    companyId: { required: true, type: String },
    integrationId: { required: true, type: UUID },
};

/**
 * Gets the integration details of a company the user belongs to
 */
export const getIntegrationDetailsByCompanyId = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event }: IGatewayEventInput) => {
        console.info('remote-service.handler.getIntegrationDetailsByCompanyId');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.pathParameters, integrationDetailsResourceUriSchema);

        const { tenantId, clientId, companyId, integrationId } = event.pathParameters;
        const username = securityContext.principal.username;
        const adminToken = await Promise.resolve(utilService.generateAdminToken());

        const hasRole: boolean = securityContext.roleMemberships.some((role) => {
            return role === Role.globalAdmin || role === Role.serviceBureauAdmin || role === Role.superAdmin;
        });

        const userIsInCompany = await utilService.validateUserIsInCompany(tenantId, username, companyId);
        const isAuthorized = hasRole || userIsInCompany;

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        return await integrationsService.getIntegrationDetailsByCompanyId(tenantId, clientId, companyId, integrationId, adminToken);
    },
);

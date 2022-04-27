import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../../util.service';
import { IGatewayEventInput } from '../../../../util.service';
import * as UUID from '@smallwins/validate/uuid';
import { listSecResourcesBySubGroupId as service } from './service.listSecResourcesBySubGroupId';

const headerSchema = {
    authorization: { required: true, type: String },
};

const tenantResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    subGroupId: { required: true, type: String },
};

/**
 * Returns all SecResources based on the ResourceSubGroupId.
 */
export const listSecResourcesBySubGroupId = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('sec-resource.handler.listSecResourcesBySubGroupId');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);

    return await service(event.pathParameters.tenantId, event.pathParameters.subGroupId, event.requestContext.domainName, event.requestContext.path, event.queryStringParameters, securityContext.principal.email);
});
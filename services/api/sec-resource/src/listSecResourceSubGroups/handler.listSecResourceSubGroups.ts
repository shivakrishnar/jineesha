import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../../util.service';
import { IGatewayEventInput } from '../../../../util.service';
import * as UUID from '@smallwins/validate/uuid';
import { listSecResourceSubGroups as service } from './service.listSecResourceSubGroups';

const headerSchema = {
    authorization: { required: true, type: String },
};

const tenantResourceUriSchema = {
    tenantId: { required: true, type: UUID },
};

/**
 * Returns all SecResourceSubGroups.
 */
export const listSecResourceSubGroups = utilService.gatewayEventHandlerV2(async ({ event }: IGatewayEventInput) => {
    console.info('sec-resource.handler.getSecResourceSubGroups');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);

    return await service(event.pathParameters.tenantId, event.requestContext.domainName, event.requestContext.path, event.queryStringParameters);
});
import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';

import * as UUID from '@smallwins/validate/uuid';
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

const headerSchema = {
    authorization: { required: true, type: String },
};

const ATQuestionTypeUriSchema = {
    tenantId: { required: true, type: UUID }
};

/**
 * Returns a listing of the employees a user has access to under a tenant.
 */
export const getATQuestionTypes = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getATQuestionTypes');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, ATQuestionTypeUriSchema);
    await utilService.checkAuthorization(securityContext, event, [Role.globalAdmin, Role.serviceBureauAdmin, Role.superAdmin, Role.hrAdmin, Role.hrManager, Role.hrEmployee]);

    const { tenantId } = event.pathParameters;

    return { "tenantId": tenantId };
});
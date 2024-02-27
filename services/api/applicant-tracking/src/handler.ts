import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from './ApplicantTracking.Service';
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

const pathParametersForTenantId = {
    tenantId: { required: true, type: UUID }
};

const pathParametersForTenantIdAndCompanyId = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String }
};

/**
 * Returns a list of ATQuestionType by tenant.
 */
export const getQuestionTypesByTenant = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionTypes');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, pathParametersForTenantId);
    console.log(event);
    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId } = event.pathParameters;

    return await applicantTrackingService.questionTypeService.getQuestionTypesByTenant(tenantId, event.queryStringParameters);
});

/**
 * Returns a list of ATQuestionBank by tenant.
 */
export const getQuestionBanksByTenant = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionBanksByTenant');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, pathParametersForTenantId);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId } = event.pathParameters;
    const { requestContext: { domainName, path } } = event;

    return await applicantTrackingService.questionBankService.getQuestionBanksByTenant(tenantId, event.queryStringParameters, domainName, path);
});

/**
 * Returns a list of ATQuestionBank by company.
 */
export const getQuestionBanksByCompany = utilService.gatewayEventHandlerV2(async ({ event, securityContext }: IGatewayEventInput) => {
    console.info('ApplicantTracking.handler.getQuestionBanksByCompany');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, pathParametersForTenantIdAndCompanyId);

    await utilService.checkAuthorization(securityContext, event, [
        Role.globalAdmin, 
        Role.serviceBureauAdmin, 
        Role.superAdmin, 
        Role.hrAdmin, 
        Role.hrManager, 
        Role.hrEmployee
    ]);

    const { tenantId, companyId } = event.pathParameters;
    const { requestContext: { domainName, path } } = event;

    return await applicantTrackingService.questionBankService.getQuestionBanksByCompany(tenantId, companyId, event.queryStringParameters, domainName, path);
});

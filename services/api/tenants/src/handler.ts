import * as utilService from '../../../util.service';
import * as tenantService from './tenants.service';

import * as UUID from '@smallwins/validate/uuid';
import { IGatewayEventInput } from '../../../util.service';
import { Headers } from '../../models/headers';

import { IAccount } from '../../../internal-api/authentication/account';
import { IPayrollApiCredentials } from '../../models/IPayrollApiCredentials';

const headerSchema = {
    authorization: { required: true, type: String },
};

const adminsUriSchema = {
    tenantId: { required: true, type: UUID },
};

/**
 * Adds an SSO global admin account to a specified tenant
 */
export const addAdmin = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('tenants.handler.addAdmin');

    securityContext.requireAsureAdmin();

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, adminsUriSchema);

    const { tenantId } = event.pathParameters;
    const account: IAccount = securityContext.principal;
    const accessToken = event.headers.authorization.replace(/Bearer /i, '');
    const globalAdminCredentials: IPayrollApiCredentials = securityContext.payrollApiCredentials;

    await tenantService.addHrGlobalAdminAccount(tenantId, account.id, accessToken, globalAdminCredentials);

    return { statusCode: 204, headers: new Headers() };
});

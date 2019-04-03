import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as ssoService from '../../../remote-services/sso.service';

import { ErrorMessage } from '../../../errors/errorMessage';
import { IPayrollApiCredentials } from '../../models/IPayrollApiCredentials';

export async function addHrGlobalAdminAccount(
    tenantId: string,
    accountId: string,
    accessToken: string,
    globalAdminCredentials: IPayrollApiCredentials,
): Promise<void> {
    console.info('tenants.service.addHrGlobalAdminAccount');

    try {
        const accountDetails: { [i: string]: string } = {
            username: globalAdminCredentials.evoApiUsername,
            password: globalAdminCredentials.evoApiPassword,
            email: globalAdminCredentials.evoApiUsername, // Within SSO the Global Admin username = email address
            givenName: 'AHR Global',
            surname: 'Admin',
        };

        // Note: Ideally, it would be preferable to check for the existence of the account before creation.
        //       However, SSO account-related apis only support querying for an account by id and not username or email.
        const createdAccount = await ssoService.createSsoAccount(tenantId, accountDetails, accessToken);
        await ssoService.addRoleToAccount(tenantId, createdAccount.id, configService.getEvoHrGlobalAdmin(), accessToken);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        throw errorService.getErrorResponse(0);
    }
}

import * as request from 'request-promise-native';
import * as configService from '../config.service';

const baseUrl = `${configService.getApiDomain()}`;

export enum ssoRoles {
    tenantAdmin = 'asure.tenant-admin',
}

export type SsoAccount = {
    modifiedAt?: string,
    tenantId?: string,
    createdAt?: string,
    clients?: number[],
    email?: string,
    createdBy?: any,
    enabled?: boolean,
    surname?: string,
    username?: string,
    id?: string,
    givenName?: string,
    modifiedBy?: any,
    href?: string,
    password?: string,
    evoSbUserId?: number,
}

export async function getAccessToken(tenantId: string, token: string, username: string, password: string): Promise<string> {
    console.info('ssoService.getAccessToken');
    const apiUrl = `${baseUrl}/identity/tenants/${tenantId}/oauth/token`;
    try {
        const result = await request.post({
            url: apiUrl,
            body: {
                grant_type: 'password',
                username,
                password,
            },
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
        return result.access_token;
    } catch (e) {
        console.log(e);
    }
}

export async function getRoleAccessTokenByClientCredentials(
    apiKey: string,
    apiSecret: string,
    audience: string,
    roleName: string,
    roleTenantId: string
): Promise<string> {
    console.log('ssoService.getRoleAccessTokenByClientCredentials');
    const apiUrl = `${baseUrl}/identity/tenants/${configService.getGoldilocksTenantId()}/oauth/token`;
    try {
        const result = await request.post({
            url: apiUrl,
            body: {
                grant_type: 'CLIENT_CREDENTIALS',
                apiKey,
                apiSecret,
                audience,
                assumeRole: {
                    roleName,
                    params: {
                        tenantId: roleTenantId
                    }
                }
            },
            json: true,
        });
        return result.access_token;
    } catch (e) {
        console.log(e);
    }
}

export async function getAccessTokenByClientCredentials(apiKey: string, apiSecret: string, audience: string): Promise<string> {
    console.info('ssoService.getAccessTokenByClientCredentials');
    const apiUrl = `${baseUrl}/identity/tenants/${configService.getGoldilocksTenantId()}/oauth/token`;
    try {
        const result = await request.post({
            url: apiUrl,
            body: {
                grant_type: 'CLIENT_CREDENTIALS',
                apiKey,
                apiSecret,
                audience,
            },
            json: true,
        });
        return result.access_token;
    } catch (e) {
        console.log(e);
    }
}

export async function getTenantById(tenantId: string, token: string): Promise<any> {
    console.info('ssoService.getTenantById');
    const apiUrl = `${baseUrl}/identity/tenants/${tenantId}`;
    try {
        return await request.get({
            url: apiUrl,
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function exchangeToken(tenantId: string, hrToken: string, targetApplicationId: string): Promise<any> {
    console.info('ssoService.exchangeToken');

    const apiUrl = `${baseUrl}/identity/tenants/${tenantId}/oauth/token`;
    try {
        return await request.post({
            url: apiUrl,
            headers: { Authorization: `Bearer ${hrToken}` },
            json: true,
            body: {
                grant_type: 'token_exchange',
                audience: `${targetApplicationId}`,
            },
        });
    } catch (e) {
        console.log(e);
    }
}

export async function getRoleMemberships(tenantId: string, accountId: string, token: string): Promise<any[]> {
    console.info('ssoService.getRoleMemberships');

    const apiUrl = `${baseUrl}/identity/tenants`;

    // NOTE: we assume there are fewer than 100 roles, so we can get them all in one request
    const response = await request.get({
        url: `${apiUrl}/${tenantId}/accounts/${accountId}/role-memberships?limit=100`,
        headers: { Authorization: `Bearer ${token}` },
        json: true,
    });

    // endpoint returns undefined if no roles
    const roles = response ? response.results : [];
    return roles.filter((r: any) => r.enabled === true);
}

export async function createSsoAccount(tenantId: string, accountDetails: SsoAccount, token: string): Promise<any> {
    console.info('ssoService.createSsoAccount');

    const apiUrl = `${baseUrl}/identity/tenants`;

    const response = await request.post({
        url: `${apiUrl}/${tenantId}/accounts`,
        headers: { Authorization: `Bearer ${token}` },
        json: true,
        body: {
            tenantId,
            ...accountDetails,
        },
    });

    return response;
}

export async function getSsoAccountById(id: string, tenantId: string, token: string): Promise<SsoAccount> {
    console.info('ssoService.getSsoAccountById');

    const apiUrl = `${baseUrl}/identity/tenants`;

    const response = await request.get({
        url: `${apiUrl}/${tenantId}/accounts/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        json: true,
    });

    return response;
}

export async function updateSsoAccountById(id: string, tenantId: string, accountDetails: SsoAccount, token: string): Promise<void> {
    console.info('ssoService.getSsoAccountById');

    const apiUrl = `${baseUrl}/identity/tenants`;

    await request.patch({
        url: `${apiUrl}/${tenantId}/accounts/${id}`,
        headers: { Authorization: `Bearer ${token}` },
        json: true,
        body: accountDetails,
    });
}

export async function addRoleToAccount(tenantId: string, accountId: string, roleId: string, token: string): Promise<any> {
    console.info('ssoService.addRoleToAccount');

    const apiUrl = `${baseUrl}/identity/tenants`;

    const response = await request.post({
        url: `${apiUrl}/${tenantId}/accounts/${accountId}/role-memberships`,
        headers: { Authorization: `Bearer ${token}` },
        json: true,
        body: {
            roleId,
            accountId,
        },
    });

    return response;
}

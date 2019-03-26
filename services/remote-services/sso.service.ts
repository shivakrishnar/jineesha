import * as request from 'request-promise-native';
import * as configService from '../config.service';

const baseUrl = `${configService.getApiDomain()}`;

export async function getAccessToken(tenantId: string, token: string, username: string, password: string): Promise<string> {
    console.info('ssoService.getAccessToken');
    const apiUrl = `${baseUrl}/tenants/${tenantId}/oauth/token`;
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

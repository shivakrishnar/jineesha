import * as request from 'request-promise-native';
import { IPayrollApiCredentials } from '../api/models/IPayrollApiCredentials';
import * as configService from '../config.service';
import * as utilService from '../util.service';
import * as ssoService from './sso.service';

export type EsignatureAppConfiguration = {
    id: string;
    integrationId: string;
    tenantId: string;
    clientId: number;
    companyId: number;
    companyName: string;
    integrationDetails: {
        domainName: string;
        eSignatureAppClientId: string;
        enabled: boolean;
    };
    createAt: string;
    createdBy: {
        id: string;
        username: string;
    };
};

const baseUrl = `${configService.getApiDomain()}/integrations`;

export async function getIntegrationConfigurationByCompany(
    tenantId: string,
    clientId: string,
    companyId: string,
    payrollApiCredentials: IPayrollApiCredentials,
): Promise<EsignatureAppConfiguration> {
    console.info('integrationsService.getEsignatureAppByCompany');

    const token = await createAccessToken(tenantId, payrollApiCredentials);
    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations`;
    try {
        const configurations = await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
        return configurations[0];
    } catch (e) {
        console.log(e);
        throw new Error('Unable to get e-signature app client id');
    }
}

export async function createIntegrationConfiguration(
    tenantId: string,
    clientId: string,
    companyId: string,
    companyName: string,
    domainName: string,
    eSignatureAppClientId: string,
    payrollApiCredentials: IPayrollApiCredentials,
): Promise<EsignatureAppConfiguration> {
    console.info('integrationsService.createIntegrationConfiguration');

    const token = await createAccessToken(tenantId, payrollApiCredentials);

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations`;
    try {
        return await request.post({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
            body: {
                integrationId: configService.getIntegrationId(),
                tenantId,
                clientId: Number(clientId),
                companyId: Number(companyId),
                companyName,
                integrationDetails: {
                    domainName,
                    eSignatureAppClientId,
                    enabled: true,
                },
            },
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to create e-signature configuration');
    }
}

export async function updateIntegrationConfigurationById(
    tenantId: string,
    clientId: string,
    companyId: string,
    body: EsignatureAppConfiguration,
    payrollApiCredentials: IPayrollApiCredentials,
): Promise<EsignatureAppConfiguration> {
    console.info('integrationsService.updateIntegrationConfigurationById');

    const token = await createAccessToken(tenantId, payrollApiCredentials);

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations/${
        body.id
    }`;
    try {
        return await request.put({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
            body,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to update e-signature configuration');
    }
}

async function createAccessToken(tenantId: string, payrollApiCredentials: IPayrollApiCredentials): Promise<string> {
    console.info('integrationsService.createAccessToken');

    if (!payrollApiCredentials) {
        payrollApiCredentials = await utilService.getPayrollApiCredentials(tenantId);
    }

    const { evoApiUsername, evoApiPassword } = payrollApiCredentials;
    const ssoToken = await utilService.getSSOToken(tenantId);
    const hrAccessToken = await ssoService.getAccessToken(tenantId, ssoToken, evoApiUsername, evoApiPassword);
    return (await ssoService.exchangeToken(tenantId, hrAccessToken, configService.getGoldilocksApplicationId())).access_token;
}

export async function deleteIntegrationConfigurationbyId(
    tenantId: string,
    clientId: string,
    companyId: string,
    body: EsignatureAppConfiguration,
    payrollApiCredentials: IPayrollApiCredentials,
): Promise<void> {
    console.info('integrationsService.deleteIntegrationConfigurationById');

    const token = await createAccessToken(tenantId, payrollApiCredentials);

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations/${
        body.id
    }`;
    const payload = {
        id: body.id,
        integrationId: body.integrationId,
        tenantId: tenantId,
        clientId: clientId,
        companyId: companyId,
    };
    console.log(`PAYLOAD ${JSON.stringify(payload)}`);
    try {
        return await request.delete({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
            body: payload,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to update e-signature configuration');
    }
}

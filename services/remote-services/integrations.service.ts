import * as request from 'request-promise-native';
import * as configService from '../config.service';

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
    adminToken: string,
): Promise<EsignatureAppConfiguration> {
    console.info('integrationsService.getEsignatureAppByCompany');

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations`;
    try {
        const configurations = await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${adminToken}` },
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
    adminToken: string,
): Promise<EsignatureAppConfiguration> {
    console.info('integrationsService.createIntegrationConfiguration');

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations`;
    try {
        return await request.post({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${adminToken}` },
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
    adminToken: string,
): Promise<EsignatureAppConfiguration> {
    console.info('integrationsService.updateIntegrationConfigurationById');

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations/${
        body.id
    }`;
    try {
        return await request.put({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${adminToken}` },
            json: true,
            body,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to update e-signature configuration');
    }
}

export async function deleteIntegrationConfigurationbyId(
    tenantId: string,
    clientId: string,
    companyId: string,
    body: EsignatureAppConfiguration,
    adminToken: string,
): Promise<void> {
    console.info('integrationsService.deleteIntegrationConfigurationById');

    const apiUrl = `${baseUrl}/tenants/${tenantId}/clients/${clientId}/companies/${companyId}/integrations/${configService.getIntegrationId()}/integration-configurations/${
        body.id
    }`;
    const payload = {
        id: body.id,
        integrationId: body.integrationId,
        tenantId,
        clientId,
        companyId,
    };
    console.log(`PAYLOAD ${JSON.stringify(payload)}`);
    try {
        return await request.delete({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${adminToken}` },
            json: true,
            body: payload,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to update e-signature configuration');
    }
}

import * as request from 'request-promise-native';
import * as configService from '../config.service';
import * as utilService from '../util.service';

export type HelloSignApplication = {
    name?: string;
    domain?: string;
};

export async function createApplicationForCompany(companyId: string, domain: string, eventCallbackUrl: string): Promise<any> {
    console.info('hellosignService.createApplicationForCompany');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/api_app`;

        return await request.post({
            url,
            json: true,
            body: {
                name: `${domain} - ${companyId}`,
                domain,
                callback_url: eventCallbackUrl,
            },
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to create eSignature application');
    }
}

export async function getApplicationForCompany(clientId: string): Promise<any> {
    console.info('hellosignService.getApplicationForCompany');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/api_app/${clientId}`;

        return await request.get({
            url,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to retrieve eSignature application');
    }
}

export async function updateApplicationForCompany(clientId: string, body: HelloSignApplication): Promise<any> {
    console.info('hellosignService.updateApplicationForCompany');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/api_app/${clientId}`;

        return await request.post({
            url,
            json: true,
            body,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to update eSignature application');
    }
}

export async function deleteApplicationById(clientId: string): Promise<any> {
    console.info('hellosignService.deleteApplicationById');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/api_app/${clientId}`;

        return await request.delete({
            url,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to delete eSignature application');
    }
}

export async function getFileBySignatureRequestId(requestId: string): Promise<any> {
    console.info('hellosignService.getFileBySignatureRequestId');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/signature_request/files/${requestId}?get_data_uri=true`;
        return await request.get({
            url,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to retrieve the file associated with the signature request');
    }
}

/**
 * According to HelloSign the query field for requests is currently unsupported in the SDK
 * This hits their API directly for the request
 * @param {string} query: A query string to used when requesting a signature_request list from HelloSign
 * @returns {Promise<any>}: A promise of the JSON string from the helloSign API
 */
export async function getSignatureRequestListByQuery(query: string): Promise<any> {
    console.info('hellosignService.getSignatureRequestListByQuery');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/signature_request/list?query=${query}`;

        return await request.get({
            url,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to retrieve the file associated with the signature request');
    }
}

export async function getTemplateEditUrlById(templateId: string): Promise<any> {
    console.info('hellosignService.getTemplateEditUrlById');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/embedded/edit_url/${templateId}?skip_signer_roles=1&skip_subject_message=1`;

        return await request.get({
            url,
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to retrieve the edit url for the specified template');
    }
}

export async function getTemplateFilesById(templateId: string): Promise<any> {
    console.info('hellosignService.getTemplateFilesById');

    try {
        const apiKey = JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey;
        const url = `https://${apiKey}:@api.hellosign.com/v3/template/files/${templateId}?get_data_uri=true`;

        return await request.get({
            url,
            encoding: undefined,
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

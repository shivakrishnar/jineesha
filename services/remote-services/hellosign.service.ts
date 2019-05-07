import * as request from 'request-promise-native';
import * as configService from '../config.service';
import * as utilService from '../util.service';

export async function createApplicationForCompany(companyId: string, domain: string): Promise<any> {
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
            },
        });
    } catch (e) {
        console.log(e);
        throw new Error('Unable to create eSignature application');
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

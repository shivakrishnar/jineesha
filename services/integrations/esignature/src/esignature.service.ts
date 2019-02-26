import * as fs from 'fs';
import * as hellosign from 'hellosign-sdk';
import * as uuidV4 from 'uuid/v4';
import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as utilService from '../../../util.service';
import { TemplateRequest } from './templateRequest';
import { TemplateResponse } from './templateResponse';
import { EsignatureAppInfo } from '../../../remote-services/integrations.service';

/**
 * Creates an embedded template through the HelloSign API and returns an edit url.
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @returns {Promise<DiectDeposits>}: Promise of an array of direct deposits
 */
export async function createTemplate(tenantId: string, companyId: string, token: string, payload: TemplateRequest): Promise<any> {
    console.info('esignatureService.createTemplate');

    const { file, fileName, signerRoles } = payload;
    const tmpFileName = `${fileName}-${uuidV4()}`;

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    // Note: we must write the file to the tmp directory on the Lambda container in order to upload it to HelloSign.
    // The file is saved as the specified file name in the payload with a guid attached to it in order to
    // prevent conflicts.
    fs.writeFile(`/tmp/${tmpFileName}`, file.split(',')[1], 'base64', (e) => {
        if (e) {
            console.log(`Unable to write file to /tmp partition. Reason: ${JSON.stringify(e)}`);
            throw errorService.getErrorResponse(0);
        }
    });

    try {
        const appDetails: EsignatureAppInfo = await integrationsService.getEsignatureAppByCompany(tenantId, companyId, token);
        const client = await hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appDetails.id,
        });

        const options = {
            test_mode: configService.eSignatureApiDevModeOn ? 1 : 0,
            // clientId: helloSignCompanyAppId,
            files: [`/tmp/${tmpFileName}`],
            signer_roles: signerRoles,
            metadata: {
                companyAppId: appDetails.id,
                tenantId,
                companyId,
            },
        };

        const { template } = await client.template.createEmbeddedDraft(options);

        return new TemplateResponse({
            clientId: appDetails.id,
            template: {
                id: template.template_id,
                editUrl: template.edit_url,
                expiration: template.expires_at,
            },
        });
    } catch (error) {
        console.error(error);
        throw errorService.getErrorResponse(0);
    } finally {
        fs.unlink(`/tmp/${tmpFileName}`, (e) => {
            if (e) {
                console.log(`Unable to delete temp file: ${tmpFileName}. Reason: ${JSON.stringify(e)}`);
            }
        });
    }
}

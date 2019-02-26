import * as fs from 'fs';
import * as hellosign from 'hellosign-sdk';
import * as uuidV4 from 'uuid/v4';

import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as servicesDao from '../../../services.dao';
import * as utilService from '../../../util.service';

import { ConnectionPool, IResult } from 'mssql';
import { ConnectionString, findConnectionString } from '../../../dbConnections';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { EsignatureAppInfo } from '../../../remote-services/integrations.service';
import { Signatory } from './signatory';
import { BulkSignatureRequest, SignatureRequest } from './signatureRequest';
import { Signature, SignatureRequestResponse, SignatureRequestResponseStatus, SignatureStatus } from './signatureRequestResponse';
import { TemplateRequest } from './templateRequest';
import { TemplateResponse } from './templateResponse';

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

/**
 *  Creates an e-sginature request for an employee or group of employees for specified
 *  tenant's company.
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {BulkSignatureRequest} request: An e-signature request for employee(s) within the company
 * @param {string} accessToken: The token authorizing the request
 * @returns {SignatureRequestResponse}: Promise of a completed e-signature request.
 */
export async function createBulkSignatureRequest(
    tenantId: string,
    companyId: string,
    request: BulkSignatureRequest,
    accessToken: string,
): Promise<SignatureRequestResponse> {
    console.info('esignature.handler.createBulkSignatureRequest');

    try {
        const appDetails: EsignatureAppInfo = await integrationsService.getEsignatureAppByCompany(tenantId, companyId, accessToken);
        const eSigner = hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appDetails.id,
        });

        const options: { [i: string]: any } = {
            test_mode: configService.eSignatureApiDevModeOn ? 1 : 0,
            template_id: request.templateId,
            signers: request.signatories.map((signer: Signatory) => {
                return {
                    email_address: signer.emailAddress,
                    name: signer.name,
                    role: signer.role,
                };
            }),
        };

        if (request.subject) {
            options.subject = request.subject;
        }

        if (request.message) {
            options.message = request.message;
        }

        const response = await eSigner.signatureRequest.createEmbeddedWithTemplate(options);
        const signatureRequest = response.signature_request;
        const signatures: Signature[] = signatureRequest.signatures.map((signature) => {
            return {
                id: signature.signature_id,
                status: SignatureStatus.Pending,
                signer: new Signatory({
                    emailAddress: signature.signer_email_address,
                    name: signature.signer_name,
                    role: signature.signer_role,
                }),
            };
        });

        return new SignatureRequestResponse({
            id: signatureRequest.signature_request_id,
            title: signatureRequest.title,
            status: SignatureRequestResponseStatus.Pending,
            signatures,
        });
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Template not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }

            if (error.message.includes('No recipients specified')) {
                const errorMessage = `The specified signatory cannot be found`;
                throw errorService.getErrorResponse(50).setDeveloperMessage(errorMessage);
            }
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 *
 *  Creates an e-sginature request for an employee within a specified tenant's company.
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {string} employeeId: The unique identifer for the employee
 * @param {SignatureRequest} request: An e-signature request for a specific employee
 * @param {string} accessToken: The token authorizing the request
 * @returns {SignatureRequestResponse}: Promise of a completed e-signature request.
 */
export async function createSignatureRequest(
    tenantId: string,
    companyId: string,
    employeeId: string,
    request: SignatureRequest,
    accessToken: string,
): Promise<SignatureRequestResponse> {
    console.info('esignature.handler.createSignatureRequest');

    let pool: ConnectionPool;
    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await servicesDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const query = new ParameterizedQuery('GetEmployeeDisplayNameById', Queries.getEmployeeDisplayNameById);
        query.setParameter('@employeeId', employeeId);

        const result: IResult<any> = await servicesDao.executeQuery(pool.transaction(), query);
        const employeeRecord = (result.recordset || []).map((entry) => {
            return {
                emailAddress: entry.EmailAddress,
                name: entry.CurrentDisplayName,
            };
        });

        if (employeeRecord.length === 0 || !employeeRecord[0].emailAddress) {
            throw new Error('Employee record not found');
        }

        const bulkSignRequest = new BulkSignatureRequest({
            templateId: request.templateId,
            signatories: [
                {
                    emailAddress: employeeRecord[0].emailAddress,
                    name: employeeRecord[0].name,
                    role: request.role,
                },
            ],
        });

        if (request.subject) {
            bulkSignRequest.subject = request.subject;
        }

        if (request.message) {
            bulkSignRequest.message = request.message;
        }

        return await createBulkSignatureRequest(tenantId, companyId, bulkSignRequest, accessToken);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

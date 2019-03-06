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
import { Signatory, SignUrl } from './signature-requests/signatory';
import { BulkSignatureRequest, SignatureRequest } from './signature-requests/signatureRequest';
import {
    Signature,
    SignatureRequestResponse,
    SignatureRequestResponseStatus,
    SignatureStatus,
} from './signature-requests/signatureRequestResponse';
import { TemplateDraftResponse } from './template-draft/templateDraftResponse';
import { ICustomField, Role, TemplateRequest } from './template-draft/templateRequest';
import { TemplateDocumentListResponse } from './template-list/templateDocumentListResponse';
import { Template, TemplateListResponse } from './template-list/templateListResponse';

/**
 * Creates a template under the specified company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} company: The unique identifier for the company the user belongs to.
 * @param {string} token: The token authorizing the request.
 * @param {TemplateRequest} payload: The template request.
 * @returns {Promise<TemplateResponse>}: Promise of the created template
 */
export async function createTemplate(
    tenantId: string,
    companyId: string,
    token: string,
    payload: TemplateRequest,
): Promise<TemplateDraftResponse> {
    console.info('esignatureService.createTemplate');

    const { file, fileName, signerRoles, ccRoles, customFields } = payload;
    const tmpFileName = `${fileName}-${uuidV4()}`;

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    // Validate that the signer roles are strings
    if (!signerRoles.every((role) => typeof role === 'string')) {
        const errorMessage = 'signerRoles must only contain strings';
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    // Validate that the cc roles are strings
    if (ccRoles && !ccRoles.every((role) => typeof role === 'string')) {
        const errorMessage = 'ccRoles must only contain strings';
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
            files: [`/tmp/${tmpFileName}`],
            signer_roles: signerRoles,
            metadata: {
                companyAppId: appDetails.id,
                tenantId,
                companyId,
            },
        };

        if (ccRoles) {
            options['cc_roles'] = ccRoles;
        }
        if (customFields) {
            options['merge_fields'] = customFields;
        }

        const { template } = await client.template.createEmbeddedDraft(options);

        return new TemplateDraftResponse({
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

/**
 * Lists all templates under a specified company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} company: The unique identifier for the company the user belongs to.
 * @param {string} token: The token authorizing the request.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<TemplateListResponse>}: Promise of an array of templates
 */
export async function listTemplates(
    tenantId: string,
    companyId: string,
    token: string,
    queryParams: any,
): Promise<TemplateListResponse | TemplateDocumentListResponse> {
    console.info('esignatureService.listTemplates');

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    let pool: ConnectionPool;
    try {
        const appDetails: EsignatureAppInfo = await integrationsService.getEsignatureAppByCompany(tenantId, companyId, token);
        const client = await hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appDetails.id,
        });

        const response = await client.template.list();

        const results = response.templates
            .filter((template) => template.metadata && template.metadata.companyAppId === appDetails.id)
            .map(
                ({
                    template_id: id,
                    title,
                    message,
                    can_edit: editable,
                    is_locked: isLocked,
                    signer_roles,
                    cc_roles,
                    custom_fields,
                    documents,
                }) => {
                    const uuidRegex = /-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
                    // If there is a uuid appended to the file name, remove it.
                    const fileName = documents[0].name.replace(uuidRegex, '');
                    return new Template({
                        id,
                        title,
                        message,
                        editable,
                        isLocked,
                        signerRoles: signer_roles.map(({ name }) => new Role({ name })),
                        ccRoles: cc_roles.map(({ name }) => new Role({ name })),
                        customFields: custom_fields.map(({ name, type }) => {
                            return { name, type } as ICustomField;
                        }),
                        name: fileName,
                    });
                },
            );

        if (queryParams && queryParams.consolidated === 'true') {
            const connectionString: ConnectionString = await findConnectionString(tenantId);
            const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

            pool = await servicesDao.createConnectionPool(
                rdsCredentials.username,
                rdsCredentials.password,
                connectionString.rdsEndpoint,
                connectionString.databaseName,
            );

            const query = new ParameterizedQuery('GetDocumentsByCompanyId', Queries.getDocumentsByCompanyId);
            query.setParameter('@companyId', companyId);

            const result: IResult<any> = await servicesDao.executeQuery(pool.transaction(), query);
            const documentRecord = (result.recordset || []).map((entry) => {
                return {
                    id: entry.ID,
                    name: entry.Filename,
                };
            });

            return new TemplateDocumentListResponse({ templates: results, hrDocuments: documentRecord });
        }
        return new TemplateListResponse({ results });
    } catch (error) {
        console.error(error);
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

/**
 * Creates a sign url for a specified employee
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {string} employeeId: The unique identifer for the employee
 * @param {string} signatureId: The unique identifer for signature requested of the employee
 * @param {string} token: The token authorizing the request
 * @returns {string}: A Promise of a sign url
 */
export async function createSignUrl(
    tenantId: string,
    companyId: string,
    employeeId: string,
    signatureId: string,
    token: string,
): Promise<SignUrl> {
    console.info('esignatureService.createSignUrl');

    try {
        const appDetails: EsignatureAppInfo = await integrationsService.getEsignatureAppByCompany(tenantId, companyId, token);
        const eSigner = hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appDetails.id,
        });

        const response = await eSigner.embedded.getSignUrl(signatureId);
        const { sign_url, expires_at } = response.embedded;
        return {
            url: sign_url,
            expiration: expires_at,
        };
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Signature not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

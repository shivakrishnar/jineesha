import * as fs from 'fs';
import * as hellosign from 'hellosign-sdk';
import * as uuidV4 from 'uuid/v4';

import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as hellosignService from '../../../remote-services/hellosign.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as servicesDao from '../../../services.dao';
import * as utilService from '../../../util.service';

import { ConnectionPool, IResult } from 'mssql';
import { ConnectionString, findConnectionString } from '../../../dbConnections';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { EsignatureAppConfiguration } from '../../../remote-services/integrations.service';
import { DocumentMetadata, DocumentMetadataListResponse } from './documents/document';
import { Onboarding } from './signature-requests/onboarding';
import { Signatory, SignUrl } from './signature-requests/signatory';
import { BulkSignatureRequest, SignatureRequest } from './signature-requests/signatureRequest';
import { SignatureRequestListResponse } from './signature-requests/signatureRequestListResponse';
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
 * @param {TemplateRequest} payload: The template request.
 * @returns {Promise<TemplateResponse>}: Promise of the created template
 */
export async function createTemplate(tenantId: string, companyId: string, payload: TemplateRequest): Promise<TemplateDraftResponse> {
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
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;
        const client = await hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appClientId,
        });

        const options = {
            test_mode: configService.eSignatureApiDevModeOn ? 1 : 0,
            files: [`/tmp/${tmpFileName}`],
            signer_roles: signerRoles.map((role) => {
                return {
                    name: role,
                };
            }),
            metadata: {
                companyAppId: appClientId,
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
            clientId: appClientId,
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
 * @returns {SignatureRequestResponse}: Promise of a completed e-signature request.
 */
export async function createBulkSignatureRequest(
    tenantId: string,
    companyId: string,
    request: BulkSignatureRequest,
    metadata: any = {},
): Promise<SignatureRequestResponse> {
    console.info('esignature.handler.createBulkSignatureRequest');

    try {
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const eSigner = hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appDetails.integrationDetails.eSignatureAppClientId,
        });

        const options: { [i: string]: any } = {
            test_mode: configService.eSignatureApiDevModeOn ? 1 : 0,
            template_id: request.templateId,
            metadata,
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

            if (error.message.includes('Email Address')) {
                throw errorService.getErrorResponse(30).setDeveloperMessage('Provided email is invalid');
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
 * @returns {SignatureRequestResponse}: Promise of a completed e-signature request.
 */
export async function createSignatureRequest(
    tenantId: string,
    companyId: string,
    employeeId: string,
    request: SignatureRequest,
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

        return await createBulkSignatureRequest(tenantId, companyId, bulkSignRequest);
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
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<TemplateListResponse>}: Promise of an array of templates
 */
export async function listTemplates(
    tenantId: string,
    companyId: string,
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
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;
        const client = await hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appClientId,
        });

        const response = await client.template.list();

        const results = response.templates
            .filter((template) => template.metadata && template.metadata.companyAppId === appClientId)
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
                        filename: fileName,
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
                    filename: entry.Filename,
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
 * @returns {string}: A Promise of a sign url
 */
export async function createSignUrl(tenantId: string, companyId: string, employeeId: string, signatureId: string): Promise<SignUrl> {
    console.info('esignatureService.createSignUrl');

    try {
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;
        const eSigner = hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appClientId,
        });

        const response = await eSigner.embedded.getSignUrl(signatureId);
        const { sign_url, expires_at } = response.embedded;
        return {
            url: sign_url,
            expiration: expires_at,
            clientId: appClientId,
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

/**
 * Lists all documents for E-Signature under a specified company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {{[i: string]: string}} queryParams: The query parameters that were specified by the user.
 * @returns {DocumentMetadataListResponse}: A Promise of a collection documents' metadata
 */
export async function listDocuments(
    tenantId: string,
    companyId: string,
    queryParams: { [i: string]: string },
): Promise<DocumentMetadataListResponse> {
    console.info('esignatureService.listDocuments');

    const validQueryStringParameters: string[] = ['category', 'categoryId', 'docType'];

    // Currently, the presence of query string parameters with the api call is enforced
    //  to ensure that the functionality is restricted to retrieving onboarding-related
    //  documents. Long term, this would no longer be necessary
    if (!queryParams) {
        const error: ErrorMessage = errorService.getErrorResponse(30);
        error
            .setDeveloperMessage('Query parameters expected')
            .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
        throw error;
    }

    // Check for unsupported or missing query string parameters
    if (
        !Object.keys(queryParams).every((param) => validQueryStringParameters.includes(param)) ||
        !validQueryStringParameters.slice(0, 2).every((requiredParam) => Object.keys(queryParams).includes(requiredParam))
    ) {
        const error: ErrorMessage = errorService.getErrorResponse(30);
        error
            .setDeveloperMessage('Unsupported or missing query parameters')
            .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
        throw error;
    }

    /**
     * Note: At this time, this endpoint is only supports retrieving documents associated with onboarding
     *       and thus the category is restricted to that.
     */
    if (queryParams['category'] !== 'onboarding') {
        const error: ErrorMessage = errorService.getErrorResponse(30);
        error
            .setDeveloperMessage(`Unsupported value: ${queryParams['category']}`)
            .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(', ')}. See documentation for usage.`);
        throw error;
    }

    // categoryId must be integral and positive
    if (Number.isNaN(Number(queryParams['categoryId'])) || Number(queryParams['categoryId']) < 0) {
        const errorMessage = `Value of categoryId: ${queryParams['categoryId']} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    if (
        queryParams['docType'] &&
        queryParams['docType'].toLowerCase() !== 'hellosign' &&
        queryParams['docType'].toLowerCase() !== 'original'
    ) {
        const error: ErrorMessage = errorService.getErrorResponse(30);
        error
            .setDeveloperMessage(`Unsupported value: ${queryParams['docType']}`)
            .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
        throw error;
    }

    const filterByHelloSignDocuments: boolean = queryParams.docType && queryParams.docType.toLowerCase() === 'hellosign' ? true : false;
    const filterByOriginalDocuments: boolean = queryParams.docType && queryParams.docType.toLowerCase() === 'original' ? true : false;
    const taskListId = Number(queryParams.categoryId);

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

        // Check that the company id is valid.
        let query = new ParameterizedQuery('GetCompanyInfo', Queries.companyInfo);
        query.setParameter('@companyId', companyId);
        let result: IResult<any> = await servicesDao.executeQuery(pool.transaction(), query);
        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The company id: ${companyId} not found`);
        }

        query = new ParameterizedQuery('GetTaskListDocuments', Queries.getTaskListDocuments);
        query.setParameter('@companyId', companyId);
        query.setParameter('@taskListId', taskListId);

        result = await servicesDao.executeQuery(pool.transaction(), query);
        let documents: DocumentMetadata[] = (result.recordset || []).map((entry) => {
            return {
                id: entry.ID,
                filename: entry.Filename,
                title: entry.Title,
                description: entry.Description,
            };
        });

        if (filterByOriginalDocuments) {
            const originalDocs = documents.filter((doc) => doc.filename.includes('.'));
            return originalDocs.length === 0 ? undefined : new DocumentMetadataListResponse({ results: originalDocs });
        }

        if (filterByHelloSignDocuments) {
            documents = documents.filter((doc) => !doc.filename.includes('.'));
        }

        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const eSigner = hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appDetails.integrationDetails.eSignatureAppClientId,
        });

        const unfoundDocuments: DocumentMetadata[] = [];

        // Extract template file information for document metadata
        for (const doc of documents) {
            if (!doc.filename.includes('.')) {
                const uuidRegex = /-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

                try {
                    const apiResponse = await eSigner.template.get(doc.filename);

                    // Truncate UUID off filename
                    doc.filename = apiResponse.template.documents[0].name.replace(uuidRegex, '');
                    doc.title = apiResponse.template.title;
                } catch (error) {
                    console.error(`issue accessing template id: ${doc.filename}`);
                    unfoundDocuments.push(doc);
                }
            }
        }

        // Renove any unfound documents from eventual response
        if (unfoundDocuments.length > 0) {
            documents = documents.filter((doc) => !unfoundDocuments.includes(doc));
        }

        return documents.length === 0 ? undefined : new DocumentMetadataListResponse({ results: documents });
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
 * Creates signature requests for each template under a specified onboarding task list
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {Onboarding} requestBody: The onboarding request
 * @returns {SignatureRequestListResponse}: A promise of a list of signature requests
 */
export async function onboarding(tenantId: string, companyId: string, requestBody: Onboarding): Promise<SignatureRequestListResponse> {
    console.info('esignatureService.onboarding');

    const { onboardingKey, taskListId, emailAddress, name } = requestBody;

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;
        const eSigner = hellosign({
            key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
            client_id: appClientId,
        });

        const { signature_requests: existingSignatureRequests } = await eSigner.signatureRequest.list({
            query: `metadata:${onboardingKey}`,
        });

        if (existingSignatureRequests.length > 0) {
            console.log(`Signature requests were already created for onboarding key: ${onboardingKey}`);
            const results = existingSignatureRequests.map((request) => {
                return new SignatureRequestResponse({
                    id: request.signature_request_id,
                    title: request.title,
                    status: request.is_complete ? SignatureRequestResponseStatus.Complete : SignatureRequestResponseStatus.Pending,
                    signatures: request.signatures.map((signature) => {
                        let signatureStatus;
                        switch (signature.status_code) {
                            case 'signed':
                                signatureStatus = SignatureRequestResponseStatus.Complete;
                                break;
                            case 'awaiting_signature':
                                signatureStatus = SignatureRequestResponseStatus.Pending;
                                break;
                            case 'declined':
                                signatureStatus = SignatureRequestResponseStatus.Declined;
                                break;
                            default:
                                signatureStatus = SignatureRequestResponseStatus.Unknown;
                                break;
                        }
                        return {
                            id: signature.signature_id,
                            status: signatureStatus,
                            signer: new Signatory({
                                emailAddress: signature.signer_email_address,
                                name: signature.signer_name,
                                role: signature.signer_role,
                            }),
                        };
                    }),
                });
            });
            return new SignatureRequestListResponse({ results });
        }

        const getDocumentsQueryParams = {
            category: 'onboarding',
            categoryId: taskListId.toString(),
            docType: 'hellosign',
        };

        const taskListTemplates = await listDocuments(tenantId, companyId, getDocumentsQueryParams);

        if (!taskListTemplates) {
            return undefined;
        }

        const signatureRequestMetadata = { onboardingKey };
        const signatureRequests: SignatureRequestResponse[] = [];

        for (const template of taskListTemplates.results) {
            const signatureRequest: BulkSignatureRequest = {
                templateId: template.id,
                signatories: [
                    {
                        emailAddress,
                        name,
                        role: 'OnboardingSignatory',
                    },
                ],
            };

            const created = await createBulkSignatureRequest(tenantId, companyId, signatureRequest, signatureRequestMetadata);
            signatureRequests.push(created);
        }

        return new SignatureRequestListResponse({ results: signatureRequests });
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Signature not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        console.error(`Failed on onboarding. Reason: ${JSON.stringify(error)}`);
        throw errorService.getErrorResponse(0);
    }
}

type Configuration = {
    op: Operation;
};

enum Operation {
    Add = 'add',
    Remove = 'remove',
}

/**
 * Enables or disables E-signature functionality for a specified company within a tenant
 * @param {string} tenantId: The unique identifier for the tenant.
 * @param {string} companyId: The unique identifier for the company.
 * @param {string} token: The token authorizing the request.
 * @param {Configuration} config: The configuration to apply.
 */
export async function configure(tenantId: string, companyId: string, token: string, config: Configuration): Promise<any> {
    console.info('esignatureService.configure');

    const { clientId, name, domain } = await getCompanyDetails(tenantId, companyId);

    // Get configuration
    const integrationConfiguration: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
        tenantId,
        clientId,
        companyId,
    );

    try {
        switch (config.op) {
            case Operation.Add:
                console.log('Adding a configuration');
                if (integrationConfiguration) {
                    integrationConfiguration.integrationDetails.enabled = true;
                    await integrationsService.updateIntegrationConfigurationById(tenantId, clientId, companyId, integrationConfiguration);
                } else {
                    const {
                        api_app: { client_id: eSignatureClientId },
                    } = await hellosignService.createApplicationForCompany(companyId, domain);
                    try {
                        await integrationsService.createIntegrationConfiguration(
                            tenantId,
                            clientId,
                            companyId,
                            name,
                            domain,
                            eSignatureClientId,
                        );
                    } catch (e) {
                        await hellosignService.deleteApplicationById(eSignatureClientId);

                        console.error(JSON.stringify(e));
                        throw new Error(JSON.stringify(e));
                    }
                }
                break;

            case Operation.Remove:
                console.log('Removing a configuration');
                if (!integrationConfiguration) {
                    throw errorService.getErrorResponse(50).setDeveloperMessage('No existing e-signature configuration found');
                }

                integrationConfiguration.integrationDetails.enabled = false;
                await integrationsService.updateIntegrationConfigurationById(tenantId, clientId, companyId, integrationConfiguration);

                break;

            default:
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Retrieves the Evolution client id associated with a company
 * @param {string} tenantId: The unique identifier for the tenant.
 * @param {string} companyId: The unique identifier for the company.
 * @param {string} token: The token authorizing the request.
 * @return {Promise<string>} A Promise of the client id the company belongs to
 */

type CompanyDetail = {
    clientId: string;
    name: string;
    domain: string;
};
async function getCompanyDetails(tenantId: string, companyId: string): Promise<CompanyDetail> {
    console.info('esignatureService.getCompanyInfo');

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

        // Check that the company id is valid.
        const query = new ParameterizedQuery('GetCompanyInfo', Queries.companyInfo);
        query.setParameter('@companyId', companyId);
        const result: IResult<any> = await servicesDao.executeQuery(pool.transaction(), query);
        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The company id: ${companyId} not found`);
        }

        const companyInfo: CompanyDetail[] = (result.recordset || []).map((entry) => {
            return {
                name: entry.CompanyName,
                clientId: entry.ClientID,
                // urls may be semi-colon delimited eg. adhr-test-1.dev.evolution-software.com;localhost:9000
                // Use the first entry.
                domain: (entry.MatchingUrls as string).split(';')[0],
            };
        });

        return companyInfo[0];
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(`Unable to retrieve company info. Reason: ${JSON.stringify(error)}`);
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

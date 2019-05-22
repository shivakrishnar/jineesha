import * as fs from 'fs';
import * as hellosign from 'hellosign-sdk';
import * as uuidV4 from 'uuid/v4';

import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as hellosignService from '../../../remote-services/hellosign.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as utilService from '../../../util.service';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { Query } from '../../../queries/query';
import { EsignatureAppConfiguration } from '../../../remote-services/integrations.service';
import { InvocationType } from '../../../util.service';
import { DocumentMetadata, DocumentMetadataListResponse } from './documents/document';
import { EditUrl, SignUrl } from './embedded/url';
import { Onboarding } from './signature-requests/onboarding';
import { Signatory } from './signature-requests/signatory';
import { BulkSignatureRequest, SignatureRequest } from './signature-requests/signatureRequest';
import { SignatureRequestListResponse } from './signature-requests/signatureRequestListResponse';
import {
    Signature,
    SignatureRequestResponse,
    SignatureRequestResponseStatus,
    SignatureStatus,
} from './signature-requests/signatureRequestResponse';
import { TemplateDraftResponse } from './template-draft/templateDraftResponse';
import { TemplateMetadata } from './template-draft/templateMetadata';
import { ICustomField, Role, TemplateRequest } from './template-draft/templateRequest';
import { Template } from './template-list/templateListResponse';

/**
 * Creates a template under the specified company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} company: The unique identifier for the company the user belongs to.
 * @param {TemplateRequest} payload: The template request.
 * @returns {Promise<TemplateResponse>}: Promise of the created template
 */
export async function createTemplate(
    tenantId: string,
    companyId: string,
    request: TemplateRequest,
    email: string,
): Promise<TemplateDraftResponse> {
    console.info('esignatureService.createTemplate');

    const { file, fileName, signerRoles, ccRoles, customFields, category, title, message } = request;
    const tmpFileDir = `${uuidV4()}`;

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
    await fs.mkdir(`/tmp/${tmpFileDir}`, (e) => {
        if (e) {
            console.log(`Unable to create temporary directory tmp/${tmpFileDir}. Reason: ${JSON.stringify(e)}`);
            throw errorService.getErrorResponse(0);
        }
    });
    fs.writeFile(`/tmp/${tmpFileDir}/${fileName}`, file.split(',')[1], 'base64', (e) => {
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
            files: [`/tmp/${tmpFileDir}/${fileName}`],
            title,
            message,
            signer_roles: signerRoles.map((role) => {
                return {
                    name: role,
                };
            }),
            metadata: {
                companyAppId: appClientId,
                tenantId,
                companyId,
                category,
                uploadDate: new Date().toISOString(),
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
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    } finally {
        await fs.unlink(`/tmp/${tmpFileDir}/${fileName}`, (e) => {
            if (e) {
                console.log(`Unable to delete temp file: ${fileName}. Reason: ${JSON.stringify(e)}`);
            }
        });
        fs.rmdir(`/tmp/${tmpFileDir}`, (e) => {
            if (e) {
                console.log(`Unable to delete temp directory: ${tmpFileDir}. Reason: ${JSON.stringify(e)}`);
            }
        });
    }
}

enum EsignatureMetadataType {
    Template = 'Template',
    SignatureRequest = 'SignatureRequest',
}

/**
 * Saves a template's metadata to the HR database.
 * @param {string} tenantId: The unique identifier for the tenant.
 * @param {string} companyId: The unique identifier for the company.
 * @param {string} templateId: The unique identifier for the e-signature template.
 * @returns {Promise<TemplateMetadata>}: Promise of the template's metadata
 */
export async function saveTemplateMetadata(
    tenantId: string,
    companyId: string,
    templateId: string,
    emailAddress: string,
    requestBody: any,
): Promise<TemplateMetadata> {
    console.info('esignatureService.saveTemplateMetadata');

    const { title, fileName, category } = requestBody;

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        let query = new ParameterizedQuery('GetUserByEmail', Queries.getUserById);
        query.setParameter('@username', emailAddress);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        // Note: we don't need to utilize the returned result from the getCompanyDetails function so we purposefully deconstruct only the first item in the array.
        const [result]: any[] = await Promise.all([
            utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse),
            getCompanyDetails(tenantId, companyId),
        ]);

        const { FirstName, LastName } = result.recordset[0];

        const uploadedBy = `${FirstName} ${LastName}`;
        const uploadDate = new Date().toISOString();

        query = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
        query.setParameter('@id', templateId);
        query.setParameter('@companyId', companyId);
        query.setParameter('@type', EsignatureMetadataType.Template);
        query.setParameter('@uploadDate', uploadDate);
        query.setParameter('@uploadedBy', `'${uploadedBy}'`);
        query.setParameter('@title', `'${title}'`);
        query.setParameter('@fileName', `'${fileName}'`);
        query.setParameter('@category', category);
        query.setParameter('@employeeCode', 'NULL');
        payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        return {
            id: templateId,
            uploadDate,
            uploadedBy,
            title,
            fileName,
            category,
        } as TemplateMetadata;
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Template not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
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
    suppliedMetadata: any = {},
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

        const templateResponse = await eSigner.template.get(request.templateId);
        const additionalMetadata = {
            category: templateResponse.template.metadata.category,
            tenantId,
            companyId,
            employeeCodes: request.employeeCodes,
            uploadDate: new Date().toISOString(),
        };
        const metadata = { ...suppliedMetadata, ...additionalMetadata };

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
        const { signature_request_id: requestId, title } = signatureRequest;
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

        // Save signature request metadata to the database
        for (const code of request.employeeCodes) {
            const query = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
            query.setParameter('@id', requestId);
            query.setParameter('@companyId', companyId);
            query.setParameter('@type', EsignatureMetadataType.SignatureRequest);
            query.setParameter('@uploadDate', new Date().toISOString());
            query.setParameter('@uploadedBy', 'NULL');
            query.setParameter('@title', `'${title}'`);
            query.setParameter('@fileName', 'NULL');
            query.setParameter('@category', templateResponse.template.metadata.category);
            query.setParameter('@employeeCode', `'${code}'`);
            const payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        }

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

        if (error instanceof ErrorMessage) {
            throw error;
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

    try {
        const query = new ParameterizedQuery('GetEmployeeDisplayNameById', Queries.getEmployeeDisplayNameById);
        query.setParameter('@employeeId', employeeId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

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
            employeeCodes: [request.employeeCode],
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
    }
}

/**
 * Lists all templates under a specified company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} company: The unique identifier for the company the user belongs to.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {Promise<PaginatedResult>}: Promise of a paginated array of templates
 */
export async function listTemplates(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('esignatureService.listTemplates');

    const validQueryStringParameters = ['pageToken', 'consolidated'];

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

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

        let query: ParameterizedQuery;
        // Get template IDs from the database
        if (queryParams && queryParams.consolidated === 'true') {
            query = new ParameterizedQuery('GetConslidatedDocumentsByCompanyId', Queries.getConsolidatedCompanyDocumentsByCompanyId);
        } else {
            query = new ParameterizedQuery('GetEsignatureMetadataByCompanyId', Queries.getEsignatureMetadataByCompanyId);
        }
        query.setParameter('@companyId', companyId);
        query.setParameter('@type', EsignatureMetadataType.Template);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const documents: any[] = result.recordsets[1];
        const totalRecords: number = result.recordsets[0][0].totalCount;

        if (documents.length === 0) {
            return undefined;
        }

        const consolidatedDocuments: any[] = [];

        // Extract template file information for document metadata
        for (const document of documents) {
            if (document.Type === 'legacy') {
                consolidatedDocuments.push({
                    id: document.ID,
                    title: document.Title,
                    filename: document.Filename,
                    uploadDate: document.UploadDate,
                    isLegacyDocument: true,
                    uploadedBy: `${document.FirstName} ${document.LastName}`,
                    category: document.Category,
                });
            } else {
                try {
                    const apiResponse = await client.template.get(document.ID);
                    const {
                        template_id: id,
                        title,
                        message,
                        can_edit: editable,
                        is_locked: isLocked,
                        signer_roles,
                        cc_roles,
                        custom_fields,
                        documents: files,
                        metadata: { uploadDate, uploadedBy, category },
                    } = apiResponse.template;
                    const fileName = files[0].name;
                    consolidatedDocuments.push(
                        new Template({
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
                            uploadDate,
                            uploadedBy,
                            isLegacyDocument: queryParams && queryParams.consolidated === 'true' ? false : undefined,
                            category,
                        }),
                    );
                } catch (error) {
                    console.error(`issue accessing template id: ${document.id}`);
                }
            }
        }

        const paginatedResult = await paginationService.createPaginatedResult(consolidatedDocuments, baseUrl, totalRecords, page);
        return consolidatedDocuments.length === 0 ? undefined : paginatedResult;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Creates a sign url for a specified employee
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {string} employeeId: The unique identifer for the employee
 * @param {string} signatureId: The unique identifer for signature requested of the employee
 * @returns {Promise<SignUrl>}: A Promise of a sign url
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
        return new SignUrl({
            url: sign_url,
            expiration: expires_at,
            clientId: appClientId,
        });
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Signature not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Creates an edit url for an e-signature template
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {string} templateId: The unique identifer for the template
 * @returns {Promise<EditUrl>}: A Promise of an edit url
 */
export async function createEditUrl(tenantId: string, companyId: string, templateId: string): Promise<EditUrl> {
    console.info('esignatureService.createEditUrl');

    try {
        // Company validation
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);
        const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            tenantId,
            companyInfo.clientId,
            companyId,
        );
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;

        const response = JSON.parse(await hellosignService.getTemplateEditUrlById(templateId));

        const { edit_url, expires_at } = response.embedded;
        return new EditUrl({
            url: edit_url,
            expiration: expires_at,
            clientId: appClientId,
        });
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Unable to retrieve the edit url')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all documents for E-Signature under a specified company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a collection documents' metadata
 */
export async function listDocuments(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName?: string,
    path?: string,
    useMaxLimit: boolean = false,
): Promise<PaginatedResult> {
    console.info('esignatureService.listDocuments');

    const validQueryStringParameters: string[] = ['category', 'categoryId', 'docType', 'pageToken'];

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

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    const filterByHelloSignDocuments: boolean = queryParams.docType && queryParams.docType.toLowerCase() === 'hellosign' ? true : false;
    const filterByOriginalDocuments: boolean = queryParams.docType && queryParams.docType.toLowerCase() === 'original' ? true : false;
    const taskListId = Number(queryParams.categoryId);

    try {
        const companyInfo: CompanyDetail = await getCompanyDetails(tenantId, companyId);

        const query = new ParameterizedQuery('GetTaskListDocuments', Queries.getTaskListDocuments);
        query.setParameter('@companyId', companyId);
        query.setParameter('@taskListId', taskListId);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page, useMaxLimit);
        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const totalRecords: number = result.recordsets[0][0].totalCount;

        let documents: DocumentMetadata[] = (result.recordsets[1] || []).map((entry) => {
            return {
                id: entry.ID,
                filename: entry.Filename,
                title: entry.Title,
                description: entry.Description,
            };
        });

        if (filterByOriginalDocuments) {
            const originalDocs = documents.filter((doc) => doc.filename.includes('.'));
            const originalDocsResponse = new DocumentMetadataListResponse({ results: originalDocs });
            const paginatedResult =
                originalDocs.length === 0
                    ? undefined
                    : await paginationService.createPaginatedResult(originalDocsResponse, baseUrl, totalRecords, page);
            return paginatedResult;
        }

        if (filterByHelloSignDocuments) {
            documents = documents.filter((doc) => !doc.filename.includes('.'));
        }

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
                try {
                    const apiResponse = await eSigner.template.get(doc.filename);
                    doc.filename = apiResponse.template.documents[0].name;
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

        const documentsPaginatedResult = await paginationService.createPaginatedResult(documents, baseUrl, totalRecords, page);
        return documents.length === 0 ? undefined : documentsPaginatedResult;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all signature requests for E-Signature under a specified company if the user is not a manager.
 * Lists all signature requests for users under the specified company who report to the user if user is a manager.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} emailAddress: The identifier for the user.
 * @param {boolean} isManager: True if user has the hr.persona.manager role.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A promise of a paginated collection of signature requests'/legacy documents' metadata.
 */
export async function listCompanySignatureRequests(
    tenantId: string,
    companyId: string,
    emailAddress: string,
    isManager: boolean,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('esignatureService.listCompanySignatureRequests');

    const validQueryStringParameters: string[] = ['status', 'consolidated'];
    const validStatusValues: string[] = ['signed', 'pending'];

    if (queryParams) {
        // Check for unsupported query params
        if (!Object.keys(queryParams).every((param) => validQueryStringParameters.includes(param))) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
            throw error;
        }

        if (queryParams.status && !validStatusValues.includes(queryParams.status)) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage(`Unsupported value: ${queryParams.status}`)
                .setMoreInfo(`Available values for status: ${validStatusValues.join(', ')}. See documentation for usage.`);
            throw error;
        }

        if (queryParams.consolidated && queryParams.consolidated !== 'true') {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage(`Unsupported value: ${queryParams.consolidated}`)
                .setMoreInfo(`Available values for status: true. See documentation for usage.`);
            throw error;
        }
    }

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query: ParameterizedQuery;
        let payload: DatabaseEvent;
        let result: any;
        const subordinateEmails: string[] = [];
        const subordinateCodes: string[] = [];

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

        if (isManager) {
            query = new ParameterizedQuery('GetEmployeeEmailsByManager', Queries.getEmployeeEmailsByManager);
            query.setParameter('@managerEmail', emailAddress);
            payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            result = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
            result.recordset.forEach(({ EmailAddress, EmployeeCode }) => {
                subordinateEmails.push(EmailAddress);
                subordinateCodes.push(EmployeeCode);
            });
        }

        // Get request and document IDs from the database
        if (queryParams && queryParams.consolidated === 'true') {
            if (isManager) {
                query = new ParameterizedQuery('GetConsolidatedEmployeeDocumentsByEE', Queries.getConsolidatedEmployeeDocumentsByEE);
                query.setParameter('@eeEmails', `'${subordinateEmails.join("', '")}'`);
                query.setParameter('@companyId', companyId);
            } else {
                query = new ParameterizedQuery(
                    'GetConsolidatedEmployeeDocumentsByCompanyId',
                    Queries.getConsolidatedEmployeeDocumentsByCompanyId,
                );
                query.setParameter('@companyId', companyId);
            }
        } else {
            if (isManager) {
                query = new ParameterizedQuery('GetEsignatureMetadataByEE', Queries.getEsignatureMetadataByEE);
                query.setParameter(new RegExp('@employeeCodes', 'g'), `'${subordinateCodes.join("', '")}'`);
            } else {
                query = new ParameterizedQuery('GetEsignatureMetadataByCompanyId', Queries.getEsignatureMetadataByCompanyId);
                query.setParameter('@companyId', companyId);
            }
        }
        query.setParameter('@type', EsignatureMetadataType.SignatureRequest);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        result = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const requests: any[] = result.recordsets[1];
        const totalRecords: number = result.recordsets[0][0].totalCount;

        if (requests.length === 0) {
            return undefined;
        }

        const consolidatedRequests: any[] = [];

        for (const request of requests) {
            if (request.Type === 'legacy') {
                const {
                    ID: id,
                    Filename: filename,
                    Title: title,
                    ESignDate: eSignDate,
                    EmailAddress,
                    EmployeeCode: employeeCode,
                } = request;
                consolidatedRequests.push({
                    id,
                    filename,
                    title,
                    eSignDate,
                    emailAddress: EmailAddress,
                    employeeCode,
                });
            } else {
                try {
                    const apiResponse = await client.signatureRequest.get(request.ID);
                    const { signature_request_id: id, title, is_complete, signatures } = apiResponse.signature_request;
                    if (queryParams && queryParams.status) {
                        if ((queryParams.status === 'signed' && !is_complete) || (queryParams.status === 'pending' && is_complete)) {
                            continue;
                        }
                    }
                    consolidatedRequests.push({
                        id,
                        title,
                        status: is_complete ? SignatureRequestResponseStatus.Complete : SignatureRequestResponseStatus.Pending,
                        signatures: signatures.map((signature) => {
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
                            } as Signature;
                        }),
                    } as SignatureRequestResponse);
                } catch (error) {
                    console.error(`issue accessing signature request id: ${request.ID}`);
                }
            }
        }

        const paginatedResult = await paginationService.createPaginatedResult(consolidatedRequests, baseUrl, totalRecords, page);
        return consolidatedRequests.length === 0 ? undefined : paginatedResult;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
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

    const { onboardingKey, taskListId, emailAddress, name, employeeCode } = requestBody;

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

        const taskListTemplates = await listDocuments(tenantId, companyId, getDocumentsQueryParams, undefined, undefined, true);

        if (!taskListTemplates) {
            return undefined;
        }

        const signatureRequestMetadata = { onboardingKey };
        const signatureRequests: SignatureRequestResponse[] = [];

        for (const template of taskListTemplates.results) {
            const signatureRequest: BulkSignatureRequest = {
                templateId: template.id,
                employeeCodes: [employeeCode],
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

        if (error instanceof ErrorMessage) {
            throw error;
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
    Delete = 'delete',
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
    const eventCallbackUrl = `${configService.getHrServicesDomain()}/${configService.getEsignatureCallbackPath()}`;

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
                    } = await hellosignService.createApplicationForCompany(companyId, domain, eventCallbackUrl);
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

            case Operation.Delete:
                console.log('Deleting a HelloSign App');
                if (!integrationConfiguration) {
                    throw errorService.getErrorResponse(50).setDeveloperMessage('No existing e-signature configuration found');
                }
                const iconfig = await integrationsService.getIntegrationConfigurationByCompany(tenantId, clientId, companyId);
                await integrationsService.deleteIntegrationConfigurationbyId(tenantId, clientId, companyId, integrationConfiguration);
                await hellosignService.deleteApplicationById(iconfig.integrationDetails.eSignatureAppClientId);

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

    try {
        // Check that the company id is valid.
        const query = new ParameterizedQuery('GetCompanyInfo', Queries.companyInfo);
        query.setParameter('@companyId', companyId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The company id: ${companyId} not found`);
        }

        const companyInfo: CompanyDetail[] = result.recordset.map((entry) => {
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
        console.error(`Unable to retrieve company info. Reason: ${error}`);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all e-signed documents and legacy documents for employees in a specified tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {any} queryParams: The query parameters generated for paged results.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {string} emailAddress: The email address of the user.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee e-signed and legacy documents.
 */
export async function listEmployeeDocumentsByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
    emailAddress: string,
): Promise<PaginatedResult> {
    console.info('esignature.service.listEmployeeDocumentsByTenant');

    const validQueryStringParameters = ['pageToken'];

    validateQueryStringParameters(validQueryStringParameters, queryParams);
    const query = new ParameterizedQuery('GetEmployeeLegacyAndSignedDocs', Queries.getEmployeeLegacyAndSignedDocuments);
    query.setParameter('@user', emailAddress);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    return await getEmployeeLegacyAndSignedDocuments(tenantId, query, baseUrl, page);
}

/**
 * Lists all e-signed documents and legacy documents for employees in a specified tenant
 * for a given company
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} companyId: The unique identifier for the company
 * @param {any} queryParams: The query parameters generated for paged results.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {boolean} isManager: whether the user is a manager
 * @param {string} emailAddress: user email address.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee e-signed and legacy documents.
 */
export async function listEmployeeDocumentsByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
    isManager: boolean,
    emailAddress: string,
): Promise<PaginatedResult> {
    console.info('esignature.service.listEmployeeDocumentsByCompany');

    const validQueryStringParameters = ['pageToken'];
    let query: ParameterizedQuery;

    validateQueryStringParameters(validQueryStringParameters, queryParams);
    query = new ParameterizedQuery('GetEmployeeLegacyAndSignedDocsByCompanyId', Queries.getEmployeeLegacyAndSignedDocumentsByCompanyId);
    if (isManager) {
        query = new ParameterizedQuery(
            'GetEmployeeLegacyAndSignedDocsByCompanyIdForManager',
            Queries.getEmployeeLegacyAndSignedDocumentsByCompanyForManager,
        );
        query.setParameter('@manager', emailAddress);
    }
    query.setParameter('@companyId', companyId);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    return await getEmployeeLegacyAndSignedDocuments(tenantId, query, baseUrl, page);
}

/**
 * Lists all e-signed documents and legacy documents for specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee e-signed and legacy documents.
 */
export async function listEmployeeDocuments(
    tenantId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('esignature.service.listEmployeeDocuments');

    const validQueryStringParameters = ['pageToken'];

    validateQueryStringParameters(validQueryStringParameters, queryParams);
    const query: ParameterizedQuery = new ParameterizedQuery(
        'GetEmployeeLegacyAndSignedDocsByEmployeeId',
        Queries.getEmployeeLegacyAndSignedDocumentsByEmployeeId,
    );
    query.setParameter('@employeeId', employeeId);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    return await getEmployeeLegacyAndSignedDocuments(tenantId, query, baseUrl, page);
}

/**
 * Retrieves an employee legacy and e-signed documents
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {Query} query: The query to be executed
 * @param {string} baseUrl: The url used for the api call
 * @param {number} page: The requested page number
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee e-signed and legacy documents
 */
async function getEmployeeLegacyAndSignedDocuments(
    tenantId: string,
    query: Query,
    baseUrl: string,
    page: number,
): Promise<PaginatedResult> {
    console.info('esignature.service.getEmployeeLegacyAndSignedDocuments');
    try {
        const payload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const documents: any[] = result.recordsets[1];
        const totalRecords: number = result.recordsets[0][0].totalCount;

        if (documents.length === 0) {
            return undefined;
        }

        return await paginationService.createPaginatedResult(documents, baseUrl, totalRecords, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates a given query string collection.
 * @param {string []} validInputs - Validate query string parameters
 * @param {any} queryParameters - The query string parameters
 */
function validateQueryStringParameters(validInputs: string[], queryParameters: any): void {
    console.info('esignature.service.validateQueryStringParameters');
    if (queryParameters) {
        if (!Object.keys(queryParameters).every((param) => validInputs.includes(param))) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${validInputs.join(',')}. See documentation for usage.`);
            throw error;
        }
    }
}

import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import Hashids from 'hashids';
import * as hellosign from 'hellosign-sdk';
import * as uuidV4 from 'uuid/v4';

import * as pSettle from 'p-settle';
import * as shortid from 'shortid';
import * as employeeService from '../../../api/tenants/src/employee.service';
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
import { DocumentCategory, DocumentMetadata } from './documents/document';
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
 * @param {TemplateRequest} request: The template request.
 * @param {string} email: The email address associated with the user.
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
        const { appDetails, eSigner: client } = await getConfigurationData(tenantId, companyId);
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;

        const options = {
            test_mode: configService.eSignatureApiDevModeOn() ? 1 : 0,
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
 * @param {string} emailAddress: The email address associated with the user.
 * @param {any} requestBody: The template metadata request.
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
        query.setParameter('@title', `'${title.replace(/'/g, "''")}'`);
        query.setParameter('@fileName', `'${fileName.replace(/'/g, "''")}'`);
        query.setParameter('@category', category ? `'${category}'` : 'NULL');
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
            isEsignatureDocument: true,
            isPublishedToEmployee: false,
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
 * @param {any} suppliedMetadata: The metadata to be associated with the signature request
 * @param {EsignatureConfiguration} configuration: The e-signature configuration data
 * @returns {SignatureRequestResponse}: Promise of a completed e-signature request.
 */
export async function createBulkSignatureRequest(
    tenantId: string,
    companyId: string,
    request: BulkSignatureRequest,
    suppliedMetadata: any,
    configuration: EsignatureConfiguration,
): Promise<SignatureRequestResponse> {
    console.info('esignature.handler.createBulkSignatureRequest');

    try {
        if (!configuration) {
            configuration = await getConfigurationData(tenantId, companyId);
        }
        const { eSigner } = configuration;

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
            test_mode: configService.eSignatureApiDevModeOn() ? 1 : 0,
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

        const queryExecutions: Array<Promise<any>> = [];
        const { category } = templateResponse.template.metadata;

        // Save signature request metadata to the database
        for (const code of request.employeeCodes) {
            const query = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
            query.setParameter('@id', requestId);
            query.setParameter('@companyId', companyId);
            query.setParameter('@type', EsignatureMetadataType.SignatureRequest);
            query.setParameter('@uploadDate', new Date().toISOString());
            query.setParameter('@uploadedBy', 'NULL');
            query.setParameter('@title', `'${title.replace(/'/g, "''")}'`);
            query.setParameter('@fileName', 'NULL');
            query.setParameter('@category', category ? `'${category}'` : 'NULL');
            query.setParameter('@employeeCode', `'${code}'`);
            const payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            queryExecutions.push(utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse));
        }

        await Promise.all(queryExecutions);

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
        const query = new ParameterizedQuery('GetEmployeeInfoById', Queries.getEmployeeInfoById);
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
            throw errorService.getErrorResponse(50).setDeveloperMessage('Employee record not found');
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

        const configuration: EsignatureConfiguration = await getConfigurationData(tenantId, companyId);
        return await createBulkSignatureRequest(tenantId, companyId, bulkSignRequest, {}, configuration);
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

    const validQueryStringParameters = ['pageToken', 'consolidated', 'onboarding'];

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    // cannot get onboarding and consolidated documents at the same time
    if (queryParams && queryParams.consolidated && queryParams.onboarding) {
        const errorMessage = 'Query params may contain either consolidated=true or onboarding=true, not both';
        throw errorService.getErrorResponse(60).setDeveloperMessage(errorMessage);
    }

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const { eSigner: client } = await getConfigurationData(tenantId, companyId);

        let query: ParameterizedQuery;
        // Get template IDs from the database
        if (queryParams && queryParams.consolidated === 'true') {
            query = new ParameterizedQuery('GetConslidatedDocumentsByCompanyId', Queries.getConsolidatedCompanyDocumentsByCompanyId);
        } else if (queryParams && queryParams.onboarding === 'true') {
            query = new ParameterizedQuery('GetOnboardingDocumentsByCompanyId', Queries.getOnboardingDocumentsByCompanyId);
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

        const salt = JSON.parse(await utilService.getSecret(configService.getSaltId())).salt;
        const hashids = new Hashids(salt);

        const reducer = async (memoPromise, document) => {
            const memo = await memoPromise;
            if (document.Type === 'non-signature' || document.Type === 'legacy') {
                const filename =
                    document.Type === 'non-signature'
                        ? document.Filename.split('/')[document.Filename.split('/').length - 1]
                        : document.Filename;
                const uploadedBy =
                    document.Type === 'non-signature'
                        ? document.FirstName // Note: the query returns the full name as the FirstName field
                        : `${document.FirstName} ${document.LastName}`;
                const id = hashids.encode(document.ID, document.Type === 'non-signature' ? DocType.S3Document : DocType.LegacyDocument);
                memo.push({
                    id,
                    title: document.Title,
                    filename,
                    uploadDate: document.UploadDate,
                    isEsignatureDocument: false,
                    uploadedBy,
                    category: document.Category,
                    isPublishedToEmployee: document.IsPublishedToEmployee,
                    existsInTaskList: document.ExistsInTaskList,
                });
            }
            return memo;
        };
        const consolidatedDocuments: any[] = await documents.reduce(reducer, []);

        const invocations: Array<Promise<any>> = [];

        // extract esignature documentation metadata
        const nonLegacyDocuments = documents.filter((doc) => doc.Type === 'esignature');
        nonLegacyDocuments.forEach((document) => {
            invocations.push(client.template.get(document.ID));
        });

        const templateApiResults = await pSettle(invocations);

        templateApiResults.forEach((apiInvocation, index) => {
            if (apiInvocation) {
                if (apiInvocation.isFulfilled) {
                    const apiResponse = apiInvocation.value;

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
                            isEsignatureDocument: true,
                            category,
                            existsInTaskList: nonLegacyDocuments[index].ID === id ? nonLegacyDocuments[index].ExistsInTaskList : undefined,
                        }),
                    );
                }

                if (apiInvocation.isRejected) {
                    const failingDocumentId = nonLegacyDocuments[index];
                    console.error(`issue accessing template id: ${failingDocumentId}`);
                }
            }
        });

        consolidatedDocuments.sort((a, b) => (new Date(a.uploadDate).getTime() > new Date(b.uploadDate).getTime() ? -1 : 1));

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
        const { appDetails, eSigner } = await getConfigurationData(tenantId, companyId);
        const appClientId = appDetails.integrationDetails.eSignatureAppClientId;

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
        const { appDetails } = await getConfigurationData(tenantId, companyId);
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
 * @param {boolean} useMaxLimit: Determines whether or not to use the maximum limit for pagination.
 * @param {EsignatureConfiguration} configuration: The e-signature configuration data.
 * @returns {PaginatedResult}: A Promise of a collection documents' metadata
 */
export async function listDocuments(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
    useMaxLimit: boolean,
    configuration: EsignatureConfiguration,
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
        if (!configuration) {
            configuration = await getConfigurationData(tenantId, companyId);
        }
        const { eSigner } = configuration;

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
            const paginatedResult =
                originalDocs.length === 0
                    ? undefined
                    : await paginationService.createPaginatedResult(originalDocs, baseUrl, totalRecords, page);
            return paginatedResult;
        }

        if (filterByHelloSignDocuments) {
            documents = documents.filter((doc) => !doc.filename.includes('.'));
        }

        const unfoundDocuments: DocumentMetadata[] = [];

        const invocations: Array<Promise<any>> = [];

        for (const doc of documents) {
            if (!doc.filename.includes('.')) {
                invocations.push(eSigner.template.get(doc.filename));
            }
        }

        // Run template api calls in parallel
        const templateApiResults = await pSettle(invocations);

        // Extract template file information for document metadata
        for (let index = 0; index < documents.length; index++) {
            const doc = documents[index];
            if (!doc.filename.includes('.')) {
                const templateApiInvocation = templateApiResults[index];

                if (templateApiInvocation) {
                    if (templateApiInvocation.isFulfilled) {
                        const apiResponse = templateApiInvocation.value;
                        doc.filename = apiResponse.template.documents[0].name;
                        doc.title = apiResponse.template.title;
                    }

                    if (templateApiInvocation.isRejected) {
                        console.error(`issue accessing template id: ${doc.filename}`);
                        unfoundDocuments.push(doc);
                    }
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

        console.error(`${JSON.stringify(error)} raw error: ${error}`);
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
                .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(', ')}. See documentation for usage.`);
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

        const { eSigner: client } = await getConfigurationData(tenantId, companyId);

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
 * This returns a paginated list of all unique document categories among all of a company's documents
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {any} queryParams: The query parameters that were specified by the user. (Only page in this case)
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {Promise<PaginatedResult>}: A promise of a paginated list of document categories
 */
export async function listCompanyDocumentCategories(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('esignatureService.listCompanyDocumentCategories');

    const validQueryStringParameters: string[] = ['pageToken'];

    if (queryParams) {
        // Check for unsupported query params
        if (!Object.keys(queryParams).every((param) => validQueryStringParameters.includes(param))) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
            throw error;
        }
    }

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        await utilService.validateCompany(tenantId, companyId);

        const query = new ParameterizedQuery('GetCompanyDocumentCategories', Queries.getDocumentCategoriesByCompany);
        query.setParameter('@companyId', companyId);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        if (result.recordsets[1].length === 0) {
            return undefined;
        }
        const categories: DocumentCategory[] = result.recordsets[1].map((entry) => ({ value: entry.Category, label: entry.Category }));
        const totalResults: number = result.recordsets[0][0].totalCount;
        return paginationService.createPaginatedResult(categories, baseUrl, totalResults, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(`Failed to get document category list, reason: ${JSON.stringify(error)}`);
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
        const configuration: EsignatureConfiguration = await getConfigurationData(tenantId, companyId);
        const { eSigner } = configuration;

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

        const taskListTemplates = await listDocuments(
            tenantId,
            companyId,
            getDocumentsQueryParams,
            undefined,
            undefined,
            true,
            configuration,
        );

        if (!taskListTemplates) {
            return undefined;
        }

        const signatureRequestMetadata = { onboardingKey };
        const signatureRequests: SignatureRequestResponse[] = [];

        const invocations: Array<Promise<SignatureRequestResponse>> = [];

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

            invocations.push(createBulkSignatureRequest(tenantId, companyId, signatureRequest, signatureRequestMetadata, configuration));
        }

        const creations = await Promise.all(invocations);
        for (const created of creations) {
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
    const adminToken = await utilService.generateAdminToken();
    const eventCallbackUrl = `${configService.getHrServicesDomain()}/${configService.getEsignatureCallbackPath()}`;

    // Get configuration
    const integrationConfiguration: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
        tenantId,
        clientId,
        companyId,
        adminToken,
    );

    try {
        switch (config.op) {
            case Operation.Add:
                console.log('Adding a configuration');
                if (integrationConfiguration) {
                    integrationConfiguration.integrationDetails.enabled = true;
                    await integrationsService.updateIntegrationConfigurationById(
                        tenantId,
                        clientId,
                        companyId,
                        integrationConfiguration,
                        adminToken,
                    );
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
                            adminToken,
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
                await integrationsService.updateIntegrationConfigurationById(
                    tenantId,
                    clientId,
                    companyId,
                    integrationConfiguration,
                    adminToken,
                );

                break;

            case Operation.Delete:
                console.log('Deleting a HelloSign App');
                if (!integrationConfiguration) {
                    throw errorService.getErrorResponse(50).setDeveloperMessage('No existing e-signature configuration found');
                }
                const iconfig = await integrationsService.getIntegrationConfigurationByCompany(tenantId, clientId, companyId, adminToken);
                await integrationsService.deleteIntegrationConfigurationbyId(
                    tenantId,
                    clientId,
                    companyId,
                    integrationConfiguration,
                    adminToken,
                );
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

    const validQueryStringParameters = ['pageToken', 'search'];

    validateQueryStringParameters(validQueryStringParameters, queryParams);

    try {
        const query = new ParameterizedQuery('GetEmployeeLegacyAndSignedDocs', Queries.getEmployeeLegacyAndSignedDocuments);
        query.setParameter('@user', emailAddress);

        const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

        queryParams && queryParams.search
            ? query.setStringParameter('@search', queryParams.search)
            : query.setStringParameter('@search', '');

        return await getEmployeeLegacyAndSignedDocuments(tenantId, query, baseUrl, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
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

    const validQueryStringParameters = ['pageToken', 'search'];
    let query: ParameterizedQuery;

    validateQueryStringParameters(validQueryStringParameters, queryParams);

    try {
        await getCompanyDetails(tenantId, companyId);

        query = new ParameterizedQuery('GetEmployeeLegacyAndSignedDocsByCompanyId', Queries.getEmployeeLegacyAndSignedDocumentsByCompanyId);
        if (isManager) {
            query = new ParameterizedQuery(
                'GetEmployeeLegacyAndSignedDocsByCompanyIdForManager',
                Queries.getEmployeeLegacyAndSignedDocumentsByCompanyForManager,
            );
            query.setParameter('@manager', emailAddress);
        }
        query.setParameter('@companyId', companyId);
        queryParams && queryParams.search
            ? query.setStringParameter('@search', queryParams.search)
            : query.setStringParameter('@search', '');
        const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

        return await getEmployeeLegacyAndSignedDocuments(tenantId, query, baseUrl, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all e-signed documents and legacy documents for specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {boolean} includePrivateDocumentation: Indicates whether the results should include private documents
 * @param {string} invokerUsername: The username of the account invoking this service
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee e-signed and legacy documents.
 */
export async function listEmployeeDocuments(
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
    includePrivateDocumentation: boolean,
    invokerUsername: string,
): Promise<PaginatedResult> {
    console.info('esignature.service.listEmployeeDocuments');

    const validQueryStringParameters = ['pageToken', 'search'];

    validateQueryStringParameters(validQueryStringParameters, queryParams);

    try {
        // validate company and employee id
        await Promise.all([validateEmployeeId(tenantId, companyId, employeeId), getCompanyDetails(tenantId, companyId)]);

        const query = new ParameterizedQuery(
            'GetEmployeeLegacyAndSignedDocsByEmployeeId',
            Queries.getEmployeeLegacyAndSignedDocumentsByEmployeeId,
        );
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@includePrivateDocuments', includePrivateDocumentation ? 1 : 0);
        query.setParameter('@invokerUsername', `'${invokerUsername}'`);
        queryParams && queryParams.search
            ? query.setStringParameter('@search', queryParams.search)
            : query.setStringParameter('@search', '');
        const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

        return await getEmployeeLegacyAndSignedDocuments(tenantId, query, baseUrl, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Generates a document preview for a specified signed document under a tenant
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} id: The unique identifer for the specified document
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function getDocumentPreview(tenantId: string, id: string): Promise<any> {
    console.info('esignatureService.getDocumentPreview');

    try {
        const decoded = await decodeId(id);

        // if id does not decode properly, assume it's a HelloSign document
        if (decoded.length === 0) {
            return await getTemplateFiles(id);
        }

        const [documentId, type] = decoded;

        if (!documentId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage(`Invalid document ID supplied: ${id}`);
        }

        if (type === DocType.LegacyDocument) {
            return await getLegacyDocument(tenantId, documentId);
        }
        return await getNonLegacyDocument(tenantId, documentId);
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Not found')) {
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
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload: DatabaseEvent = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        };
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const documents: any[] = result.recordsets[1];
        const totalRecords: number = result.recordsets[0][0].totalCount;

        if (documents.length === 0) {
            return undefined;
        }

        const salt = JSON.parse(await utilService.getSecret(configService.getSaltId())).salt;
        const hashids = new Hashids(salt);

        const updatedDocuments = [];
        for (const document of documents) {
            const id = hashids.encode(document.id, document.isLegacyDocument ? DocType.LegacyDocument : DocType.S3Document);
            // set defaults for legacy documents
            // note: default to false if value is null for isPublishedToEmployee and isPrivate flags
            let isPublishedToEmployee = document.isPublishedToEmployee !== null ? document.isPublishedToEmployee : false;
            let isPrivate = document.isPrivateDocument !== null ? document.isPrivateDocument : false;
            let isSignedDocument = false;
            if (!document.isLegacyDocument) {
                isSignedDocument = !document.uploadedBy && document.category === 'onboarding';
                if (document.employeeCode) {
                    isPublishedToEmployee = false;
                    isPrivate = document.isPublishedToEmployee !== null ? !document.isPublishedToEmployee : false;
                } else {
                    isPrivate = false;
                }
            }
            updatedDocuments.push({
                id,
                title: document.title,
                fileName: document.fileName,
                category: document.category,
                uploadDate: document.uploadDate,
                esignDate: document.esignDate,
                isPrivate,
                isPublishedToEmployee,
                employeeId: document.employeeId,
                employeeCode: document.employeeCode,
                employeeName: document.firstName && document.lastName ? `${document.firstName} ${document.lastName}` : undefined,
                companyId: document.companyId,
                companyName: document.companyName,
                isSignedDocument,
                uploadedBy: document.uploadedBy,
            });
        }

        return await paginationService.createPaginatedResult(updatedDocuments, baseUrl, totalRecords, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

const s3Client = new AWS.S3({
    region: configService.getAwsRegion(),
});

/**
 * Retrieves a non-legacy document
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {number} documentId: The unique identifier of the specified document
 * @returns {any}: A Promise of a presigned URL
 */
async function getNonLegacyDocument(tenantId: string, documentId: number): Promise<any> {
    console.info('esignature.service.getNonLegacyDocument');

    try {
        const query = new ParameterizedQuery('GetFileMetadataById', Queries.getFileMetadataById);
        query.setParameter('@id', documentId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        const key = result.recordset[0].Pointer;

        const params = {
            Bucket: configService.getFileBucketName(),
            Key: key,
        };
        const url = s3Client.getSignedUrl('getObject', params);
        // parse key to get file extension
        const mimeType = key.split('.')[key.split('.').length - 1];

        return result ? { data: url, mimeType: `.${mimeType}` } : undefined;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Retrieves an HR legacy document
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {number} documentId: The unique identifier of the specified document
 * @returns {any}: A Promise of a document
 */
async function getLegacyDocument(tenantId: string, documentId: number): Promise<any> {
    console.info('esignature.service.getLegacyDocument');

    try {
        const query = new ParameterizedQuery('GetDocumentById', Queries.getDocumentById);
        query.setParameter('@id', documentId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        const base64String = result.recordset[0].FSDocument;
        const extension = result.recordset[0].Extension;

        return result ? { data: `data:application/${extension};base64,${base64String}`, mimeType: extension } : undefined;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Generates a document preview for a specified signed document under a tenant
 * @param {string} templateId: The unique identifer for the specified template
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function getTemplateFiles(templateId: any): Promise<any> {
    console.info('esignatureService.getTemplateFiles');

    try {
        const data = JSON.parse(await hellosignService.getTemplateFilesById(templateId)).data_uri;
        return { data, mimeType: '.pdf' };
    } catch (error) {
        console.log(JSON.stringify(error));
        if (error.message) {
            if (error.message.includes('Template not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        if (error instanceof ErrorMessage) {
            throw error;
        }

        throw errorService.getErrorResponse(0);
    }
}

/**
 * Creates a specified document record for an employee and uploads the file to S3
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} employeeId: The unique identifier for the specified employee.
 * @param {any} request: The employee document request.
 * @param {string} firstName: The first name of the invoking user.
 * @param {string} lastName: The last name of the invoking user.
 * @returns {any}: A Promise of a created employee document
 */
export async function createEmployeeDocument(
    tenantId: string,
    companyId: string,
    employeeId: string,
    request: any,
    firstName: string,
    lastName: string,
): Promise<any> {
    console.info('esignature.service.createEmployeeDocument');

    const { file, fileName, title, isPrivate } = request;

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    // employeeId value must be integral
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        // get employee code and check if employee exists
        let query = new ParameterizedQuery('GetEmployeeInfoById', Queries.getEmployeeInfoById);
        query.setParameter('@employeeId', employeeId);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [employeeResult, companyResult]: any[] = await Promise.all([
            utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse),
            getCompanyDetails(tenantId, companyId),
        ]);

        if (employeeResult.recordset.length === 0) {
            const developerMessage = `Employee with ID ${employeeId} not found.`;
            throw errorService.getErrorResponse(50).setDeveloperMessage(developerMessage);
        }
        const employee = employeeResult.recordset[0];
        const employeeCode = employee.EmployeeCode;
        const employeeName = employee.FirstName && employee.LastName ? `${employee.FirstName} ${employee.LastName}` : undefined;
        const companyName = companyResult.name;

        // upload to S3
        const [fileData, fileContent] = file.split(',');
        const fileBuffer = new Buffer(fileContent, 'base64');
        const contentType = fileData.split(':')[1].split(';')[0];
        const extension = fileData.split(';')[0].split('/')[1];

        let key = `${tenantId}/${companyId}/${employeeId}/${fileName}`;
        let updatedFilename: string = fileName;

        [updatedFilename, key] = await checkForFileExistence(key, fileName, tenantId, companyId);

        key = utilService.sanitizeForS3(key);

        s3Client
            .upload({
                Bucket: configService.getFileBucketName(),
                Key: key,
                Body: fileBuffer,
                Metadata: {
                    fileName,
                },
                ContentEncoding: 'base64',
                ContentType: contentType,
            })
            .promise()
            .catch((e) => {
                throw new Error(e);
            });

        // create file metadata
        const uploadDate = new Date().toISOString();
        query = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
        query.setParameter('@companyId', companyId);
        query.setParameter('@employeeCode', `'${employeeCode}'`);
        query.setParameter('@title', `${title.replace(/'/g, "''")}`);
        query.setParameter('@category', 'NULL');
        query.setParameter('@uploadDate', uploadDate);
        query.setParameter('@pointer', key.replace(/'/g, "''"));
        query.setParameter('@uploadedBy', `'${firstName} ${lastName}'`);
        query.setParameter('@isPublishedToEmployee', isPrivate ? '0' : '1');
        payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const id = await encodeId(fileMetadataResult.recordset[0].ID, DocType.S3Document);

        const response = {
            id,
            title,
            fileName: updatedFilename,
            extension,
            uploadDate,
            isEsignatureDocument: false,
            employeeId: Number(employeeId),
            employeeName,
            companyId: Number(companyId),
            companyName,
            isSignedDocument: false,
            isPrivate,
            isPublishedToEmployee: false,
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Creates a specified document record under a company and uploads the file to S3
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {any} request: The company document request.
 * @param {string} firstName: The first name of the invoking user.
 * @param {string} lastName: The last name of the invoking user.
 * @returns {any}: A Promise of a created company document
 */
export async function createCompanyDocument(
    tenantId: string,
    companyId: string,
    request: any,
    firstName: string,
    lastName: string,
): Promise<any> {
    console.info('esignature.service.createCompanyDocument');

    const { file, fileName, title, category, isPublishedToEmployee } = request;

    try {
        // verify that the company exists
        await utilService.validateCompany(tenantId, companyId);

        // get file data
        const [fileData, fileContent] = file.split(',');
        const fileBuffer = new Buffer(fileContent, 'base64');
        const contentType = fileData.split(':')[1].split(';')[0];
        const extension = fileData.split(';')[0].split('/')[1];

        let key = `${tenantId}/${companyId}/${fileName}`;
        let updatedFilename: string = fileName;

        [updatedFilename, key] = await checkForFileExistence(key, fileName, tenantId, companyId);

        key = utilService.sanitizeForS3(key);

        // upload to S3
        s3Client
            .upload({
                Bucket: configService.getFileBucketName(),
                Key: key,
                Body: fileBuffer,
                Metadata: {
                    fileName,
                },
                ContentEncoding: 'base64',
                ContentType: contentType,
            })
            .promise()
            .catch((e) => {
                throw new Error(e);
            });

        // create file metadata
        const uploadDate = new Date().toISOString();
        const query = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
        query.setParameter('@companyId', companyId);
        query.setParameter('@employeeCode', 'NULL');
        query.setParameter('@title', `${title.replace(/'/g, "''")}`);
        query.setParameter('@category', category ? `'${category}'` : 'NULL');
        query.setParameter('@uploadDate', uploadDate);
        query.setParameter('@pointer', key.replace(/'/g, "''"));
        query.setParameter('@uploadedBy', `'${firstName} ${lastName}'`);
        query.setParameter('@isPublishedToEmployee', isPublishedToEmployee ? '1' : '0');
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const id = await encodeId(fileMetadataResult.recordset[0].ID, DocType.S3Document);

        const response = {
            id,
            title,
            fileName: updatedFilename,
            extension,
            uploadDate,
            isEsignatureDocument: false,
            category,
            isPublishedToEmployee,
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a specified document record under a company
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} documentId: The unique identifier for the document to be updated.
 * @param {any} request: The company document request.
 * @returns {any}: A Promise of an updated company document
 */
export async function updateCompanyDocument(tenantId: string, companyId: string, documentId: string, request: any): Promise<any> {
    console.info('esignature.service.updateCompanyDocument');

    try {
        // verify that the company exists
        await utilService.validateCompany(tenantId, companyId);

        const decoded = await decodeId(documentId);

        const [decodedId, type] = decoded;

        if (!decodedId) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Document with ID ${documentId} not found.`);
        }

        if (type === DocType.S3Document) {
            return await updateS3Document(tenantId, companyId, decodedId, request);
        }
        return await updateLegacyDocument(tenantId, decodedId, request);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a specified document record under an employee.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} documentId: The unique identifier for the document to be updated.
 * @param {any} request: The company document request.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 * @param {string} email: The email address associated with the user.
 * @returns {any}: A Promise of an updated employee document
 */
export async function updateEmployeeDocument(
    tenantId: string,
    companyId: string,
    employeeId: string,
    documentId: string,
    request: any,
    roles: string[],
    email: string,
): Promise<any> {
    console.info('esignature.service.updateEmployeeDocument');

    try {
        const [employee] = await Promise.all([
            employeeService.getById(tenantId, companyId, employeeId, email, roles),
            utilService.validateCompany(tenantId, companyId),
            validateEmployeeId(tenantId, companyId, employeeId),
        ]);

        if (!employee) {
            throw errorService.getErrorResponse(20);
        }

        const decoded = await decodeId(documentId);

        const [decodedId, type] = decoded;

        if (!decodedId) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Document with ID ${documentId} not found.`);
        }

        if (type === DocType.S3Document) {
            return await updateEmployeeS3Document(tenantId, companyId, employeeId, employee.eeCode, decodedId, request);
        }
        return await updateEmployeeLegacyDocument(tenantId, employeeId, decodedId, request);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a specified S3 document record under an employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} employeeId: The unique identifier for the specified employee.
 * @param {string} employeeCode: The code associated with the specified employee.
 * @param {string} documentId: The unique identifier for the document to be updated.
 * @param {any} request: The employee document request.
 * @returns {any}: A Promise of an updated S3 company document
 */
async function updateEmployeeS3Document(
    tenantId: string,
    companyId: string,
    employeeId: string,
    employeeCode: string,
    documentId: number,
    request: any,
): Promise<any> {
    console.info('esignature.service.updateEmployeeS3Document');

    const { fileObject, title, isPrivate } = request;

    try {
        // get file metadata / make sure it exists in the database & belongs to the employee
        let query = new ParameterizedQuery('getFileMetadataById', Queries.getFileMetadataById);
        query.appendFilter(`EmployeeCode = '${employeeCode}'`);
        query.setParameter('@id', documentId);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (fileMetadataResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        const {
            Title: oldTitle,
            Pointer: oldPointer,
            IsPublishedToEmployee: oldIsPublishedToEmployee,
            UploadDate: oldUploadDate,
            Category: oldCategory,
            UploadedBy: oldUploadedBy,
        } = fileMetadataResult.recordset[0];
        const oldExtension = oldPointer.split('.').pop();
        const oldFileName = oldPointer.split('/').pop();

        // HACK: Since we don't have a clear-cut way of determining if
        // a document was signed through onboarding or not, we assume
        // that documents with a null UploadedBy value and a category
        // of onboarding are signed documents and thus are not editable.
        if (!oldUploadedBy && oldCategory === 'onboarding') {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Signed documents are not editable');
        }

        let newFileName;
        let newExtension;
        let newKey;
        if (fileObject && fileObject.file && fileObject.fileName) {
            const { file, fileName } = fileObject;
            // get file data
            const [fileData, fileContent] = file.split(',');
            const fileBuffer = new Buffer(fileContent, 'base64');
            const contentType = fileData.split(':')[1].split(';')[0];
            newExtension = fileName.split('.').pop();
            newFileName = fileName;
            newKey = `${tenantId}/${companyId}/${employeeId}/${newFileName}`;

            [newFileName, newKey] = await checkForFileExistence(newKey, newFileName, tenantId, companyId, employeeId);

            newKey = utilService.sanitizeForS3(newKey);

            // upload new file to S3
            s3Client
                .upload({
                    Bucket: configService.getFileBucketName(),
                    Key: newKey,
                    Body: fileBuffer,
                    Metadata: {
                        fileName,
                    },
                    ContentEncoding: 'base64',
                    ContentType: contentType,
                })
                .promise()
                .catch((e) => {
                    throw new Error(e);
                });

            s3Client
                .deleteObject({
                    Bucket: configService.getFileBucketName(),
                    Key: oldPointer,
                })
                .promise()
                .catch((e) => {
                    throw new Error(e);
                });
        }

        // update record in database
        // Note: default null values to true for the isPublishedToEmployee flag
        let published = oldIsPublishedToEmployee === null || oldIsPublishedToEmployee ? '1' : '0';
        if (isPrivate !== undefined) {
            published = isPrivate ? '0' : '1';
        }
        query = new ParameterizedQuery('UpdateFileMetadataById', Queries.updateFileMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', title ? title.replace(/'/g, "''") : oldTitle.replace(/'/g, "''"));
        query.setParameter('@pointer', (newKey && newKey.replace(/'/g, "''")) || oldPointer);
        query.setParameter('@isPublishedToEmployee', published);
        query.setParameter('@category', oldCategory !== null ? `'${oldCategory}'` : 'NULL');
        payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const encodedId = await encodeId(documentId, DocType.S3Document);

        const response = {
            id: encodedId,
            title: title || oldTitle,
            fileName: newFileName || oldFileName,
            extension: newExtension || oldExtension,
            uploadDate: oldUploadDate,
            isPrivate: published === '0',
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a specified legacy document record under an employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} employeeId: The unique identifier for the specified employee.
 * @param {string} documentId: The unique identifier for the document to be updated.
 * @param {any} request: The company document request.
 * @returns {any}: A Promise of an updated legacy company document
 */
async function updateEmployeeLegacyDocument(tenantId: string, employeeId: string, documentId: number, request: any): Promise<any> {
    console.info('esignature.service.updateEmployeeLegacyDocument');

    // TODO: (MJ-3308) read this out of the database so that it's more maintainable.
    const autoGeneratedFileCategories = ['Onboarding-I9', 'Onboarding-W4', 'Onboarding-Direct Deposit', 'Onboarding-Background Check Auth'];
    const { fileObject, title, isPrivate } = request;

    try {
        // get document metadata / make sure it exists in the database and belongs to the employee
        let query = new ParameterizedQuery('getDocumentMetadataById', Queries.getDocumentMetadataById);
        query.appendFilter(`EmployeeID = '${employeeId}'`);
        query.setParameter('@id', documentId);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (fileMetadataResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        const {
            Title: prevTitle,
            DocumentCategory: prevCategory,
            IsPublishedToEmployee: prevIsPublishedToEmployee,
            IsPrivateDocument: prevIsPrivateDocument,
            UploadDate: prevUploadDate,
            Extension: prevExtension,
            Filename: prevFileName,
            UploadByUsername: uploadByUsername,
        } = fileMetadataResult.recordset[0];

        if (prevIsPublishedToEmployee) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Documents that have been published to employees are not editable');
        }

        if (
            (uploadByUsername === 'Onboarding' && autoGeneratedFileCategories.filter((category) => category === prevCategory).length > 0) ||
            (prevCategory === 'I-9' && prevTitle === 'FormI9')
        ) {
            throw errorService
                .getErrorResponse(30)
                .setDeveloperMessage('Documents generated by the system are not editable')
                .setMoreInfo('These files are W4, I9, Direct Deposit, and Background Check Auth');
        }

        let newExtension;
        if (fileObject && fileObject.file && fileObject.fileName) {
            const { file, fileName } = fileObject;
            // get file data
            const [fileData, fileContent] = file.split(',');
            const contentType = fileData.split(':')[1].split(';')[0];
            newExtension = fileName.split('.').pop();

            query = new ParameterizedQuery('UpdateDocumentById', Queries.updateDocumentById);
            query.setParameter('@id', documentId);
            query.setParameter('@file', fileContent);
            query.setParameter('@fileName', fileName);
            query.setParameter('@extension', `.${newExtension}`);
            query.setParameter('@contentType', contentType);
            payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        }

        // update record in database
        // Note: default null values to false for the isPrivate flag
        let documentPrivacy = prevIsPrivateDocument !== null && prevIsPrivateDocument ? '1' : '0';
        if (isPrivate !== undefined) {
            documentPrivacy = isPrivate ? '1' : '0';
        }

        let titleToUse = prevTitle !== null ? `'${prevTitle.replace(/'/g, "''")}'` : 'NULL';
        titleToUse = title ? `'${title.replace(/'/g, "''")}'` : titleToUse;

        query = new ParameterizedQuery('UpdateDocumentMetadataById', Queries.updateDocumentMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', titleToUse);
        query.setParameter('@category', prevCategory !== null ? `'${prevCategory}'` : 'NULL');
        query.setParameter('@isPublishedToEmployee', prevIsPublishedToEmployee !== null ? prevIsPublishedToEmployee : 'NULL');
        query.setParameter('@isPrivateDocument', documentPrivacy);
        payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [encodedId]: any[] = await Promise.all([
            encodeId(documentId, DocType.LegacyDocument),
            utilService.invokeInternalService('queryExecutor', payload, InvocationType.Event),
        ]);

        const response = {
            id: encodedId,
            title: title || prevTitle,
            fileName: (fileObject && fileObject.fileName) || prevFileName,
            extension: newExtension || prevExtension,
            uploadDate: prevUploadDate,
            isPrivate: documentPrivacy === '1',
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a specified S3 document record under a company
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} documentId: The unique identifier for the document to be updated.
 * @param {any} request: The company document request.
 * @returns {any}: A Promise of an updated S3 company document
 */
async function updateS3Document(tenantId: string, companyId: string, documentId: number, request: any): Promise<any> {
    console.info('esignature.service.updateS3Document');

    const { fileObject, title, category, isPublishedToEmployee } = request;

    try {
        // get file metadata / make sure it exists in the database
        let query = new ParameterizedQuery('getFileMetadataById', Queries.getFileMetadataById);
        query.setParameter('@id', documentId);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (fileMetadataResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        const {
            Title: oldTitle,
            Category: oldCategory,
            Pointer: oldPointer,
            IsPublishedToEmployee: oldIsPublishedToEmployee,
            UploadDate: oldUploadDate,
        } = fileMetadataResult.recordset[0];
        const oldExtension = oldPointer.split('.').pop();
        const oldFileName = oldPointer.split('/').pop();

        let newFileName;
        let newExtension;
        let newKey;
        if (fileObject && fileObject.file && fileObject.fileName) {
            const { file, fileName } = fileObject;
            // get file data
            const [fileData, fileContent] = file.split(',');
            const fileBuffer = new Buffer(fileContent, 'base64');
            const contentType = fileData.split(':')[1].split(';')[0];
            newExtension = fileName.split('.').pop();
            newFileName = fileName;
            newKey = `${tenantId}/${companyId}/${newFileName}`;

            [newFileName, newKey] = await checkForFileExistence(newKey, newFileName, tenantId, companyId);

            newKey = utilService.sanitizeForS3(newKey);

            // upload new file to S3
            s3Client
                .upload({
                    Bucket: configService.getFileBucketName(),
                    Key: newKey,
                    Body: fileBuffer,
                    Metadata: {
                        fileName,
                    },
                    ContentEncoding: 'base64',
                    ContentType: contentType,
                })
                .promise()
                .catch((e) => {
                    throw new Error(e);
                });

            s3Client
                .deleteObject({
                    Bucket: configService.getFileBucketName(),
                    Key: oldPointer,
                })
                .promise()
                .catch((e) => {
                    throw new Error(e);
                });
        }

        // update record in database
        let published = oldIsPublishedToEmployee ? '1' : '0';
        if (isPublishedToEmployee !== undefined) {
            published = isPublishedToEmployee ? '1' : '0';
        }
        query = new ParameterizedQuery('UpdateFileMetadataById', Queries.updateFileMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', title ? `${title.replace(/'/g, "''")}` : `${oldTitle.replace(/'/g, "''")}`);
        query.setParameter('@category', category !== undefined ? `'${category}'` : `'${oldCategory}'`);
        query.setParameter('@pointer', (newKey && newKey.replace(/'/g, "''")) || oldPointer);
        query.setParameter('@isPublishedToEmployee', published);
        payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const encodedId = await encodeId(documentId, DocType.S3Document);

        const response = {
            id: encodedId,
            title: title || oldTitle,
            fileName: newFileName || oldFileName,
            extension: newExtension || oldExtension,
            uploadDate: oldUploadDate,
            isEsignatureDocument: false,
            category: category !== undefined ? category : oldCategory,
            isPublishedToEmployee: isPublishedToEmployee !== undefined ? isPublishedToEmployee : oldIsPublishedToEmployee,
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a specified legacy document record under a company
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} documentId: The unique identifier for the document to be updated.
 * @param {any} request: The company document request.
 * @returns {any}: A Promise of an updated legacy company document
 */
async function updateLegacyDocument(tenantId: string, documentId: number, request: any): Promise<any> {
    console.info('esignature.service.updateLegacyDocument');

    const { title, category, isPublishedToEmployee } = request;

    const { file = '', fileName = '' } = request.fileObject || {};

    try {
        // get document metadata / make sure it exists in the database
        let query = new ParameterizedQuery('getDocumentMetadataById', Queries.getDocumentMetadataById);
        query.setParameter('@id', documentId);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (fileMetadataResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        const {
            Title: prevTitle,
            DocumentCategory: prevCategory,
            IsPublishedToEmployee: prevIsPublishedToEmployee,
            IsPrivateDocument: prevIsPrivateDocument,
            UploadDate: prevUploadDate,
            Extension: prevExtension,
            Filename: prevFileName,
        } = fileMetadataResult.recordset[0];

        let newExtension;
        if (file && fileName) {
            // get file data
            const [fileData, fileContent] = file.split(',');
            const contentType = fileData.split(':')[1].split(';')[0];
            newExtension = fileName.split('.').pop();

            query = new ParameterizedQuery('UpdateDocumentById', Queries.updateDocumentById);
            query.setParameter('@id', documentId);
            query.setParameter('@file', fileContent);
            query.setParameter('@fileName', fileName);
            query.setParameter('@extension', `.${newExtension}`);
            query.setParameter('@contentType', contentType);
            payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        }

        // update record in database
        let published = prevIsPublishedToEmployee ? '1' : '0';
        if (isPublishedToEmployee !== undefined) {
            published = isPublishedToEmployee ? '1' : '0';
        }

        let titleToUse = prevTitle !== null ? `'${prevTitle.replace(/'/g, "''")}'` : 'NULL';
        titleToUse = title ? `'${title.replace(/'/g, "''")}'` : titleToUse;

        let categoryToUse = prevCategory !== null ? `'${prevCategory}'` : 'NULL';
        categoryToUse = category !== undefined ? `'${category}'` : categoryToUse;

        query = new ParameterizedQuery('UpdateDocumentMetadataById', Queries.updateDocumentMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', titleToUse);
        query.setParameter('@category', categoryToUse);
        query.setParameter('@isPublishedToEmployee', published);
        query.setParameter('@isPrivateDocument', prevIsPrivateDocument !== null ? prevIsPrivateDocument : 'NULL');
        payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const encodedId = await encodeId(documentId, DocType.LegacyDocument);

        const response = {
            id: encodedId,
            title: title || prevTitle,
            fileName: fileName || prevFileName,
            extension: newExtension || prevExtension,
            uploadDate: prevUploadDate,
            isEsignatureDocument: false,
            category: category !== undefined ? category : prevCategory,
            isPublishedToEmployee: isPublishedToEmployee !== undefined ? isPublishedToEmployee : prevIsPublishedToEmployee,
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Deletes a specified document record under a company
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} documentId: The unique identifier for the document to be deleted.
 * @param {string} userEmail: The email address of the user.
 */
export async function deleteCompanyDocument(tenantId: string, companyId: string, documentId: string, userEmail: string): Promise<void> {
    console.info('esignature.service.deleteCompanyDocument');

    try {
        let docType: DocType;
        let docId: number | string;

        // verify that the company exists
        await utilService.validateCompany(tenantId, companyId);
        const decoded = await decodeId(documentId);

        // if id does not decode properly, assume it's a HelloSign document
        if (decoded.length === 0) {
            docType = DocType.EsignatureDocument;
            docId = documentId;
        } else {
            const [decodedId, type] = decoded;

            if (!decodedId) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(`Document with ID ${documentId} not found.`);
            }

            docType = type;
            docId = decodedId;
        }

        let documentQuery: ParameterizedQuery;

        switch (docType) {
            case DocType.S3Document:
                documentQuery = new ParameterizedQuery('getFileMetadataByIdAndCompanyId', Queries.getFileMetadataByIdAndCompanyId);
                documentQuery.setParameter('@id', docId);
                documentQuery.setParameter('@companyId', companyId);
                break;
            case DocType.EsignatureDocument:
                documentQuery = new ParameterizedQuery(
                    'getEsignatureMetadataByIdAndCompanyId',
                    Queries.getEsignatureMetadataByIdAndCompanyId,
                );
                documentQuery.setParameter('@id', docId);
                documentQuery.setParameter('@companyId', companyId);
                break;
            case DocType.LegacyDocument:
                documentQuery = new ParameterizedQuery('getDocumentByIdAndCompanyId', Queries.getDocumentByIdAndCompanyId);
                documentQuery.setParameter('@id', docId);
                documentQuery.setParameter('@companyId', companyId);
                break;
            default:
                throw new Error('Unknown document type');
        }

        const resultSet: any = await utilService.authorizeAndRunQuery(
            tenantId,
            utilService.Resources.Company,
            companyId,
            userEmail,
            documentQuery,
        );

        if (resultSet[0].length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Document with ID ${documentId} not found.`);
        }

        const s3Key = resultSet[0][0].Pointer;

        return await deleteDocumentRecord(tenantId, docType, docId, s3Key);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

async function deleteDocumentRecord(tenantId: string, docType: DocType, recordId: number | string, s3Key?: string): Promise<void> {
    console.info('esignature.service.deleteDocumentRecord');

    try {
        let query: ParameterizedQuery;
        let taskListQuery: ParameterizedQuery;
        switch (docType) {
            case DocType.S3Document:
                s3Client
                    .deleteObject({
                        Bucket: configService.getFileBucketName(),
                        Key: s3Key,
                    })
                    .promise()
                    .catch((e) => {
                        throw new Error(e);
                    });

                query = new ParameterizedQuery('DeleteFileMetadataById', Queries.deleteFileMetadataById);
                break;
            case DocType.EsignatureDocument:
                query = new ParameterizedQuery('DeleteEsignatureMetadataById', Queries.deleteEsignatureMetadataById);
                taskListQuery = new ParameterizedQuery('RemoveDocumentFromTaskList', Queries.removeDocumentFromTaskList);
                taskListQuery.setParameter('@documentId', recordId);
                query.combineQueries(taskListQuery);
                break;
            case DocType.LegacyDocument:
                query = new ParameterizedQuery('DeleteDocumentById', Queries.deleteDocumentById);
                taskListQuery = new ParameterizedQuery('RemoveDocumentFromTaskList', Queries.removeDocumentFromTaskList);
                taskListQuery.setParameter('@documentId', recordId);
                query.combineQueries(taskListQuery);
                break;
            default:
                throw errorService.getErrorResponse(0);
        }

        query.setParameter('@documentId', recordId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
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

enum DocType {
    LegacyDocument = 1,
    S3Document = 2,
    EsignatureDocument = 3,
}

async function encodeId(id: any, type: DocType): Promise<string> {
    const salt = JSON.parse(await utilService.getSecret(configService.getSaltId())).salt;
    const hashids = new Hashids(salt);
    return hashids.encode(id, type);
}

async function decodeId(id: string): Promise<number[]> {
    const salt = JSON.parse(await utilService.getSecret(configService.getSaltId())).salt;
    const hashids = new Hashids(salt);
    return hashids.decode(id);
}

export type EsignatureConfiguration = {
    companyInfo: CompanyDetail;
    appDetails: EsignatureAppConfiguration;
    eSigner: any;
};

export async function getConfigurationData(tenantId: string, companyId: string): Promise<EsignatureConfiguration> {
    const [companyInfo, adminToken] = await Promise.all([
        await getCompanyDetails(tenantId, companyId),
        await utilService.generateAdminToken(),
    ]);
    const appDetails: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
        tenantId,
        companyInfo.clientId,
        companyId,
        adminToken,
    );
    const appClientId = appDetails.integrationDetails.eSignatureAppClientId;
    const eSigner = hellosign({
        key: JSON.parse(await utilService.getSecret(configService.getEsignatureApiCredentials())).apiKey,
        client_id: appClientId,
    });

    return {
        companyInfo,
        appDetails,
        eSigner,
    };
}

/**
 * Appends a guid suffix to a filename to indicate duplication
 * @example
 *  // returns duplicate-PPBqWA9.pdf
 *  letappendDuplicationSuffix('duplicate.pdf');
 * @param {string} filenameWithExtension
 * @returns {string}: The file name with a duplication suffix
 */
function appendDuplicationSuffix(filenameWithExtension: string): string {
    console.info('esignature.service.appendDuplicationSuffix');
    const [filename, extension] = utilService.splitFilename(filenameWithExtension);
    return `${filename}-${shortid.generate()}${extension}`;
}

async function checkForFileExistence(
    key: string,
    fileName: string,
    tenantId: string,
    companyId: string,
    employeeId?: string,
): Promise<string[]> {
    try {
        const objectMetadata = await s3Client
            .headObject({
                Bucket: configService.getFileBucketName(),
                Key: key,
            })
            .promise();

        if (objectMetadata) {
            const newFileName = appendDuplicationSuffix(fileName);
            let newKey = `${tenantId}/${companyId}`;
            newKey += employeeId ? `/${employeeId}` : '';
            return [newFileName, `${newKey}/${newFileName}`];
        }
    } catch (missingError) {
        // We really don't mind since we expect it to be missing
        return [fileName, key];
    }
}

/**
 * Validates a specified employee ID.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} employeeId: The unique identifier for the specified employee
 */
async function validateEmployeeId(tenantId: string, companyId: string, employeeId: string): Promise<void> {
    console.info('esignature.service.validateEmployeeId');

    try {
        // employeeId value must be integral
        if (Number.isNaN(Number(employeeId))) {
            const errorMessage = `${employeeId} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }

        const query: ParameterizedQuery = new ParameterizedQuery('GetEmployeeByCompanyIdAndId', Queries.getEmployeeByCompanyIdAndId);
        query.setParameter('@companyId', companyId);
        query.setParameter('@id', employeeId);
        const payload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Employee with ID ${employeeId} not found`);
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

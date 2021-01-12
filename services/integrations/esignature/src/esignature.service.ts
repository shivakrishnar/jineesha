// Note: there is a linting error here due to the fact that this package does not have a
// default export. However, webpack will still compile correctly. Using the star import
// method resolves this error but does not work when deployed because of an issue with the
// package itself. Therefore, we ignore the linting error.
import fontkit from '@pdf-lib/fontkit';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import Hashids from 'hashids';
import * as hellosign from 'hellosign-sdk';
import * as mime from 'mime-types';
import * as moment from 'moment-timezone';
import * as fetch from 'request-promise-native';
import * as uuidV4 from 'uuid/v4';

import * as pSettle from 'p-settle';
import * as employeeService from '../../../api/tenants/src/employee.service';
import * as tenantsService from '../../../api/tenants/src/tenants.service';
import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as hellosignService from '../../../remote-services/hellosign.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as utilService from '../../../util.service';

import { convertTo } from '@shelf/aws-lambda-libreoffice';
import { PDFDocument, rgb } from 'pdf-lib';
import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { EsignatureAction, IBillingEvent, IEsignatureEvent, NotificationEventType } from '../../../internal-api/notification/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { Query } from '../../../queries/query';
import { EsignatureAppConfiguration } from '../../../remote-services/integrations.service';
import { InvocationType } from '../../../util.service';
import { BillingReportOptions } from './billing/billingReportOptions';
import { DocumentCategory, DocumentMetadata } from './documents/document';
import { EditUrl, SignUrl } from './embedded/url';
import { Onboarding } from './signature-requests/onboarding';
import { Signatory } from './signature-requests/signatory';
import { BatchSignatureRequest, BulkSignatureRequest } from './signature-requests/signatureRequest';
import { SignatureRequestListResponse } from './signature-requests/signatureRequestListResponse';
import {
    Signature,
    SignatureRequestResponse,
    SignatureRequestResponseStatus,
    SignatureStatus,
    SignatureStatusID,
    SignatureStatusStepNumber,
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
    SimpleSignatureRequest = 'SimpleSignatureRequest',
    NoSignature = 'NoSignature',
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

    const { title, fileName, category, isOnboardingDocument = false } = requestBody;

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
        query.setParameter('@signatureStatusId', SignatureStatusID.NotRequired);
        query.setParameter('@isOnboardingDocument', isOnboardingDocument ? 1 : 0);
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
            isOnboardingDocument,
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
 *  Creates signature requests for a group of employees under the specified company
 * @param {any} pathParameters: An object containing tenant & company ID, as well as any other parameter passed as part of the path
 * @param {BatchSignatureRequest} request: A batch e-signature request for employees within the company
 * @param {any} suppliedMetadata: The metadata to be associated with the signature requests
 * @returns {SignatureRequestResponse[]}: Promise of a collection of signature requests.
 */
export async function createBatchSignatureRequest(
    pathParameters: any,
    request: BatchSignatureRequest,
    suppliedMetadata: any,
    invokerEmail: string,
    token: string,
): Promise<SignatureRequestResponse[]> {
    console.info('esignature.service.createBatchSignatureRequest');
    if (request.isSimpleSign) {
        return saveSimpleEsignatureMetadata(
            pathParameters,
            request.signatories.map((req) => req.employeeCode),
            request.templateId,
            true,
            invokerEmail,
            token,
        );
    }
    return createBatchHSSignatureRequest(pathParameters, request, suppliedMetadata, invokerEmail, token);
}

/**
 *  Creates signature requests for a group of employees under the specified company
 * @param {any} pathParameters: An object containing tenant & company ID, as well as any other parameter passed as part of the path
 * @param {BatchSignatureRequest} request: A batch e-signature request for employees within the company
 * @param {any} suppliedMetadata: The metadata to be associated with the signature requests
 * @returns {SignatureRequestResponse[]}: Promise of a collection of signature requests.
 */
export async function createBatchHSSignatureRequest(
    pathParameters: any,
    request: BatchSignatureRequest,
    suppliedMetadata: any,
    invokerEmail: string,
    token: string,
): Promise<SignatureRequestResponse[]> {
    console.info('esignature.handler.createBatchHSSignatureRequest');

    try {
        const { tenantId, companyId } = pathParameters;
        // TODO: remove this when MJ-6709 is implemented
        const sendToAllEmployees = request.signatories[0].employeeCode === 'all';
        const employeesWithoutEmailAddresses: any[] = [];
        const employeeData: any[] = [];

        await utilService.validateCompany(tenantId, companyId);

        if (!sendToAllEmployees) {
            const employees = await checkEmployeesExistenceByCodes(
                tenantId,
                companyId,
                request.signatories.map((signatory) => signatory.employeeCode),
            );
            // Note: we chose to use a forEach loop and if statements here because it was the most readable
            // implementation. If performance becomes an issue, we should consider using a filter statement.
            employees.forEach((employee) => {
                if (employee.emailAddress) {
                    employeeData.push(employee);
                } else {
                    employeesWithoutEmailAddresses.push(employee);
                }
            });
        } else {
            const employeeQuery = new ParameterizedQuery('listEmployeesByCompany', Queries.listEmployeesByCompany);
            employeeQuery.setParameter('@companyId', companyId);
            employeeQuery.setParameter('@search', '');
            const employeePayload = {
                tenantId,
                queryName: employeeQuery.name,
                query: employeeQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            const result: any = await utilService.invokeInternalService(
                'queryExecutor',
                employeePayload,
                utilService.InvocationType.RequestResponse,
            );

            const recordSet = result.recordsets[1];

            if (recordSet.length === 0) {
                throw errorService
                    .getErrorResponse(50)
                    .setDeveloperMessage(`No employees were found under the provided company ${companyId}`);
            }

            recordSet.forEach((record) => {
                if (record.IsActive) {
                    const employee = {
                        firstName: record.FirstName,
                        lastName: record.LastName,
                        employeeCode: record.EmployeeCode,
                        emailAddress: record.EmailAddress,
                    };
                    if (record.EmailAddress) {
                        employeeData.push(employee);
                    } else {
                        employeesWithoutEmailAddresses.push(employee);
                    }
                }
            });
        }

        const configuration = await getConfigurationData(tenantId, companyId);
        const signatureRequestInvocations: Array<Promise<any>> = [];
        const bulkSignatureRequests: BulkSignatureRequest[] = [];
        for (const employee of employeeData) {
            let role = request.signatories[0].role;
            if (!sendToAllEmployees) {
                role = request.signatories.filter((signatory) => signatory.employeeCode === employee.employeeCode)[0].role;
            }
            const bulkSignRequest = new BulkSignatureRequest({
                templateId: request.templateId,
                employeeCodes: [employee.employeeCode],
                signatories: [
                    {
                        emailAddress: employee.emailAddress,
                        name: `${employee.firstName} ${employee.lastName}`,
                        role,
                        employeeCode: employee.employeeCode,
                    },
                ],
            });

            bulkSignatureRequests.push(bulkSignRequest);
            const templateResponse = await configuration.eSigner.template.get(request.templateId);
            signatureRequestInvocations.push(
                createHelloSignSignatureRequest(tenantId, companyId, bulkSignRequest, suppliedMetadata, configuration, templateResponse),
            );
        }

        const signatureRequestResults = await pSettle(signatureRequestInvocations);
        const esignatureMetadataQuery: ParameterizedQuery = new ParameterizedQuery('CreateEsignatureMetadata', '');
        const signatureRequests: SignatureRequestResponse[] = [];
        const failures = [];
        signatureRequestResults.forEach((apiInvocation, index) => {
            if (apiInvocation) {
                if (apiInvocation.isFulfilled) {
                    console.log(apiInvocation.value);
                    const { signatureRequest } = apiInvocation.value;
                    const signatures: Signature[] = signatureRequest.signatures.map((signature) => ({
                        id: signature.signature_id,
                        status: SignatureStatus.Pending,
                        signer: new Signatory({
                            emailAddress: signature.signer_email_address,
                            name: signature.signer_name,
                            role: signature.signer_role,
                            employeeCode: signatureRequest.metadata.employeeCodes[0],
                        }),
                    }));
                    const { signature_request_id: requestId, title } = signatureRequest;

                    const query = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
                    query.setParameter('@id', requestId);
                    query.setParameter('@companyId', companyId);
                    query.setParameter('@type', EsignatureMetadataType.SignatureRequest);
                    query.setParameter('@uploadDate', new Date().toISOString());
                    query.setParameter('@uploadedBy', 'NULL');
                    query.setParameter('@title', `'${title.replace(/'/g, "''")}'`);
                    query.setParameter('@fileName', 'NULL');
                    query.setParameter(
                        '@category',
                        signatureRequest.metadata.category ? `'${signatureRequest.metadata.category}'` : 'NULL',
                    );
                    query.setParameter('@employeeCode', `'${signatureRequest.metadata.employeeCodes[0]}'`);
                    query.setParameter('@signatureStatusId', SignatureStatusID.Pending);
                    query.setParameter('@isOnboardingDocument', 0);
                    esignatureMetadataQuery.combineQueries(query, false);

                    signatureRequests.push(
                        new SignatureRequestResponse({
                            id: requestId,
                            title: signatureRequest.title,
                            status: SignatureRequestResponseStatus.Pending,
                            type: EsignatureMetadataType.SignatureRequest,
                            isHelloSignDocument: true,
                            signatures,
                        }),
                    );
                }
                if (apiInvocation.isRejected) {
                    const failingEmployeeCodes = bulkSignatureRequests[index].employeeCodes;
                    failures.push(failingEmployeeCodes);
                }
            }
        });

        const payload = {
            tenantId,
            queryName: esignatureMetadataQuery.name,
            query: esignatureMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        // send email
        utilService.sendEventNotification({
            urlParameters: pathParameters,
            invokerEmail,
            type: NotificationEventType.EsignatureEvent,
            actions: [EsignatureAction.SignatureRequestSubmitted],
            accessToken: token.replace(/Bearer /i, ''),
            metadata: {
                signatureRequests,
            },
        } as IEsignatureEvent); // Async call to invoke notification lambda - DO NOT AWAIT!!

        if (employeesWithoutEmailAddresses.length > 0) {
            // Note: this is currently throwing a 422, which is probably not the most
            // accurate status code for this scenario. Consider using a 207 here.
            throw errorService
                .getErrorResponse(70)
                .setDeveloperMessage('Some employees do not have email addresses.')
                .setMoreInfo(
                    JSON.stringify({
                        employees: JSON.stringify(employeesWithoutEmailAddresses),
                        successes: signatureRequests.length,
                        failures: employeesWithoutEmailAddresses.length,
                    }),
                );
        }

        if (failures.length > 0) {
            throw errorService
                .getErrorResponse(0)
                .setDeveloperMessage(`Signature request creation failed for the following employees: ${failures.join()}`);
        }

        return signatureRequests;
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Template not found')) {
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
 * Creates a signature request within HelloSign using the SDK.
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {BulkSignatureRequest} request: A batch e-signature request for employees within the company
 * @param {any} suppliedMetadata: The metadata to be associated with the signature requests
 * @param {EsignatureConfiguration} configuration: The e-signature configuration data
 * @returns {SignatureRequestResponse[]}: Promise of a collection of signature requests.
 */
async function createHelloSignSignatureRequest(
    tenantId: string,
    companyId: string,
    request: BulkSignatureRequest,
    suppliedMetadata: any,
    configuration: EsignatureConfiguration,
    templateResponse: any,
): Promise<any> {
    console.info('esignature.service.createHelloSignSignatureRequest');

    try {
        if (!configuration) {
            configuration = await getConfigurationData(tenantId, companyId);
        }
        const { eSigner } = configuration;

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

        return {
            signatureRequest: (await eSigner.signatureRequest.createEmbeddedWithTemplate(options)).signature_request,
            category: templateResponse.template.metadata.category,
        };
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
 * Saves the e-signature metadata to the database.
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company within a tenant
 * @param {string} category: The category associated with the signature request
 * @param {string[]} employeeCodes: The employee codes associated with the signature request
 * @param {any} signatureRequest: The signature request response from HelloSign
 * @returns {SignatureRequestResponse}: Promise of a signature requests.
 */
async function saveEsignatureMetadata(
    tenantId: string,
    companyId: string,
    category: string,
    employeeCodes: string[],
    signatureRequest: any,
): Promise<SignatureRequestResponse> {
    try {
        const signatures: Signature[] = signatureRequest.signatures.map((signature) => ({
            id: signature.signature_id,
            status: SignatureStatus.Pending,
            signer: new Signatory({
                emailAddress: signature.signer_email_address,
                name: signature.signer_name,
                role: signature.signer_role,
            }),
        }));
        const { signature_request_id: requestId, title } = signatureRequest;

        // Save signature request metadata to the database
        const esignatureMetadataQuery: ParameterizedQuery = new ParameterizedQuery('CreateEsignatureMetadata', '');
        for (const code of employeeCodes) {
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
            query.setParameter('@signatureStatusId', SignatureStatusID.Pending);
            query.setParameter('@isOnboardingDocument', 0);
            esignatureMetadataQuery.combineQueries(query, false);
        }

        const payload = {
            tenantId,
            queryName: esignatureMetadataQuery.name,
            query: esignatureMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        return new SignatureRequestResponse({
            id: signatureRequest.signature_request_id,
            title: signatureRequest.title,
            status: SignatureRequestResponseStatus.Pending,
            signatures,
            type: EsignatureMetadataType.SignatureRequest,
            isHelloSignDocument: true,
        });
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

export async function generateBillingReport(options: any | BillingReportOptions): Promise<string> {
    console.info('esignatureService.generateBillingReport');

    // get all tenant IDs
    const connectionStrings = await tenantsService.listConnectionStrings();
    const tenantIDs = connectionStrings.Items.map((conn) => conn.TenantID);
    const tenantDomains = {};
    connectionStrings.Items.forEach((conn) => (tenantDomains[conn.TenantID] = conn.Domain));

    // run query for every tenant
    const getBillableSignRequests: ParameterizedQuery = new ParameterizedQuery('getBillableSignRequests', Queries.getBillableSignRequests);
    const today = new Date();
    getBillableSignRequests.setParameter('@month', today.getUTCMonth() || 12); // UTC months are 0-11, mssql months are 1-12, we want last month's records
    getBillableSignRequests.setParameter('@year', today.getUTCMonth() ? today.getUTCFullYear() : today.getUTCFullYear() - 1); // if month is 0 (Jan) we're doing December of last year
    getBillableSignRequests.setStringParameter('@esignLegacyCutoff', configService.getLegacyClientCutOffDate());

    const payload = {
        tenantId: '',
        queryName: getBillableSignRequests.name,
        query: getBillableSignRequests.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;

    let queryResultPromises = [];
    let tenantErrors = [];

    let csvOut = 'Domain,Company,Billable Documents\r\n';
    for (const tenantId of tenantIDs) {
        payload.tenantId = tenantId;
        queryResultPromises.push(
            utilService.withTimeout(() => {
                return utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse).then(
                    (result: any) => {
                        result.tenantId = tenantId;
                        return result;
                    },
                    (err) => {
                        tenantErrors.push({ tenantId, domain: tenantDomains[tenantId], reason: err });
                        return { error: true, reason: err };
                    },
                );
            }, 17500),
        );
    }
    const queryResults = await pSettle(queryResultPromises);
    let successfulTenants = [];
    queryResults.forEach((queryResult: any) => {
        if (queryResult.isFulfilled && !queryResult.value.error) {
            successfulTenants.push(queryResult.value.tenantId);
            queryResult.value.recordsets[0].forEach((row) => {
                csvOut += `${tenantDomains[row.tenantID]},${row.company},${row.billableDocuments}\r\n`;
            });
        }
    });

    const failedTenants = tenantIDs.filter((id) => {
        return !successfulTenants.includes(id);
    });
    let additionalMessage = '';
    if (failedTenants.length) {
        console.info(
            `failed executions without error messages: ${JSON.stringify(
                failedTenants.filter((id) => !tenantErrors.map((err) => err.tenantId).includes(id)),
            )}`,
        );
        console.info(`failed executions with error messages: ${JSON.stringify(tenantErrors)}`);
        additionalMessage = `Billing report incomplete, errors occurred when trying to get esign info for the following tenant(s):\n${failedTenants
            .map((id) => tenantDomains[id])
            .join('\r\n')}`;
    }

    // send email
    utilService.sendEventNotification({
        urlParameters: {},
        invokerEmail: '',
        type: NotificationEventType.BillingEvent,
        reportCsv: csvOut,
        recipient: options.targetEmail || '',
        additionalMessage,
    } as IBillingEvent); // Async call to invoke notification lambda - DO NOT AWAIT!!

    console.info(`successful executions ${tenantIDs.length - failedTenants.length}`);

    if (options.returnReport) {
        return csvOut;
    }
}

/**
 * Delete all esign docs associated with an onboarding
 * @param {string} tenantId: The unique identifier for the tenant the onboarding belongs to.
 * @param {string} companyId: The unique identifier for the company the onboarding belongs to.
 * @param {string} onboardingId: The unique identifier for the onboarding.
 */
export async function deleteOnboardingDocuments(tenantId: string, companyId: string, onboardingId: string): Promise<void> {
    console.info('esignatureService.deleteOnboardingDocuments');

    try {
        await validateOnboardingForDeletion(tenantId, companyId, onboardingId);
        const hsResponse = getConfigurationData(tenantId, companyId).then((configuration) => {
            const { eSigner } = configuration;
            return eSigner.signatureRequest.list({
                query: `metadata:${onboardingId}`,
            });
        });
        const { signature_requests: signatureRequests } = await hsResponse;
        if (signatureRequests.length === 0) {
            return;
        }

        let requestIds: string;
        if (signatureRequests.length === 1) {
            requestIds = signatureRequests[0].signature_request_id;
        } else {
            requestIds = signatureRequests.map((e) => e.signature_request_id).join(',');
        }
        const query = new ParameterizedQuery('deleteEsignatureMetadataByIdList', Queries.deleteEsignatureMetadataByIdList);
        query.setStringParameter('@idList', requestIds);
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
 *  Creates signature requests for a group of employees under the specified company
 * @param {any} pathParameters: An object containing tenant & company ID, as well as any other parameter passed as part of the path
 * @param {string[]} employeeCodes: List of employee codes of doc signers
 * @param {string} docId: ID of the FileMetatdata entry that the signature request is based on
 * @returns {SignatureRequestResponse[]}: Promise of a collection of signature requests.
 */
async function saveSimpleEsignatureMetadata(
    pathParameters: any,
    employeeCodes: string[],
    docId: string,
    sendEmail: boolean = false,
    invokerEmail?: string,
    token?: string,
    isOnboardingDocument: boolean = false,
    onboardingData?: any,
): Promise<SignatureRequestResponse[]> {
    console.info('esignature.service.saveSimpleEsignatureMetadata');
    try {
        const { tenantId, companyId } = pathParameters;
        const sendToAllEmployees = employeeCodes[0] === 'all';
        const [documentId] = await decodeId(docId);

        if (!documentId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage(`Provided template id ${docId} is not valid.`);
        }

        const signatureRequestResponses: SignatureRequestResponse[] = [];
        let employeeData: any = {};
        let employeesWithoutEmailAddresses: any[] = [];

        const esignatureQuery = new ParameterizedQuery('getFileMetadataById', Queries.getFileMetadataById);
        esignatureQuery.setParameter('@id', documentId);
        const esignaturePayload = {
            tenantId,
            queryName: esignatureQuery.name,
            query: esignatureQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const esignatureResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            esignaturePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (esignatureResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Provided document ${docId} was not found.`);
        }

        if (isOnboardingDocument) {
            const ee = {
                firstName: onboardingData.firstName,
                lastName: onboardingData.lastName,
                employeeCode: employeeCodes[0],
                emailAddress: onboardingData.emailAddress,
            };
            employeeData[employeeCodes[0]] = ee;
        } else if (!sendToAllEmployees) {
            await checkEmployeesExistenceByCodes(tenantId, companyId, employeeCodes).then((records) => {
                records.forEach((record) => {
                    const ee = {
                        firstName: record.firstName,
                        lastName: record.lastName,
                        employeeCode: record.employeeCode,
                        emailAddress: record.emailAddress,
                    };
                    if (ee.emailAddress) {
                        employeeData[ee.employeeCode] = ee;
                    } else {
                        employeesWithoutEmailAddresses.push(ee);
                    }
                });
            });
        } else {
            const employeeQuery = new ParameterizedQuery('listEmployeesByCompany', Queries.listEmployeesByCompany);
            employeeQuery.setParameter('@companyId', companyId);
            employeeQuery.setParameter('@search', '');
            const employeePayload = {
                tenantId,
                queryName: employeeQuery.name,
                query: employeeQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            const result: any = await utilService.invokeInternalService(
                'queryExecutor',
                employeePayload,
                utilService.InvocationType.RequestResponse,
            );

            const recordSet = result.recordsets[1];

            if (recordSet.length === 0) {
                throw errorService
                    .getErrorResponse(50)
                    .setDeveloperMessage(`No employees were found under the provided company ${companyId}`);
            }
            employeeCodes = [];
            recordSet.forEach((record) => {
                if (record.IsActive) {
                    employeeCodes.push(record.EmployeeCode);
                    const ee = {
                        firstName: record.FirstName,
                        lastName: record.LastName,
                        employeeCode: record.EmployeeCode,
                        emailAddress: record.EmailAddress,
                    };
                    if (ee.emailAddress) {
                        employeeData[ee.employeeCode] = ee;
                    } else {
                        employeesWithoutEmailAddresses.push(ee);
                    }
                }
            });
        }

        // Save signature request metadata to the database
        const esignatureMetadataQuery: ParameterizedQuery = new ParameterizedQuery(
            'CreateSimpleSignMetadata',
            `declare @_fileMetadataID bigint = ${documentId};`,
        );
        for (const code of employeeCodes) {
            const signatureRequestId = uuidV4();
            const query = new ParameterizedQuery('CreateSimpleSignMetadata', Queries.createSimpleSignMetadata);
            query.setStringParameter('@id', signatureRequestId);
            query.setParameter('@companyId', companyId);
            query.setParameter('@type', EsignatureMetadataType.SignatureRequest);
            query.setParameter('@uploadedBy', 'NULL');
            query.setParameter('@fileName', 'NULL');
            query.setParameter('@employeeCode', `'${code}'`);
            query.setParameter('@signatureStatusId', SignatureStatusID.Pending);
            query.setParameter('@isOnboardingDocument', 0);
            esignatureMetadataQuery.combineQueries(query, false);

            signatureRequestResponses.push(
                new SignatureRequestResponse({
                    id: signatureRequestId,
                    title: esignatureResult.recordset[0].Title,
                    status: SignatureRequestResponseStatus.Pending,
                    type: EsignatureMetadataType.SignatureRequest,
                    isHelloSignDocument: false,
                    signatures: [
                        {
                            id: '',
                            signer: new Signatory({
                                emailAddress: employeeData[code] ? employeeData[code].emailAddress : '',
                                name: employeeData[code] ? `${employeeData[code].firstName} ${employeeData[code].lastName}` : '',
                                employeeCode: code,
                            }),
                        },
                    ],
                }),
            );
        }

        const payload = {
            tenantId,
            queryName: esignatureMetadataQuery.name,
            query: esignatureMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (sendEmail) {
            // send email
            const signatureRequestsWithEmailAddresses = signatureRequestResponses.filter((e) => !!e.signatures[0].signer.emailAddress);
            utilService.sendEventNotification({
                urlParameters: pathParameters,
                invokerEmail,
                type: NotificationEventType.EsignatureEvent,
                actions: [EsignatureAction.SignatureRequestSubmitted],
                accessToken: token.replace(/Bearer /i, ''),
                metadata: {
                    signatureRequests: signatureRequestsWithEmailAddresses,
                },
            } as IEsignatureEvent); // Async call to invoke notification lambda - DO NOT AWAIT!!
            if (employeesWithoutEmailAddresses.length > 0) {
                // Note: this is currently throwing a 422, which is probably not the most
                // accurate status code for this scenario. Consider using a 207 here.
                throw errorService
                    .getErrorResponse(70)
                    .setDeveloperMessage('Some employees do not have email addresses.')
                    .setMoreInfo(
                        JSON.stringify({
                            employees: JSON.stringify(employeesWithoutEmailAddresses),
                            successes: signatureRequestsWithEmailAddresses.length,
                            failures: employeesWithoutEmailAddresses.length,
                        }),
                    );
            }
        }

        return signatureRequestResponses;
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

    const validQueryStringParameters = ['pageToken', 'consolidated', 'onboarding', 'search'];

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

        let payload: DatabaseEvent;
        if (queryParams && queryParams.search) {
            query.setStringParameter('@search', `'${queryParams.search}'`);
            const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
            payload = {
                tenantId,
                queryName: paginatedQuery.name,
                query: paginatedQuery.value,
                queryType: QueryType.Simple,
            };
        } else {
            query.setStringParameter('@search', '');
            const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
            payload = {
                tenantId,
                queryName: paginatedQuery.name,
                query: paginatedQuery.value,
                queryType: QueryType.Simple,
            };
        }

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
            if (document.Type === 'non-signature' || document.Type === 'legacy' || document.Type === 'simpleSign') {
                const filename =
                    document.Type !== 'legacy' ? document.Filename.split('/')[document.Filename.split('/').length - 1] : document.Filename;
                const uploadedBy =
                    document.Type !== 'legacy'
                        ? document.FirstName // Note: the query returns the full name as the FirstName field
                        : `${document.FirstName} ${document.LastName}`;
                // GUIDs are strings so we can't encode them; we'll set those to document.ID while legacy documents' IDs need to  be encoded
                let id = hashids.encode(document.ID, document.Type === 'legacy' ? DocType.LegacyDocument : DocType.S3Document);
                if (!id) id = document.ID;

                memo.push({
                    id,
                    title: document.Title,
                    filename,
                    uploadDate: document.UploadDate,
                    isEsignatureDocument: document.Type === 'simpleSign',
                    isHelloSignTemplate: false,
                    uploadedBy,
                    category: document.Category,
                    isPublishedToEmployee: document.IsPublishedToEmployee,
                    existsInTaskList: document.ExistsInTaskList,
                    isLegacyDocument: document.Type === 'legacy',
                    isOnboardingDocument: document.IsOnboardingDocument,
                });
            }
            return memo;
        };
        let consolidatedDocuments: any[] = await documents.reduce(reducer, []);

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
                            isHelloSignTemplate: true,
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

        // Retrive the sign url using the signatureId
        let response;
        try {
            response = await eSigner.embedded.getSignUrl(signatureId);
        } catch (e) {
            if (e.message) {
                if (!e.message.includes('Signature not found')) {
                    throw e;
                }
            } else {
                throw e;
            }
        }

        // If the signatureId is not found, assume it is a requestId
        if (!response) {
            console.log('signatureId is a signatureRequestId');
            const {
                signature_request: { signatures },
            } = await eSigner.signatureRequest.get(signatureId);
            signatureId = signatures[0].signature_id;
            response = await eSigner.embedded.getSignUrl(signatureId);
        }
        const { sign_url, expires_at } = response.embedded;
        return new SignUrl({
            url: sign_url,
            expiration: expires_at,
            clientId: appClientId,
        });
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Signature not found') || error.message.includes('Not found')) {
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
    returnFileMetadataId: boolean = false,
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
                type: entry.Type,
                fileMetadataId: entry.FileMetadataID,
            };
        });

        if (filterByOriginalDocuments) {
            const originalDocs = documents.filter((doc) => !doc.type);
            const paginatedResult =
                originalDocs.length === 0
                    ? undefined
                    : await paginationService.createPaginatedResult(originalDocs, baseUrl, totalRecords, page);
            return paginatedResult;
        }

        if (filterByHelloSignDocuments) {
            documents = documents.filter((doc) => doc.type === 'Template');
        }

        const unfoundDocuments: DocumentMetadata[] = [];

        const invocations: Array<Promise<any>> = [];

        for (const doc of documents) {
            if (doc.type === 'Template') {
                invocations.push(eSigner.template.get(doc.id));
            }
        }

        // Run template api calls in parallel
        const templateApiResults = await pSettle(invocations);

        // Extract template file information for document metadata
        for (let index = 0; index < documents.length; index++) {
            const doc = documents[index];
            if (doc.type === 'Template') {
                const templateApiInvocation = templateApiResults[index];

                if (templateApiInvocation) {
                    if (templateApiInvocation.isFulfilled) {
                        const apiResponse = templateApiInvocation.value;
                        doc.filename = apiResponse.template.documents[0].name;
                        doc.title = apiResponse.template.title;
                    }

                    if (templateApiInvocation.isRejected) {
                        console.error(`issue accessing template id: ${doc.id}`);
                        unfoundDocuments.push(doc);
                    }
                }
            } else if (!doc.type) {
                // encode ids for legacy documents
                const id = await encodeId(doc.id, DocType.LegacyDocument);
                doc.id = id;
            }
            if (doc.fileMetadataId) {
                const fileMetadataId = await encodeId(doc.fileMetadataId, DocType.EsignatureDocument);
                doc.fileMetadataId = fileMetadataId;
            }
        }

        // Renove any unfound documents from eventual response
        if (unfoundDocuments.length > 0) {
            documents = documents.filter((doc) => !unfoundDocuments.includes(doc));
        }

        if (!returnFileMetadataId) {
            documents = documents.map((doc) => {
                delete doc.fileMetadataId;
                return doc;
            });
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
 * This returns a paginated list of all unique document categories among a company's employee documents
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} companyId: The unique identifier for the company
 * @param {any} queryParams: The query parameters generated for paged results.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {boolean} isManager: whether the user is a manager
 * @param {string} emailAddress: user email address.
 * @returns {Promise<PaginatedResult>}: A promise of a paginated list of document categories
 */
export async function listEmployeeDocumentCategoriesByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
    isManager: boolean,
    emailAddress: string,
): Promise<PaginatedResult> {
    console.info('esignatureService.listEmployeeDocumentCategoriesByCompany');

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
        await getCompanyDetails(tenantId, companyId);

        let query = new ParameterizedQuery(
            'GetEmployeeLegacyAndSignedDocumentCategoriesByCompanyId',
            Queries.getEmployeeLegacyAndSignedDocumentCategoriesByCompanyId,
        );
        if (isManager) {
            query = new ParameterizedQuery(
                'GetEmployeeLegacyAndSignedDocumentCategoriesByCompanyIdForManager',
                Queries.getEmployeeLegacyAndSignedDocumentCategoriesByCompanyForManager,
            );
            query.setParameter('@manager', emailAddress);
        }
        query.setParameter('@companyId', companyId);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const categories: DocumentCategory[] = result.recordsets[1].map((entry) => ({ value: entry.Category, label: entry.Category }));
        const totalResults: number = result.recordsets[0][0].totalCount;
        return paginationService.createPaginatedResult(categories, baseUrl, totalResults, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(`Failed to get employee document category list by company, reason: ${JSON.stringify(error)}`);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This returns a paginated list of all unique document categories among an employee's documents
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {boolean} includePrivateDocumentation: Indicates whether the results should include private documents
 * @param {string} invokerUsername: The username of the account invoking this service
 * @returns {Promise<PaginatedResult>}: A promise of a paginated list of document categories
 */
export async function listEmployeeDocumentCategories(
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
    includePrivateDocumentation: boolean,
    invokerUsername: string,
): Promise<PaginatedResult> {
    console.info('esignatureService.listEmployeeDocumentCategories');

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
        // validate company and employee id
        await Promise.all([validateEmployeeId(tenantId, companyId, employeeId), getCompanyDetails(tenantId, companyId)]);

        const query = new ParameterizedQuery(
            'GetEmployeeLegacyAndSignedDocumentCategoriesByEmployeeId',
            Queries.getEmployeeLegacyAndSignedDocumentCategoriesByEmployeeId,
        );
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@includePrivateDocuments', includePrivateDocumentation ? 1 : 0);
        query.setStringParameter('@invokerUsername', invokerUsername);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const categories: DocumentCategory[] = result.recordsets[1].map((entry) => ({ value: entry.Category, label: entry.Category }));
        const totalResults: number = result.recordsets[0][0].totalCount;
        return paginationService.createPaginatedResult(categories, baseUrl, totalResults, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(`Failed to get employee document category list by employee, reason: ${JSON.stringify(error)}`);
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

        const getDocumentsQueryParams = {
            category: 'onboarding',
            categoryId: taskListId.toString(),
        };

        const taskListDocuments = await listDocuments(
            tenantId,
            companyId,
            getDocumentsQueryParams,
            undefined,
            undefined,
            true,
            configuration,
            true,
        );

        if (!taskListDocuments) {
            return undefined;
        }

        const checkForExistingHelloSignDocs = async () => {
            if (taskListDocuments.results.filter((doc) => doc.Type === 'Template')) {
                const { signature_requests: existingSignatureRequests } = await eSigner.signatureRequest.list({
                    query: `metadata:${onboardingKey}`,
                });
                if (existingSignatureRequests.length > 0) {
                    console.log(`HelloSign signature requests were already created for onboarding key: ${onboardingKey}`);
                    return existingSignatureRequests.map((request) => {
                        return new SignatureRequestResponse({
                            id: request.signature_request_id,
                            title: request.title,
                            status: request.is_complete ? SignatureRequestResponseStatus.Complete : SignatureRequestResponseStatus.Pending,
                            type: EsignatureMetadataType.SignatureRequest,
                            isHelloSignDocument: true,
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
                } else {
                    return [];
                }
            }
        };

        const checkForExistingSimpleSignRequests = async () => {
            if (taskListDocuments.results.filter((doc) => doc.Type === EsignatureMetadataType.SimpleSignatureRequest)) {
                const query = new ParameterizedQuery('getOnboardingSimpleSignDocuments', Queries.getOnboardingSimpleSignDocuments);
                query.setParameter('@companyId', companyId);
                query.setParameter('@employeeCode', employeeCode);
                const payload = {
                    tenantId,
                    queryName: query.name,
                    query: query.value,
                    queryType: QueryType.Simple,
                } as DatabaseEvent;
                const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
                console.log(result);
                console.log(result.recordset);
                if (result.recordset.length > 0) {
                    console.log(`Simple signature requests were already created for onboarding key: ${onboardingKey}`);
                    return result.recordset.map((request) => {
                        let signatureStatus;
                        switch (Number(request.SignatureStatusID)) {
                            case SignatureStatusID.Signed:
                                signatureStatus = SignatureRequestResponseStatus.Complete;
                                break;
                            case SignatureStatusID.Pending:
                                signatureStatus = SignatureRequestResponseStatus.Pending;
                                break;
                            default:
                                signatureStatus = SignatureRequestResponseStatus.Unknown;
                                break;
                        }
                        return new SignatureRequestResponse({
                            id: request.ID,
                            title: request.Title,
                            status: signatureStatus,
                            type: EsignatureMetadataType.SignatureRequest,
                            isHelloSignDocument: false,
                            signatures: [
                                {
                                    id: '',
                                    signer: new Signatory({
                                        emailAddress,
                                        name,
                                        employeeCode,
                                    }),
                                },
                            ],
                        });
                    });
                } else {
                    return [];
                }
            }
        };

        const [helloSignResults, simpleSignResults] = await Promise.all([
            checkForExistingHelloSignDocs(),
            checkForExistingSimpleSignRequests(),
        ]);

        let docsExist = false;
        if (helloSignResults.length > 0 || simpleSignResults.length > 0) {
            docsExist = true;
        }

        const signatureRequestMetadata = { onboardingKey };
        const onboardingDocuments: SignatureRequestResponse[] = [];

        const invocations: Array<Promise<SignatureRequestResponse>> = [];

        for (const document of taskListDocuments.results) {
            if (!docsExist && document.type === EsignatureMetadataType.Template) {
                const bulkSignRequest: BulkSignatureRequest = {
                    templateId: document.id,
                    employeeCodes: [employeeCode],
                    signatories: [
                        {
                            emailAddress,
                            name,
                            role: 'OnboardingSignatory',
                            employeeCode,
                        },
                    ],
                };

                const combine = async () => {
                    const templateResponse = await configuration.eSigner.template.get(document.id);
                    const { signatureRequest, category } = await createHelloSignSignatureRequest(
                        tenantId,
                        companyId,
                        bulkSignRequest,
                        signatureRequestMetadata,
                        configuration,
                        templateResponse,
                    );
                    return await saveEsignatureMetadata(tenantId, companyId, category, [employeeCode], signatureRequest);
                };
                invocations.push(combine());
            } else if (!docsExist && document.type === EsignatureMetadataType.SimpleSignatureRequest) {
                const combine = async () => {
                    const onboardingData = {
                        firstName: name.split(' ')[0],
                        lastName: name.split(' ')[1],
                        emailAddress,
                    };
                    const response = await saveSimpleEsignatureMetadata(
                        { tenantId, companyId },
                        [employeeCode],
                        document.fileMetadataId,
                        false,
                        '',
                        '',
                        true,
                        onboardingData,
                    );
                    return response[0];
                };
                invocations.push(combine());
            } else if (!document.type || document.type === EsignatureMetadataType.NoSignature) {
                delete document.fileMetadataId;
                onboardingDocuments.push(document);
            }
        }

        const creations = await Promise.all(invocations);
        for (const created of creations) {
            onboardingDocuments.push(created);
        }

        return new SignatureRequestListResponse({ results: [...onboardingDocuments, ...helloSignResults, ...simpleSignResults] });
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Template not found') || error.message.includes('Signature not found')) {
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

    const validQueryStringParameters = ['pageToken', 'search', 'role'];
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
export async function getOnboardingDocumentPreview(tenantId: string, id: string, requestBody: any): Promise<any> {
    console.info('esignatureService.getDocumentPreview');

    const { onboardingKey } = requestBody;

    try {
        const decoded = await decodeId(id);

        const taskListQuery = new ParameterizedQuery('getOnboardingByKey', Queries.getOnboardingByKey);
        taskListQuery.setParameter('@onboardingKey', onboardingKey);
        let payload = {
            tenantId,
            queryName: taskListQuery.name,
            query: taskListQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const taskListResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (taskListResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`No onboarding found with key ${onboardingKey}`);
        }
        if (!taskListResult.recordset[0].IsOn) {
            throw errorService.getErrorResponse(70).setDeveloperMessage('The Company Documents section is not active on this task list');
        }

        // if id does not decode properly, assume it's a NoSignature document
        if (decoded.length === 0) {
            const fileMetadataQuery = new ParameterizedQuery(
                'getFileMetadataByEsignatureMetadataId',
                Queries.getFileMetadataByEsignatureMetadataId,
            );
            fileMetadataQuery.setParameter('@id', id);
            payload = {
                tenantId,
                queryName: fileMetadataQuery.name,
                query: fileMetadataQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            const fileMetadataResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                payload,
                InvocationType.RequestResponse,
            );

            if (fileMetadataResult.recordset.length === 0) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(`Document with id ${id} not found`);
            }

            const key = fileMetadataResult.recordset[0].Pointer;

            const params = {
                Bucket: configService.getFileBucketName(),
                Key: key,
            };
            const url = s3Client.getSignedUrl('getObject', params);
            // parse key to get file extension
            const mimeType = key.split('.')[key.split('.').length - 1];

            return { data: url, mimeType: `.${mimeType}` };
        }

        const [documentId] = decoded;

        if (!documentId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage(`Invalid document ID supplied: ${id}`);
        }

        return await getLegacyDocument(tenantId, documentId);
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
 * Generates a document preview for a specified signed document under a tenant
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} id: The unique identifer for the specified document
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function saveOnboardingDocuments(
    tenantId: string,
    companyId: string,
    employeeId: string,
    onboardingKey: string,
    requestBody: any,
): Promise<void> {
    console.info('esignatureService.saveOnboardingDocuments');

    const { taskListId } = requestBody;

    try {
        const taskListQuery = new ParameterizedQuery('GetTaskListDocuments', Queries.getTaskListDocuments);
        taskListQuery.setParameter('@companyId', companyId);
        taskListQuery.setParameter('@taskListId', taskListId);
        const taskListPayload = {
            tenantId,
            queryName: taskListQuery.name,
            query: taskListQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const onboardingQuery = new ParameterizedQuery('GetOnboardingByEmployeeIDAndKey', Queries.getOnboardingByEmployeeIDAndKey);
        onboardingQuery.setParameter('@onboardingKey', onboardingKey);
        onboardingQuery.setParameter('@employeeId', employeeId);
        const onboardingPayload = {
            tenantId,
            queryName: onboardingQuery.name,
            query: onboardingQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [employeeInfo, taskListResult, onboardingResult]: any = await Promise.all([
            utilService.validateEmployee(tenantId, employeeId),
            utilService.invokeInternalService('queryExecutor', taskListPayload, InvocationType.RequestResponse),
            utilService.invokeInternalService('queryExecutor', onboardingPayload, InvocationType.RequestResponse),
            utilService.validateCompany(tenantId, companyId),
        ]);

        if (onboardingResult.recordset.length === 0) {
            throw errorService
                .getErrorResponse(50)
                .setDeveloperMessage(`No onboarding found with key ${onboardingKey} for the specified employee.`);
        }

        if (taskListResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`No onboarding docs found with onboarding key ${onboardingKey}`);
        }

        const noSignDocs = taskListResult.recordsets[1].filter((doc) => doc.Type === 'NoSignature');

        const invocations: Array<Promise<any>> = [];
        for (const doc of noSignDocs) {
            const combine = async () => {
                const id = uuidV4();
                const uploadDate = new Date().toISOString();
                const pointer = `${tenantId}/${companyId}/${employeeId}/${doc.Filename}`;
                const esignatureQuery = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
                esignatureQuery.setParameter('@id', id);
                esignatureQuery.setParameter('@companyId', companyId);
                esignatureQuery.setParameter('@type', EsignatureMetadataType.NoSignature);
                esignatureQuery.setParameter('@uploadDate', uploadDate);
                esignatureQuery.setParameter('@uploadedBy', 'NULL');
                esignatureQuery.setStringParameter('@title', `'${doc.Title}'`);
                esignatureQuery.setStringParameter('@fileName', `'${doc.Filename}'`);
                esignatureQuery.setStringParameter('@category', 'onboarding');
                esignatureQuery.setParameter('@employeeCode', employeeInfo.EmployeeCode);
                esignatureQuery.setParameter('@signatureStatusId', SignatureStatusID.NotRequired);
                esignatureQuery.setParameter('@isOnboardingDocument', '0');

                let payload = {
                    tenantId,
                    queryName: esignatureQuery.name,
                    query: esignatureQuery.value,
                    queryType: QueryType.Simple,
                } as DatabaseEvent;
                await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

                const fileMetadataQuery = new ParameterizedQuery('CreateFileMetadata', Queries.createFileMetadata);
                fileMetadataQuery.setParameter('@companyId', companyId);
                fileMetadataQuery.setParameter('@employeeCode', employeeInfo.EmployeeCode);
                fileMetadataQuery.setStringParameter('@title', doc.Title);
                fileMetadataQuery.setStringParameter('@category', 'onboarding');
                fileMetadataQuery.setParameter('@uploadDate', uploadDate);
                fileMetadataQuery.setParameter('@pointer', pointer);
                fileMetadataQuery.setParameter('@uploadedBy', 'NULL');
                fileMetadataQuery.setParameter('@isPublishedToEmployee', '1');
                fileMetadataQuery.setParameter('@esignatureMetadataId', id);

                payload = {
                    tenantId,
                    queryName: fileMetadataQuery.name,
                    query: fileMetadataQuery.value,
                    queryType: QueryType.Simple,
                } as DatabaseEvent;
                await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

                const params = {
                    Bucket: configService.getFileBucketName(),
                    CopySource: `${configService.getFileBucketName()}/${doc.Pointer}`,
                    Key: pointer,
                };
                await s3Client.copyObject(params).promise();
            };
            invocations.push(combine());
        }

        const creations = await pSettle(invocations);
        creations.forEach((apiInvocation, index) => {
            if (apiInvocation && apiInvocation.isRejected) {
                console.log(apiInvocation.reason);
                throw errorService.getErrorResponse(0).setDeveloperMessage(String(apiInvocation.reason));
            }
        });
    } catch (error) {
        console.error(error);
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
            const query = new ParameterizedQuery('getFileMetadataByEsignatureMetadataId', Queries.getFileMetadataByEsignatureMetadataId);
            query.setParameter('@id', id);
            const payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
            // Note: if there is no FileMetadata record associated with the EsignatureMetadata record,
            // assume it is a HelloSign document.
            if (result.recordset.length === 0) {
                return await getTemplateFiles(id);
            } else {
                const key = result.recordset[0].Pointer;

                const params = {
                    Bucket: configService.getFileBucketName(),
                    Key: key,
                };
                const url = s3Client.getSignedUrl('getObject', params);
                // parse key to get file extension
                const mimeType = key.split('.')[key.split('.').length - 1];

                return result ? { data: url, mimeType: `.${mimeType}` } : undefined;
            }
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
            // set defaults for legacy documents
            // note: default to false if value is null for isPublishedToEmployee and isPrivate flags
            let isPublishedToEmployee = document.isPublishedToEmployee !== null ? document.isPublishedToEmployee : false;
            let isPrivate = document.isPrivateDocument !== null ? document.isPrivateDocument : false;
            let isSignedDocument = false;
            let docType = DocType.EsignatureDocument;
            let id = document.id;
            if (document.isLegacyDocument) {
                isSignedDocument = document.esignDate ? true : false;
                docType = DocType.LegacyDocument;
                id = hashids.encode(Number(id), docType);
            } else if (document.isSignedOrUploadedDocument) {
                isSignedDocument = !document.uploadedBy && document.category === 'onboarding';
                if (document.employeeCode) {
                    isPublishedToEmployee = false;
                    isPrivate = document.isPublishedToEmployee !== null ? !document.isPublishedToEmployee : false;
                } else {
                    isPrivate = false;
                }
                docType = DocType.S3Document;
                id = hashids.encode(Number(id), docType);
            }

            const {
                title,
                fileName,
                category,
                uploadDate,
                esignDate,
                employeeId,
                employeeCode,
                firstName,
                lastName,
                companyId,
                companyName,
                uploadedBy,
                isLegacyDocument,
                isEsignatureDocument,
                signatureStatusName,
                signatureStatusPriority,
                signatureStatusStepNumber,
                isProcessing,
                isHelloSignDocument,
            } = document;
            updatedDocuments.push({
                id,
                title,
                fileName,
                category,
                uploadDate,
                esignDate,
                isPrivate,
                isPublishedToEmployee,
                employeeId,
                employeeCode,
                employeeName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
                companyId,
                companyName,
                isSignedDocument,
                uploadedBy,
                isLegacyDocument,
                isEsignatureDocument,
                isHelloSignDocument,
                status: {
                    name: signatureStatusName,
                    priority: signatureStatusPriority,
                    stepNumber: signatureStatusStepNumber,
                    isProcessing,
                },
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
    useAccelerateEndpoint: true,
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
 * Retrieves an HR legacy document. All legacy documents are now being stored and
 * retrieved from S3.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {number} documentId: The unique identifier of the specified document
 * @returns {any}: A Promise of a document
 */
async function getLegacyDocument(tenantId: string, documentId: number): Promise<any> {
    console.info('esignature.service.getLegacyDocument');

    try {
        // Check if document exists & get S3 pointer
        const documentMetadataQuery = new ParameterizedQuery('GetDocumentMetadataById', Queries.getDocumentMetadataById);
        documentMetadataQuery.setParameter('@id', documentId);
        const documentMetadataPayload = {
            tenantId,
            queryName: documentMetadataQuery.name,
            query: documentMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const documentMetadataResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            documentMetadataPayload,
            InvocationType.RequestResponse,
        );

        if (documentMetadataResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${documentId} not found`);
        }

        let key = documentMetadataResult.recordset[0].Pointer;
        let extension = documentMetadataResult.recordset[0].Extension;

        // Note: If the document doesn't have a pointer (which means it doesn't exist in S3),
        // invoke the queryExecutor while passing the saveToS3 flag in order to save
        // the queried document to S3, bypassing the payload size limitations.
        if (!key) {
            console.info('Not found in S3, retrieving from the database');
            const getDocumentQuery = new ParameterizedQuery('GetDocumentById', Queries.getDocumentById);
            getDocumentQuery.setParameter('@documentId', documentId);
            const getDocumentPayload = {
                tenantId,
                queryName: getDocumentQuery.name,
                query: getDocumentQuery.value,
                queryType: QueryType.Simple,
                saveToS3: true,
            } as DatabaseEvent;
            const getDocumentResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                getDocumentPayload,
                InvocationType.RequestResponse,
            );

            if (!getDocumentResult.s3Key) {
                throw errorService.getErrorResponse(0).setMoreInfo('The file could not be uploaded to S3.');
            }

            key = getDocumentResult.s3Key;
            extension = getDocumentResult.extension;

            const updateDocumentPointerQuery = new ParameterizedQuery('UpdateDocumentPointerById', Queries.updateDocumentPointerById);
            updateDocumentPointerQuery.setParameter('@id', documentId);
            updateDocumentPointerQuery.setParameter('@key', key);
            const updateDocumentPointerPayload = {
                tenantId,
                queryName: updateDocumentPointerQuery.name,
                query: updateDocumentPointerQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            await utilService.invokeInternalService('queryExecutor', updateDocumentPointerPayload, InvocationType.RequestResponse);
        }

        const params = {
            Bucket: configService.getFileBucketName(),
            Key: key,
        };
        const url = s3Client.getSignedUrl('getObject', params);

        return { data: url, mimeType: extension };
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
 * Generates S3 presigned url for document uploads
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} invoker: The name of the invoking user
 * @param requestPayload:  The metadata to be attached to the document on uploads
 * @returns {Promise<any>} : A Promise of S3 presigned url
 */
export async function generateDocumentUploadUrl(tenantId: string, companyId: string, invoker: string, requestPayload: any): Promise<any> {
    console.info('esignature.service.generateDocumentUploadUrl');

    const { employeeId, fileName: filename, title, isPrivate = false, documentId, category, isOnboardingDocument } = requestPayload;

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    // employeeId value must be integral
    if (employeeId && Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    if (filename.lastIndexOf('.') === -1) {
        throw errorService.getErrorResponse(30).setDeveloperMessage('fileName should have an extension');
    }

    // handle company documents
    let newFileName = filename;
    let esignatureMetadataId;
    if (!documentId && !employeeId && companyId) {
        esignatureMetadataId = uuidV4().replace(/-/g, '');
        // we are using the generated id as the filename to avoid duplicates
        // pull off the file extension and append it to the id
        newFileName = `${esignatureMetadataId}${filename.substring(filename.lastIndexOf('.'))}`;
    }

    const uploadS3Filename = newFileName.replace(/[^a-zA-Z0-9.]/g, '');

    let key = employeeId ? `${tenantId}/${companyId}/${employeeId}/${filename}` : `${tenantId}/${companyId}/${uploadS3Filename}`;
    key = utilService.sanitizeForS3(key);

    // Check for file existence to avoid overwritting - duplicates allowed.
    const [updatedFilename, s3UploadKey] = await utilService.checkForFileExistence(key, uploadS3Filename, tenantId, companyId, employeeId);

    let employeeMetadata: any = {};

    if (employeeId) {
        // Generate employee metadata
        try {
            // get employee code and check if employee exists
            const query = new ParameterizedQuery('GetEmployeeInfoById', Queries.getEmployeeInfoById);
            query.setParameter('@employeeId', employeeId);
            const payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const employeeResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

            if (employeeResult.recordset.length === 0) {
                const developerMessage = `Employee with ID ${employeeId} not found.`;
                throw errorService.getErrorResponse(50).setDeveloperMessage(developerMessage);
            }
            const employee = employeeResult.recordset[0];
            const employeeCode = employee.EmployeeCode;
            const employeeName = employee.FirstName && employee.LastName ? `${employee.FirstName} ${employee.LastName}` : undefined;
            employeeMetadata = {
                employeeId: employeeId.toString(),
                employeeName,
                employeeCode,
            };
        } catch (error) {
            if (error instanceof ErrorMessage) {
                throw error;
            }

            console.error(JSON.stringify(error));
            throw errorService.getErrorResponse(0);
        }
    }

    let documentMetadata: any = {};
    if (documentId) {
        const [decodedId, type] = await decodeId(documentId);
        const isLegacyDocument = type === DocType.LegacyDocument;
        documentMetadata = {
            documentId,
            isLegacyDocument: String(isLegacyDocument), // S3 object metadata must be strings.
        };

        if (isLegacyDocument) {
            let legacyDocOldCategory;
            if (employeeId) {
                const { metadata: oldLegacyDocMetadata } = await isEditableLegacyEmployeeDocument(String(decodedId), tenantId, employeeId);
                legacyDocOldCategory = oldLegacyDocMetadata.category;
            } else {
                const query = new ParameterizedQuery('getDocumentMetadataById', Queries.getDocumentMetadataById);
                query.setParameter('@id', decodedId);
                const payload = {
                    tenantId,
                    queryName: query.name,
                    query: query.value,
                    queryType: QueryType.Simple,
                } as DatabaseEvent;
                const documentMetadataResult: any = await utilService.invokeInternalService(
                    'queryExecutor',
                    payload,
                    InvocationType.RequestResponse,
                );

                if (documentMetadataResult.recordset.length === 0) {
                    throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${decodedId} not found`);
                }

                const { DocumentCategory: legacyDocCategory } = documentMetadataResult.recordset[0];
                legacyDocOldCategory = legacyDocCategory;
            }
            if (legacyDocOldCategory) {
                documentMetadata.category = legacyDocOldCategory;
            }
        } else {
            // In order to preserve the old category if the user did not supply a new one,
            // we need to retrieve file metadata record from the database and use the
            // existing category.
            const query = new ParameterizedQuery('getFileMetadataById', Queries.getFileMetadataById);
            query.setParameter('@id', decodedId);
            const fileMetadataPayload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const fileMetadataResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                fileMetadataPayload,
                InvocationType.RequestResponse,
            );

            if (fileMetadataResult.recordset.length === 0) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${decodedId} not found`);
            }

            const { Category: oldCategory } = fileMetadataResult.recordset[0];

            if (oldCategory) {
                documentMetadata.category = oldCategory;
            }
        }
    } else {
        if (!documentId && !employeeId && companyId) {
            documentMetadata.isOnboardingDocument = isOnboardingDocument ? 'true' : 'false';
            documentMetadata.category = category;
            documentMetadata.esignatureMetadataId = esignatureMetadataId;
        }
    }

    const metadata = {
        fileName: updatedFilename,
        title,
        isPrivate: isPrivate.toString(),
        uploadedBy: invoker,
        tenantId,
        companyId,
        ...employeeMetadata,
        ...documentMetadata,
    };

    if (category) {
        metadata.category = category;
    }

    const url = s3Client.getSignedUrl('putObject', {
        Bucket: configService.getFileBucketName(),
        Key: s3UploadKey,
        ContentType: mime.contentType(updatedFilename),
        ContentEncoding: 'base64',
        ACL: 'bucket-owner-full-control',
        Expires: 90, // 90 seconds TTL,
        Metadata: metadata,
    });

    return { url, uploadFilename: updatedFilename };
}

/**
 * Checks to verify whether a given legacy document is editable
 * @param {string} decodedDocumentId: The legacy document database record identifier
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} employeeId: The unique identifier for the employee document belongs to.
 * @return {Promise<any>}: A Promise of the document's metadata and editable status.
 */
export async function isEditableLegacyEmployeeDocument(decodedDocumentId: string, tenantId: string, employeeId: string): Promise<any> {
    console.info('esignature.service.isEditableLegacyDocument');

    // get document metadata / make sure it exists in the database and belongs to the employee
    const query = new ParameterizedQuery('getDocumentMetadataById', Queries.getDocumentMetadataById);
    query.appendFilter(`EmployeeID = '${employeeId}'`);
    query.setParameter('@id', decodedDocumentId);
    const payload = {
        tenantId,
        queryName: query.name,
        query: query.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

    if (fileMetadataResult.recordset.length === 0) {
        throw errorService.getErrorResponse(50).setDeveloperMessage(`The document id: ${decodedDocumentId} not found`);
    }

    const autoGeneratedFileCategories = ['Onboarding-I9', 'Onboarding-W4', 'Onboarding-Direct Deposit', 'Onboarding-Background Check Auth'];
    const {
        Title: prevTitle,
        DocumentCategory: prevCategory,
        IsPublishedToEmployee: prevIsPublishedToEmployee,
        IsPrivateDocument: prevIsPrivateDocument,
        UploadDate: prevUploadDate,
        Extension: prevExtension,
        Filename: prevFileName,
        UploadByUsername: uploadByUsername,
        Pointer: pointer,
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

    return {
        editable: true,
        metadata: {
            isPrivate: prevIsPrivateDocument !== null && prevIsPrivateDocument,
            title: prevTitle,
            category: prevCategory,
            isPublishedToEmployee: prevIsPublishedToEmployee,
            uploadDate: prevUploadDate,
            extension: prevExtension,
            fileName: prevFileName,
            pointer,
        },
    };
}

/**
 * Persists metadata from an S3 uploaded document.
 * @param {string } uploadedItemS3Key: The uploaded document's S3 object key
 * @param {string} uploadTime: The time of document upload.
 */
export async function saveUploadedDocumentMetadata(uploadedItemS3Key: string, uploadTime: string): Promise<void> {
    console.info('esignature.service.saveUploadedDocumentMetadata');

    // Unfortunately, S3 object metadata is not included in generated S3 event.
    // So need to inspect via api...
    try {
        const item = await s3Client
            .headObject({
                Bucket: configService.getFileBucketName(),
                Key: uploadedItemS3Key,
            })
            .promise();

        console.log(`raw item: ${JSON.stringify(item)}`);
        const metadata: any = item.Metadata;

        const {
            tenantid,
            companyid,
            employeeid,
            employeecode,
            uploadedby,
            title,
            documentid,
            islegacydocument,
            isprivate,
            isesigneddocument,
            category,
            isonboardingdocument,
            filename,
            esignaturemetadataid,
        } = metadata;

        // Don't handle documents generated when e-signed. Their metadata has already been persisted to the database
        if (isesigneddocument) {
            return;
        }

        let query: ParameterizedQuery;
        let payload: any = {};

        // Employee document creation
        if (employeeid && !documentid) {
            const esignatureMetadataId = uuidV4().replace(/-/g, '');
            query = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
            query.setParameter('@id', esignatureMetadataId);
            query.setParameter('@companyId', companyid);
            query.setParameter('@type', EsignatureMetadataType.NoSignature);
            query.setParameter('@uploadDate', uploadTime);
            query.setParameter('@uploadedBy', `'${uploadedby}'`);
            query.setParameter('@title', `'${title.replace(/'/g, "''")}'`);
            query.setParameter('@fileName', `'${filename.replace(/'/g, "''")}'`);
            query.setParameter('@category', category ? `'${category}'` : 'NULL');
            query.setParameter('@employeeCode', `'${employeecode}'`);
            query.setParameter('@signatureStatusId', SignatureStatusID.NotRequired);
            query.setParameter('@isOnboardingDocument', isonboardingdocument === 'true' ? '1' : '0');

            payload = {
                tenantId: tenantid,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

            query = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
            query.setParameter('@companyId', companyid);
            query.setParameter('@employeeCode', `'${employeecode}'`);
            query.setParameter('@title', `${title.replace(/'/g, "''")}`);
            query.setStringParameter('@category', category || '');
            query.setParameter('@uploadDate', uploadTime);
            query.setParameter('@pointer', uploadedItemS3Key.replace(/'/g, "''"));
            query.setParameter('@uploadedBy', `'${uploadedby}'`);
            query.setParameter('@isPublishedToEmployee', isprivate === 'true' ? '0' : '1');
            query.setParameter('@esignatureMetadataId', esignatureMetadataId);
        }

        // Employee document updates
        if (employeeid && documentid) {
            const [decodedId] = await decodeId(documentid);

            // if a newer document, update the current metadata and delete the old S3 object referenced
            if (islegacydocument === 'false') {
                // load current record:
                const currentDocumentQuery = new ParameterizedQuery('getFileMetadataById', Queries.getFileMetadataById);
                currentDocumentQuery.appendFilter(`EmployeeCode = '${employeecode}'`);
                currentDocumentQuery.setParameter('@id', decodedId);
                payload = {
                    tenantId: tenantid,
                    queryName: currentDocumentQuery.name,
                    query: currentDocumentQuery.value,
                    queryType: QueryType.Simple,
                } as DatabaseEvent;

                const fileMetadataResult: any = await utilService.invokeInternalService(
                    'queryExecutor',
                    payload,
                    InvocationType.RequestResponse,
                );
                const {
                    Title: oldTitle,
                    Pointer: oldPointer,
                    IsPublishedToEmployee: oldIsPublishedToEmployee,
                } = fileMetadataResult.recordset[0];

                // update record in database
                // Note: default null values to true for the isPublishedToEmployee flag
                let published = oldIsPublishedToEmployee === null || oldIsPublishedToEmployee ? '1' : '0';
                if (isprivate !== undefined) {
                    published = isprivate === 'true' ? '0' : '1';
                }

                query = new ParameterizedQuery('UpdateFileMetadataById', Queries.updateFileMetadataById);
                query.setParameter('@id', decodedId);
                query.setParameter('@title', title ? title.replace(/'/g, "''") : oldTitle.replace(/'/g, "''"));
                query.setParameter('@pointer', (uploadedItemS3Key && uploadedItemS3Key.replace(/'/g, "''")) || oldPointer);
                query.setParameter('@isPublishedToEmployee', published);
                query.setStringParameter('@category', category || '');

                // delete existing item from S3
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
        }

        // Company document creation
        if (companyid && !employeeid && !documentid) {
            // create esignature metadata
            query = new ParameterizedQuery('CreateEsignatureMetadata', Queries.createEsignatureMetadata);
            query.setParameter('@id', esignaturemetadataid);
            query.setParameter('@companyId', companyid);
            query.setParameter('@type', EsignatureMetadataType.SimpleSignatureRequest);
            query.setParameter('@uploadDate', uploadTime);
            query.setParameter('@uploadedBy', `'${uploadedby}'`);
            query.setParameter('@title', `'${title.replace(/'/g, "''")}'`);
            query.setParameter('@fileName', `'${filename.replace(/'/g, "''")}'`);
            query.setParameter('@category', category ? `'${category}'` : 'NULL');
            query.setParameter('@employeeCode', 'NULL');
            query.setParameter('@signatureStatusId', SignatureStatusID.NotRequired);
            query.setParameter('@isOnboardingDocument', isonboardingdocument === 'true' ? '1' : '0');

            payload = {
                tenantId: tenantid,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

            // create file metadata
            query = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
            query.setParameter('@companyId', companyid);
            query.setParameter('@employeeCode', 'NULL');
            query.setParameter('@title', `${title.replace(/'/g, "''")}`);
            query.setStringParameter('@category', category || '');
            query.setParameter('@uploadDate', uploadTime);
            query.setParameter('@pointer', uploadedItemS3Key.replace(/'/g, "''"));
            query.setParameter('@uploadedBy', `'${uploadedby}'`);
            query.setParameter('@isPublishedToEmployee', isprivate === 'true' ? '0' : '1');
            query.setParameter('@esignatureMetadataId', esignaturemetadataid);
        }

        if (!query) {
            return;
        }

        payload = {
            tenantId: tenantid,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
    } catch (error) {
        console.error(`Unable to save S3 object: ${uploadedItemS3Key} to database. Reason: ${error}`);
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

    const { file, fileName, title, category, isPublishedToEmployee, isOnboardingDocument = false } = request;

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

        [updatedFilename, key] = await utilService.checkForFileExistence(key, fileName, tenantId, companyId);

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

        const uploadDate = new Date().toISOString();
        const esignatureMetadataId = uuidV4().replace(/-/g, '');
        const uploadedBy = `'${firstName} ${lastName}'`;

        // create esignature metadata
        const esignatureMetadataQuery = new ParameterizedQuery('createEsignatureMetadata', Queries.createEsignatureMetadata);
        esignatureMetadataQuery.setParameter('@id', esignatureMetadataId);
        esignatureMetadataQuery.setParameter('@companyId', companyId);
        esignatureMetadataQuery.setParameter('@type', EsignatureMetadataType.NoSignature);
        esignatureMetadataQuery.setParameter('@uploadDate', uploadDate);
        esignatureMetadataQuery.setParameter('@uploadedBy', uploadedBy);
        esignatureMetadataQuery.setParameter('@title', `'${title.replace(/'/g, "''")}'`);
        esignatureMetadataQuery.setParameter('@fileName', `'${fileName.replace(/'/g, "''")}'`);
        esignatureMetadataQuery.setParameter('@category', category ? `'${category}'` : 'NULL');
        esignatureMetadataQuery.setParameter('@employeeCode', 'NULL');
        esignatureMetadataQuery.setParameter('@signatureStatusId', SignatureStatusID.NotRequired);
        esignatureMetadataQuery.setParameter('@isOnboardingDocument', isOnboardingDocument ? 1 : 0);

        let payload = {
            tenantId,
            queryName: esignatureMetadataQuery.name,
            query: esignatureMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        // create file metadata
        const fileMetadataQuery = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
        fileMetadataQuery.setParameter('@companyId', companyId);
        fileMetadataQuery.setParameter('@employeeCode', 'NULL');
        fileMetadataQuery.setParameter('@title', `${title.replace(/'/g, "''")}`);
        fileMetadataQuery.setParameter('@category', category ? `'${category}'` : 'NULL');
        fileMetadataQuery.setParameter('@uploadDate', uploadDate);
        fileMetadataQuery.setParameter('@pointer', key.replace(/'/g, "''"));
        fileMetadataQuery.setParameter('@uploadedBy', uploadedBy);
        fileMetadataQuery.setParameter('@isPublishedToEmployee', isPublishedToEmployee ? '1' : '0');
        fileMetadataQuery.setParameter('@esignatureMetadataId', esignatureMetadataId);

        payload = {
            tenantId,
            queryName: fileMetadataQuery.name,
            query: fileMetadataQuery.value,
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
            isOnboardingDocument,
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

export async function updateSignatureRequestStatus(
    tenantId: string,
    companyId: string,
    employeeId: string,
    documentId: string,
    request: any,
): Promise<any> {
    console.info('esignature.service.updateSignatureRequestStatus');

    try {
        const { stepNumber } = request;

        const statusQuery = new ParameterizedQuery('getSignatureStatusByStepNumber', Queries.getSignatureStatusByStepNumber);
        statusQuery.setParameter('@stepNumber', stepNumber);
        const statusPayload = {
            tenantId,
            queryName: statusQuery.name,
            query: statusQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const esignatureMetadataQuery = new ParameterizedQuery('getEsignatureMetadataById', Queries.getEsignatureMetadataById);
        esignatureMetadataQuery.setParameter('@id', documentId);
        const esignatureMetadataPayload = {
            tenantId,
            queryName: esignatureMetadataQuery.name,
            query: esignatureMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [statusResult, esignatureMetadataResult]: any[] = await Promise.all([
            utilService.invokeInternalService('queryExecutor', statusPayload, InvocationType.RequestResponse),
            utilService.invokeInternalService('queryExecutor', esignatureMetadataPayload, InvocationType.RequestResponse),
            utilService.validateCompany(tenantId, companyId),
            validateEmployeeId(tenantId, companyId, employeeId),
        ]);

        if (statusResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Status with step number ${stepNumber} not found.`);
        }

        if (esignatureMetadataResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Signature request with ID ${documentId} not found.`);
        }

        const statusId = statusResult.recordset[0].ID;
        const query = new ParameterizedQuery(
            'UpdateEsignatureMetadataSignatureStatusById',
            Queries.updateEsignatureMetadataSignatureStatusById,
        );
        query.setParameter('@signatureStatusId', statusId);
        query.setParameter('@id', documentId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        return {
            id: documentId,
            status: {
                name: statusResult.recordset[0].Name,
                priority: statusResult.recordset[0].Priority,
                stepNumber: statusResult.recordset[0].StepNumber,
                isProcessing: true,
            },
        };
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

    const { title, isPrivate, category } = request;

    try {
        // get file metadata / make sure it exists in the database & belongs to the employee
        let query = new ParameterizedQuery('getFileMetadataById', Queries.getFileMetadataById);
        query.appendFilter(`e.EmployeeCode = '${employeeCode}'`);
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

        // update record in database
        // Note: default null values to true for the isPublishedToEmployee flag
        let published = oldIsPublishedToEmployee === null || oldIsPublishedToEmployee ? '1' : '0';
        if (isPrivate !== undefined) {
            published = isPrivate ? '0' : '1';
        }

        let categoryToUse = oldCategory !== null && oldCategory !== '' ? oldCategory : '';
        categoryToUse = category || categoryToUse;

        query = new ParameterizedQuery('UpdateFileMetadataById', Queries.updateFileMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', title ? title.replace(/'/g, "''") : oldTitle.replace(/'/g, "''"));
        query.setParameter('@pointer', oldPointer);
        query.setParameter('@isPublishedToEmployee', published);
        query.setStringParameter('@category', categoryToUse);
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
            fileName: oldFileName,
            extension: oldExtension,
            uploadDate: oldUploadDate,
            isPrivate: published === '0',
            category: categoryToUse,
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

    const { title, isPrivate, category } = request;

    try {
        const documentMetadata = await isEditableLegacyEmployeeDocument(String(documentId), tenantId, employeeId);

        const {
            metadata: {
                isPrivate: currentPrivacy,
                title: currentTitle,
                category: currentCategory,
                isPublishedToEmployee,
                uploadDate,
                extension,
                fileName,
            },
        } = documentMetadata;

        // update record in database
        // Note: default null values to false for the isPrivate flag
        let documentPrivacy = currentPrivacy ? '1' : '0';
        if (isPrivate !== undefined) {
            documentPrivacy = isPrivate ? '1' : '0';
        }

        let titleToUse = currentTitle !== null ? `'${currentTitle.replace(/'/g, "''")}'` : 'NULL';
        titleToUse = title ? `'${title.replace(/'/g, "''")}'` : titleToUse;

        let categoryToUse = currentCategory !== null && currentCategory !== '' ? currentCategory : '';
        categoryToUse = category || categoryToUse;

        const query = new ParameterizedQuery('UpdateDocumentMetadataById', Queries.updateDocumentMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', titleToUse);
        query.setStringParameter('@category', categoryToUse);
        query.setParameter('@isPublishedToEmployee', isPublishedToEmployee !== null ? isPublishedToEmployee : 'NULL');
        query.setParameter('@isPrivateDocument', documentPrivacy);
        const payload = {
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
            title: title || currentTitle,
            fileName,
            extension,
            uploadDate,
            isPrivate: documentPrivacy === '1',
            category: categoryToUse,
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

    const { fileObject, title, category, isPublishedToEmployee, isOnboardingDocument } = request;

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
            isOnboardingDocument: oldIsOnboardingDocument,
            UploadDate: oldUploadDate,
            Type: type,
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

            [newFileName, newKey] = await utilService.checkForFileExistence(newKey, newFileName, tenantId, companyId);

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

        // update records in database
        let published = oldIsPublishedToEmployee ? '1' : '0';
        if (isPublishedToEmployee !== undefined) {
            published = isPublishedToEmployee ? '1' : '0';
        }
        let onboarding = oldIsOnboardingDocument ? '1' : '0';
        if (isOnboardingDocument !== undefined) {
            onboarding = isOnboardingDocument ? '1' : '0';
        }
        query = new ParameterizedQuery('UpdateFileMetadataById', Queries.updateFileMetadataById);
        query.setParameter('@id', documentId);
        query.setParameter('@title', title ? `${title.replace(/'/g, "''")}` : `${oldTitle.replace(/'/g, "''")}`);
        query.setParameter('@category', category !== undefined ? `'${category}'` : `'${oldCategory}'`);
        query.setParameter('@pointer', (newKey && newKey.replace(/'/g, "''")) || oldPointer);
        query.setParameter('@isPublishedToEmployee', published);

        const onboardingQuery = new ParameterizedQuery(
            'UpdateOnboardingStatusForEsignatureMetadata',
            Queries.updateOnboardingStatusForEsignatureMetadata,
        );
        onboardingQuery.setParameter('@id', documentId);
        onboardingQuery.setParameter('@isOnboardingDocument', onboarding);

        query.combineQueries(onboardingQuery, true);

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
            isEsignatureDocument: type !== EsignatureMetadataType.NoSignature,
            category: category !== undefined ? category : oldCategory,
            isPublishedToEmployee: isPublishedToEmployee !== undefined ? isPublishedToEmployee : oldIsPublishedToEmployee,
            isOnboardingDocument: isOnboardingDocument !== undefined ? isOnboardingDocument : oldIsOnboardingDocument,
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
            fileName: prevFileName,
            extension: prevExtension,
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

        return await deleteCompanyDocumentRecord(tenantId, docType, docId, s3Key);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Deletes a specified document record under an employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} documentId: The unique identifier for the document to be deleted.
 * @param {string} userEmail: The email address of the user.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 */
export async function deleteEmployeeDocument(
    tenantId: string,
    companyId: string,
    employeeId: string,
    documentId: string,
    userEmail: string,
    roles: string[],
): Promise<void> {
    console.info('esignature.service.deleteEmployeeDocument');

    // TODO: (MJ-3308) read this out of the database so that it's more maintainable.
    const autoGeneratedFileCategories = ['Onboarding-I9', 'Onboarding-W4', 'Onboarding-Direct Deposit', 'Onboarding-Background Check Auth'];

    try {
        let docType: DocType;
        let docId: number | string;

        const [employee] = await Promise.all([
            employeeService.getById(tenantId, companyId, employeeId, userEmail, roles),
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

        docType = type;
        docId = decodedId;

        let documentQuery: ParameterizedQuery;

        switch (docType) {
            case DocType.S3Document:
                documentQuery = new ParameterizedQuery('getFileMetadataByIdAndCompanyId', Queries.getFileMetadataByIdAndCompanyId);
                documentQuery.setParameter('@id', docId);
                documentQuery.setParameter('@companyId', companyId);
                break;
            case DocType.LegacyDocument:
                documentQuery = new ParameterizedQuery('getDocumentByIdAndEmployeeId', Queries.getDocumentByIdAndEmployeeId);
                documentQuery.setParameter('@id', docId);
                documentQuery.setParameter('@employeeId', employeeId);
                break;
            default:
                throw new Error('Unknown document type');
        }

        const resultSet: any = await utilService.authorizeAndRunQuery(
            tenantId,
            // note: assume that if the user has access to the company,
            // they have access to all employees under that company.
            utilService.Resources.Company,
            companyId,
            userEmail,
            documentQuery,
        );

        if (resultSet[0].length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Document with ID ${documentId} not found.`);
        }

        const document = resultSet[0][0];

        if (
            (docType === DocType.S3Document && !document.UploadedBy && document.Category === 'onboarding') ||
            (docType === DocType.LegacyDocument && document.ESignDate)
        ) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Signed documents cannot be deleted');
        }

        if (
            ((docType === DocType.S3Document && !document.EmployeeCode) || docType === DocType.LegacyDocument) &&
            document.IsPublishedToEmployee
        ) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Documents that are published to employees cannot be deleted');
        }

        if (
            docType === DocType.LegacyDocument &&
            ((document.UploadByUsername === 'Onboarding' &&
                autoGeneratedFileCategories.filter((category) => category === document.DocumentCategory).length > 0) ||
                (document.DocumentCategory === 'I-9' && document.Title === 'FormI9'))
        ) {
            throw errorService
                .getErrorResponse(30)
                .setDeveloperMessage('Documents generated by the system cannot be deleted')
                .setMoreInfo('These files are W4, I9, Direct Deposit, and Background Check Auth');
        }

        const s3Key = resultSet[0][0].Pointer;

        return await deleteEmployeeDocumentRecord(tenantId, docType, docId, s3Key);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

async function deleteCompanyDocumentRecord(tenantId: string, docType: DocType, recordId: number | string, s3Key?: string): Promise<void> {
    console.info('esignature.service.deleteCompanyDocumentRecord');

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
                if (s3Key) {
                    s3Client
                        .deleteObject({
                            Bucket: configService.getFileBucketName(),
                            Key: s3Key,
                        })
                        .promise()
                        .catch((e) => {
                            throw new Error(e);
                        });
                }

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

async function deleteEmployeeDocumentRecord(tenantId: string, docType: DocType, recordId: number | string, s3Key?: string): Promise<void> {
    console.info('esignature.service.deleteEmployeeDocumentRecord');

    if (s3Key) {
        s3Client
            .deleteObject({
                Bucket: configService.getFileBucketName(),
                Key: s3Key,
            })
            .promise()
            .catch((e) => {
                throw new Error(e);
            });
    }

    try {
        let query: ParameterizedQuery;
        switch (docType) {
            case DocType.S3Document:
                query = new ParameterizedQuery('DeleteFileMetadataById', Queries.deleteFileMetadataById);
                break;
            case DocType.LegacyDocument:
                query = new ParameterizedQuery('DeleteDocumentById', Queries.deleteDocumentById);
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
 * Creates a specified document record under a company and uploads the file to S3
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {any} request: The company document request.
 * @param {string} firstName: The first name of the invoking user.
 * @param {string} lastName: The last name of the invoking user.
 * @returns {any}: A Promise of a created company document
 */
export async function createSimpleSignDocument(
    tenantId: string,
    companyId: string,
    employeeId: string,
    requestBody: any,
    ipAddress: string,
): Promise<any> {
    console.info('esignature.service.createSimpleSignDocument');

    const { signatureRequestId, timeZone } = requestBody;
    const fileDir = uuidV4();
    const tmpFileDir = `/tmp/${fileDir}`;
    let fileName;

    try {
        // verify that the company and employee exists & get info
        const [companyInfo, employeeInfo]: any[] = await Promise.all([
            await utilService.validateCompany(tenantId, companyId),
            await utilService.validateEmployee(tenantId, employeeId),
        ]);

        // retrieve pointer from database
        const documentQuery = new ParameterizedQuery(
            'getFileMetadataByEsignatureMetadataId',
            Queries.getFileMetadataByEsignatureMetadataId,
        );
        documentQuery.setParameter('@id', signatureRequestId);
        documentQuery.appendFilter(`e.CompanyID = ${companyId}`, true);
        documentQuery.appendFilter(`e.EmployeeCode = '${employeeInfo.EmployeeCode}'`, true);
        let payload = {
            tenantId,
            queryName: documentQuery.name,
            query: documentQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const documentResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (documentResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Signature request with id ${signatureRequestId} not found`);
        }

        if (Number(documentResult.recordset[0].SignatureStatusID) === SignatureStatusID.Signed) {
            throw errorService.getErrorResponse(70).setDeveloperMessage('This document has already been signed.');
        }

        // retrieve file from s3
        const item = await s3Client
            .getObject({
                Bucket: configService.getFileBucketName(),
                Key: documentResult.recordset[0].Pointer,
            })
            .promise();
        fileName = item.Metadata.filename;

        // Note: we must write the file to the tmp directory on the Lambda container in order to convert it to a pdf.
        // The file is saved as the specified file name in the payload with a guid attached to it in order to
        // prevent conflicts.
        fs.mkdirSync(tmpFileDir);
        fs.writeFileSync(`${tmpFileDir}/${fileName}`, item.Body.toString('base64'), 'base64');

        // convert to pdf
        // TODO: (MJ-7051) convert doc and docx to pdf
        const extension = fileName.split('.').pop();
        let pdfDoc;
        if (extension === 'jpg') {
            pdfDoc = await PDFDocument.create();
            const imageBytes = fs.readFileSync(`${tmpFileDir}/${fileName}`);
            const image = await pdfDoc.embedJpg(imageBytes);
            const imagePage = pdfDoc.addPage([image.width, image.height]);
            imagePage.drawImage(image);
        } else if (extension === 'png') {
            pdfDoc = await PDFDocument.create();
            const imageBytes = fs.readFileSync(`${tmpFileDir}/${fileName}`);
            const image = await pdfDoc.embedPng(imageBytes);
            const imagePage = pdfDoc.addPage([image.width, image.height]);
            imagePage.drawImage(image);
        } else if (extension === 'docx' || extension === 'doc') {
            const pdfDocPath = await convertTo(`${fileDir}/${fileName}`, 'pdf');
            pdfDoc = await PDFDocument.load(fs.readFileSync(pdfDocPath));
        } else {
            pdfDoc = await PDFDocument.load(fs.readFileSync(`${tmpFileDir}/${fileName}`));
        }

        // define signature page variables
        enum FontSize {
            Header = 16,
            CompanyName = 14,
            Normal = 12,
        }
        const gray800 = rgb(66 / 255, 66 / 255, 66 / 255);
        const gray600 = rgb(117 / 255, 117 / 255, 117 / 255);
        const gray300 = rgb(224 / 255, 224 / 255, 224 / 255);
        const verticalMargin = 34;
        const labelHorizontalMargin = 47;
        const valueHorizontalMargin = 159;

        const { FirstName: firstName, LastName: lastName, EmailAddress: emailAddress, EmployeeCode: employeeCode } = employeeInfo;
        const { CompanyName: companyName } = companyInfo;
        let employeeName = `${firstName} ${lastName}`;
        employeeName = emailAddress ? `${employeeName} (${emailAddress})` : employeeName;
        const adjustedTimeZone = !!moment.tz.zone(timeZone) ? timeZone : 'UTC';
        const signDate = moment(new Date())
            .tz(adjustedTimeZone)
            .format('MMMM Do, YYYY h:mm A z');
        const title = documentResult.recordset[0].Title;

        // create signature page - page dimensions defined in UI mocks
        const page = pdfDoc.addPage([612, 792]);
        const { width, height } = page.getSize();

        const fontResult = await fetch.get({
            url: configService.getSignaturePageFontUrl(),
            encoding: null, // tslint:disable-line:no-null-keyword
        });
        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontResult);

        page.drawText(companyName, {
            x: width - labelHorizontalMargin - customFont.widthOfTextAtSize(companyName, FontSize.CompanyName),
            y: height - verticalMargin - customFont.heightAtSize(FontSize.CompanyName),
            size: FontSize.CompanyName,
            font: customFont,
            color: gray800,
        });
        page.drawText('Signature Page', {
            x: labelHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Header) - 76,
            size: FontSize.Header,
            font: customFont,
            color: gray800,
        });
        page.drawText('Title', {
            x: labelHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 130,
            size: FontSize.Normal,
            font: customFont,
            color: gray600,
        });
        page.drawText('File name', {
            x: labelHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 156,
            size: FontSize.Normal,
            font: customFont,
            color: gray600,
        });
        page.drawText('Document ID', {
            x: labelHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 182,
            size: FontSize.Normal,
            font: customFont,
            color: gray600,
        });
        page.drawSvgPath('M 0,0 l 527,0', { x: 42, y: height - 232.25, borderColor: gray300 });
        page.drawText('E-signed by', {
            x: labelHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 250,
            size: FontSize.Normal,
            font: customFont,
            color: gray600,
        });
        page.drawText(title, {
            x: valueHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 130,
            size: FontSize.Normal,
            font: customFont,
            color: gray800,
        });
        page.drawText(`${signatureRequestId}.pdf`, {
            x: valueHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 156,
            size: FontSize.Normal,
            font: customFont,
            color: gray800,
        });
        page.drawText(signatureRequestId, {
            x: valueHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 182,
            size: FontSize.Normal,
            font: customFont,
            color: gray800,
        });
        page.drawText(employeeName, {
            x: valueHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 250,
            size: FontSize.Normal,
            font: customFont,
            color: gray800,
        });
        page.drawText(signDate, {
            x: valueHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 276,
            size: FontSize.Normal,
            font: customFont,
            color: gray800,
        });
        page.drawText(`IP address: ${ipAddress}`, {
            x: valueHorizontalMargin,
            y: height - customFont.heightAtSize(FontSize.Normal) - 302,
            size: FontSize.Normal,
            font: customFont,
            color: gray800,
        });
        page.drawText(`Doc ID: ${signatureRequestId}`, {
            x: width - labelHorizontalMargin - customFont.widthOfTextAtSize(`Doc ID: ${signatureRequestId}`, FontSize.Normal),
            y: verticalMargin,
            size: FontSize.Normal,
            font: customFont,
            color: gray600,
        });

        const pdfBytes = await pdfDoc.save();

        // upload to s3
        const newKey = `${tenantId}/${companyId}/${employeeId}/${signatureRequestId}.pdf`;
        await s3Client
            .upload({
                Bucket: configService.getFileBucketName(),
                Key: newKey,
                Body: Buffer.from(pdfBytes),
                Metadata: {
                    fileName: `${signatureRequestId}.pdf`,
                },
                ContentEncoding: 'base64',
                ContentType: 'application/pdf',
            })
            .promise()
            .catch((e) => {
                throw new Error(e);
            });

        // upload to database
        const { Title, Category } = documentResult.recordset[0];
        const uploadDate = new Date().toISOString();
        const fileMetadataQuery = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
        fileMetadataQuery.setParameter('@companyId', companyId);
        fileMetadataQuery.setStringParameter('@employeeCode', employeeCode);
        fileMetadataQuery.setParameter('@title', Title);
        fileMetadataQuery.setStringParameter('@category', Category);
        fileMetadataQuery.setParameter('@uploadDate', uploadDate);
        fileMetadataQuery.setParameter('@pointer', newKey);
        fileMetadataQuery.setStringParameter('@uploadedBy', `${firstName} ${lastName}`);
        fileMetadataQuery.setParameter('@isPublishedToEmployee', '1');
        fileMetadataQuery.setParameter('@esignatureMetadataId', signatureRequestId);

        payload = {
            tenantId,
            queryName: fileMetadataQuery.name,
            query: fileMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const fileMetadataResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const updateEsignatureMetadataQuery = new ParameterizedQuery('updateEsignatureMetadataById', Queries.updateEsignatureMetadataById);
        updateEsignatureMetadataQuery.setParameter('@signatureStatusId', SignatureStatusID.Signed);
        updateEsignatureMetadataQuery.setParameter('@fileName', `${signatureRequestId}.pdf`);
        updateEsignatureMetadataQuery.setParameter('@fileMetadataId', fileMetadataResult.recordset[0].ID);
        updateEsignatureMetadataQuery.setParameter('@id', signatureRequestId);
        const updateEsignatureMetadataPayload = {
            tenantId,
            queryName: updateEsignatureMetadataQuery.name,
            query: updateEsignatureMetadataQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const signatureStatusQuery = new ParameterizedQuery('getSignatureStatusByStepNumber', Queries.getSignatureStatusByStepNumber);
        signatureStatusQuery.setParameter('@stepNumber', SignatureStatusStepNumber.Signed);
        const signatureStatusPayload = {
            tenantId,
            queryName: signatureStatusQuery.name,
            query: signatureStatusQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [signatureStatusResult]: any[] = await Promise.all([
            await utilService.invokeInternalService('queryExecutor', signatureStatusPayload, InvocationType.RequestResponse),
            await utilService.invokeInternalService('queryExecutor', updateEsignatureMetadataPayload, InvocationType.RequestResponse),
        ]);

        const { Name: name, Priority: priority, StepNumber: stepNumber } = signatureStatusResult.recordset[0];

        const response = {
            id: signatureRequestId,
            title: Title,
            fileName: `${signatureRequestId}.pdf`,
            uploadDate,
            esignDate: uploadDate,
            category: Category,
            isPrivate: false,
            isPublishedToEmployee: true,
            isOnboardingDocument: false,
            employeeId,
            employeeCode,
            employeeName: `${firstName} ${lastName}`,
            companyId,
            companyName,
            isSignedDocument: true,
            uploadedBy: `${firstName} ${lastName}`,
            isLegacyDocument: false,
            isEsignatureDocument: false,
            isHelloSignDocument: false,
            status: {
                name,
                priority,
                stepNumber,
                isProcessing: false,
            },
        };

        return response;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    } finally {
        await fs.unlink(`${tmpFileDir}/${fileName}`, (e) => {
            if (e) {
                console.log(`Unable to delete temp file: ${fileName}. Reason: ${JSON.stringify(e)}`);
            }
        });
        fs.rmdir(tmpFileDir, (e) => {
            if (e) {
                console.log(`Unable to delete temp directory: ${tmpFileDir}. Reason: ${JSON.stringify(e)}`);
            }
        });
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

/*
 * Checks that a collection of employee codes exist in the database.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string[]} employeeCodes: The list of employee codes to check for existance of a matching employee
 * @returns {Promise<any[]>}: Promise of a collection of employee metadata
 */
async function checkEmployeesExistenceByCodes(tenantId: string, companyId: string, employeeCodes: string[]): Promise<any[]> {
    console.info('esignature.service.checkEmployeesExistenceByCodes');

    try {
        const employeeCodesFilter: string = employeeCodes.map((code) => `'${code}'`).join(',');
        const query: ParameterizedQuery = new ParameterizedQuery('GetEmployeeByCompanyIdAndCode', Queries.getEmployeeByCompanyIdAndCode);
        query.setParameter('@companyId', companyId);
        query.setParameter('@employeeCodes', employeeCodesFilter);
        const payload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const employeeCodeResults: string[] = (result.recordset || []).map((res) => res.EmployeeCode);
        const differences: string[] = employeeCodes.filter((code) => !employeeCodeResults.includes(code));
        if (differences.length > 0) {
            throw errorService
                .getErrorResponse(50)
                .setDeveloperMessage(
                    `Employees with the following codes were not found under company ${companyId}: ${differences.join(',')}`,
                );
        }

        return result.recordset.map(({ FirstName, LastName, EmailAddress, EmployeeCode }) => ({
            firstName: FirstName,
            lastName: LastName,
            emailAddress: EmailAddress,
            employeeCode: EmployeeCode,
        }));
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates a specified onboarding and checks that it's status is valid for deletion.
 * @param {string} tenantId: The unique identifier for the tenant the onboarding belongs to.
 * @param {string} companyId: The unique identifier for the company the onboarding belongs to.
 * @param {string} onboardingId: The unique identifier for the specified onboarding
 */
async function validateOnboardingForDeletion(tenantId: string, companyId: string, onboardingId: string): Promise<void> {
    console.info('esignature.service.validateOnboardingForDeletion');
    try {
        await utilService.validateCompany(tenantId, companyId);
        const query: ParameterizedQuery = new ParameterizedQuery(
            'getIncompleteOnboardingsByCompanyIdAndKey',
            Queries.getIncompleteOnboardingsByCompanyIdAndKey,
        );
        query.setParameter('@companyId', companyId);
        query.setStringParameter('@id', onboardingId);
        const payload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`No incomplete onboarding with key ${onboardingId} could be found`);
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

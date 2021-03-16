import 'reflect-metadata'; // required by asure.auth dependency

import * as UUID from '@smallwins/validate/uuid';
import * as Yup from 'yup';
import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from './esignature.service';

import { Role } from '../../../api/models/Role';
import { IGatewayEventInput } from '../../../util.service';
import { Headers } from '../../models/headers';
import { EsignatureConfiguration } from './esignature.service';
import { SignatureRequestResponse } from './signature-requests/signatureRequestResponse';

const headerSchema = {
    authorization: { required: true, type: String },
};

const createSignUrlUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
    signatureId: { required: true, type: String },
};

const createEditUrlUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    templateId: { required: true, type: String },
};

const tenantResourceUriSchema = {
    tenantId: { required: true, type: UUID },
};

const companyResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
};

const companyDocumentResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    documentId: { required: true, type: String },
};

const employeeDocumentResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
    documentId: { required: true, type: String },
};

const employeeResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
};

const templateResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    templateId: { required: true, type: String },
};

const createEmbeddedTemplateValidationSchema = {
    file: { required: true, type: String },
    fileName: { required: true, type: String },
    signerRoles: { required: true, type: Array },
    ccRoles: { required: false, type: Array },
    customFields: { required: false, type: Array },
    category: { required: false, type: String },
    title: { required: true, type: String },
    message: { required: true, type: String },
};

const createEmbeddedTemplateSchema = Yup.object().shape({
    file: Yup.string().required(),
    fileName: Yup.string().required(),
    signerRoles: Yup.array()
        .min(1, 'You must provide at least one signer role.')
        .required(),
    ccRoles: Yup.array(),
    customFields: Yup.array().of(Yup.object()),
    category: Yup.string(),
    title: Yup.string().required(),
    message: Yup.string().required(),
});
const customFieldsSchema = Yup.object().shape({
    name: Yup.string().required(),
    type: Yup.string()
        .oneOf(['text', 'checkbox'], "The type field must be one of the following values: ['text', 'checkbox']")
        .required(),
});

// Save template metadata schemas
const saveTemplateMetadataValidationSchema = {
    fileName: { required: true, type: String },
    title: { required: true, type: String },
    category: { required: false, type: String },
    isOnboardingDocument: { required: false, type: Boolean },
};

const saveTemplateMetadataSchema = Yup.object().shape({
    fileName: Yup.string().required(),
    category: Yup.string(),
    title: Yup.string().required(),
    isOnboardingDocument: Yup.bool(),
});

//   Bulk Signature Request schemas
const batchSignatureRequestValidationSchema = {
    templateId: { required: true, type: String },
    subject: { required: false, type: String },
    message: { required: false, type: String },
    signatories: { required: true, type: Array },
    isSimpleSign: { required: true, type: Boolean },
};

const batchSignatureRequestSchema = Yup.object().shape({
    templateId: Yup.string().required(),
    subject: Yup.string(),
    message: Yup.string(),
    signatories: Yup.array()
        .min(1, 'You must provide at least one signatory')
        .max(250, 'You can only send 250 signatories at a time, consider batching your requests')
        .of(Yup.object())
        .required(),
    isSimpleSign: Yup.boolean().required(),
});

const signatorySchema = Yup.object().shape({
    employeeCode: Yup.string().required(),
    role: Yup.string().required(),
});

// Signature Request Billing schemas
const billingValidationSchema = {
    returnReport: { required: false, type: Boolean },
    targetEmail: { required: false, type: String },
};

const billingSchema = Yup.object().shape({
    returnReport: Yup.boolean(),
    targetEmail: Yup.string(),
});

// Onboarding Signature Request schemas
const onboardingSignatureRequestValidationSchema = {
    onboardingKey: { required: true, type: String },
    taskListId: { required: true, type: Number },
    emailAddress: { required: true, type: String },
    name: { required: true, type: String },
    employeeCode: { required: true, type: String },
};

const onboardingSignatureRequestSchema = Yup.object().shape({
    onboardingKey: Yup.string().required(),
    taskListId: Yup.number().required(),
    emailAddress: Yup.string().required(),
    name: Yup.string().required(),
    employeeCode: Yup.string().required(),
});

// Onboarding resource URI schema
const employeeOnboardingResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
    onboardingId: { required: true, type: UUID },
};

const onboardingResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    onboardingId: { required: true, type: UUID },
};

//  Configuration schemas:
const configurationValidationSchema = {
    op: { required: true, type: String },
};

const configurationSchema = Yup.object().shape({
    op: Yup.string()
        .matches(/^(add|remove|delete)$/, { excludeEmptyString: false })
        .required(),
});

// Upload Urls Request schemas
const generateDocumentUploadValidationSchema = {
    fileName: { required: true, type: String },
    title: { required: true, type: String },
    employeeId: { required: false, type: Number },
    isPrivate: { required: false, type: Boolean },
    documentId: { required: false, type: String },
    category: { required: false, type: String },
};

const generateDocumentUploadSchema = Yup.object().shape({
    fileName: Yup.string().required(),
    title: Yup.string().required(),
    employeeId: Yup.number(),
    isPrivate: Yup.bool(),
    documentId: Yup.string(),
    category: Yup.string(),
});

// Create Company Document schemas
const createCompanyDocumentValidationSchema = {
    file: { required: true, type: String },
    fileName: { required: true, type: String },
    title: { required: true, type: String },
    category: { required: false, type: String },
    isPublishedToEmployee: { required: true, type: Boolean },
    isOnboardingDocument: { required: false, type: Boolean },
};

const createCompanyDocumentSchema = Yup.object().shape({
    file: Yup.string().required(),
    fileName: Yup.string().required(),
    title: Yup.string().required(),
    category: Yup.string(),
    isPublishedToEmployee: Yup.bool().required(),
    isOnboardingDocument: Yup.bool(),
});

// Update signature request status schemas
const updateSignatureRequestStatusValidationSchema = {
    stepNumber: { required: true, type: Number },
};

const updateSignatureRequestStatusSchema = Yup.object().shape({
    stepNumber: Yup.number().required(),
});

// Create simple sign document schemas
const createSimpleSignDocumentValidationSchema = {
    signatureRequestId: { required: true, type: String },
    timeZone: { required: false, type: String },
};

const createSimpleSignDocumentSchema = Yup.object().shape({
    signatureRequestId: Yup.string().required(),
    timeZone: Yup.string(),
});

// Update Document schemas
const updateDocumentValidationSchema = {
    title: { required: false, type: String },
    fileObject: { required: false, type: Object },
};
const updateDocumentSchema = {
    title: Yup.string(),
    fileObject: Yup.object(),
};

const updateCompanyDocumentValidationSchema = {
    ...updateDocumentValidationSchema,
    category: { required: false, type: String },
    isPublishedToEmployee: { required: false, type: Boolean },
    isOnboardingDocument: { required: false, type: Boolean },
};
const updateCompanyDocumentSchema = Yup.object().shape({
    ...updateDocumentSchema,
    category: Yup.string(),
    isPublishedToEmployee: Yup.bool(),
    isOnboardingDocument: Yup.bool(),
});
const updateEmployeeDocumentValidationSchema = {
    title: { required: false, type: String },
    isPrivate: { required: false, type: Boolean },
    category: { required: false, type: String },
};
const updateEmployeeDocumentSchema = Yup.object().shape({
    title: Yup.string(),
    isPrivate: Yup.bool(),
    category: Yup.string(),
});

const fileObjectValidationSchema = {
    file: { required: false, type: String },
    fileName: { required: false, type: String },
};
const fileObjectSchema = Yup.object().shape({
    file: Yup.string().required(),
    fileName: Yup.string()
        .required()
        .test('file-name-has-extension', 'fileName must include a file extension.', (value) => value.includes('.')),
});

const roleQueryParameterSchema = Yup.object().shape({
    role: Yup.string().oneOf(['manager'], "The role query parameter must be one of the following values: ['manager']"),
});

const onboardingPreviewValidationSchema = {
    onboardingKey: { required: true, type: String },
};
const onboardingPreviewSchema = Yup.object().shape({
    onboardingKey: Yup.string().required(),
});

const saveOnboardingDocumentsValidationSchema = {
    taskListId: { required: true, type: Number },
};
const saveOnboardingDocumentsSchema = Yup.object().shape({
    taskListId: Yup.number().required(),
});

const updateCompanyEsignatureProductTierValidationSchema = {
    productTierId: { required: true, type: Number },
};
const updateCompanyEsignatureProductTierSchema = Yup.object().shape({
    productTierId: Yup.number().required(),
});

/**
 * Creates a new template of a document to be e-signed
 */

export const createTemplate = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('esignature.handler.createTemplate');

    const { tenantId, companyId } = event.pathParameters;

    // TODO: We will implement security/authorization in MJ-1815.
    // await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeCompanyDocumentList', 'CanRead');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    await utilService.requirePayload(requestBody);
    utilService.validateAndThrow(requestBody, createEmbeddedTemplateValidationSchema);
    utilService.checkAdditionalProperties(createEmbeddedTemplateValidationSchema, requestBody, 'Create Embedded Template');

    await utilService.validateRequestBody(createEmbeddedTemplateSchema, requestBody);
    if (requestBody.customFields) {
        await utilService.validateCollection(customFieldsSchema, requestBody.customFields);
    }

    const { email } = securityContext.principal;

    return await esignatureService.createTemplate(tenantId, companyId, requestBody, email);
});

/**
 * Saves a template's metadata
 */
export const saveTemplateMetadata = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.saveTemplateMetadata');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, templateResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, saveTemplateMetadataValidationSchema);
        utilService.checkAdditionalProperties(saveTemplateMetadataValidationSchema, requestBody, 'Save Template Metadata');
        await utilService.validateRequestBody(saveTemplateMetadataSchema, requestBody);

        const { tenantId, companyId, templateId } = event.pathParameters;
        const { email } = securityContext.principal;

        return await esignatureService.saveTemplateMetadata(tenantId, companyId, templateId, email, requestBody);
    },
);

export const createBatchSignatureRequest = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createBatchSignatureRequest');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, batchSignatureRequestValidationSchema);
        utilService.checkAdditionalProperties(batchSignatureRequestValidationSchema, requestBody, 'Signature Request');

        await utilService.validateRequestBody(batchSignatureRequestSchema, requestBody);
        await utilService.validateCollection(signatorySchema, requestBody.signatories);

        const response: SignatureRequestResponse[] = await esignatureService.createBatchSignatureRequest(
            event.pathParameters,
            requestBody,
            {},
            securityContext.principal.email,
            event.headers.authorization,
        );

        return {
            statusCode: 201,
            body: response,
        };
    },
);

export const generateBillingReport = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.generateBillingReport');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);

        const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
            return role === Role.globalAdmin;
        });

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        // default the request body if nothing was passed or default optional params if only some were passed
        requestBody = requestBody || {};
        requestBody = {
            returnReport: requestBody.returnReport || false,
            targetEmail: requestBody.targetEmail || '',
        };

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, billingValidationSchema);
        utilService.checkAdditionalProperties(billingValidationSchema, requestBody, 'Billing Options');
        await utilService.validateRequestBody(billingSchema, requestBody);

        return await esignatureService.generateBillingReport(requestBody);
    },
);

export const generateInternalBillingReport = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.generateInternalBillingReport');
        return await esignatureService.generateBillingReport({ returnReport: false, targetEmail: '' });
    },
});

/**
 * Lists all templates under a given company
 */
export const listTemplates = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listTemplates');

    const { tenantId, companyId } = event.pathParameters;

    // TODO: We will implement security/authorization in MJ-1815.
    // await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeCompanyDocumentList', 'CanRead');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const {
        requestContext: { domainName, path },
    } = event;

    return await esignatureService.listTemplates(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 * Generates a sign url for a specific employee
 */
export const createSignUrl = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: async ({ securityContext, event }: IGatewayEventInput) => {
        console.info('esignature.handler.createSignUrl');

        const {
            headers: { origin = '' },
            requestContext: { stage },
        } = event;
        if (stage === 'production' && !new RegExp(/.*\.evolutionadvancedhr.com$/g).test(origin)) {
            console.log(`Not authorized on origin: ${origin}`);
            throw errorService.getErrorResponse(11);
        }

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.pathParameters, createSignUrlUriSchema);

        const { tenantId, companyId, employeeId, signatureId } = event.pathParameters;

        return await esignatureService.createSignUrl(tenantId, companyId, employeeId, signatureId);
    },
});

/**
 * Generates an edit url for a specific e-signature template
 */
export const createEditUrl = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.createEditUrl');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.pathParameters, createEditUrlUriSchema);

    const { tenantId, companyId, templateId } = event.pathParameters;

    return await esignatureService.createEditUrl(tenantId, companyId, templateId);
});

/**
 * Generates an email to remind employee to sign documents
 * NOTE: If endpoint is tested through postman url will be undefined in the email
 */
export const sendReminderEmail = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.sendReminderEmail');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.pathParameters, employeeDocumentResourceUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.hrManager ||
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const accessToken = event.headers.authorization.replace(/Bearer /i, '');
    const emailAddress: string = securityContext.principal.email;
    const signInUrl = event.headers.origin;

    return await esignatureService.sendReminderEmail(event.pathParameters, accessToken, emailAddress, signInUrl);
});

/**
 *  List documents uploaded for E-Signing
 */
export const listDocuments = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listDocuments');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const {
        requestContext: { domainName, path },
    } = event;
    const { tenantId, companyId } = event.pathParameters;

    const configuration: EsignatureConfiguration = await esignatureService.getConfigurationData(tenantId, companyId);

    return await esignatureService.listDocuments(tenantId, companyId, event.queryStringParameters, domainName, path, false, configuration);
});

/**
 *  List all signature requests under a specific company
 */
export const listCompanySignatureRequests = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listCompanySignatureRequests');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId, companyId } = event.pathParameters;
    const isManager: boolean = securityContext.roleMemberships.some((role) => role === Role.hrManager);
    const emailAddress: string = securityContext.principal.email;
    const {
        requestContext: { domainName, path },
    } = event;

    return await esignatureService.listCompanySignatureRequests(
        tenantId,
        companyId,
        emailAddress,
        isManager,
        event.queryStringParameters,
        domainName,
        path,
    );
});

/**
 * List each document category among an employee's documents by company
 */
export const listEmployeeDocumentCategoriesByCompany = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event }: IGatewayEventInput) => {
        console.info('esignature.handler.listEmployeeDocumentCategoriesByCompany');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        const { tenantId, companyId } = event.pathParameters;
        const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
            return (
                role === Role.hrManager ||
                role === Role.globalAdmin ||
                role === Role.serviceBureauAdmin ||
                role === Role.superAdmin ||
                role === Role.hrAdmin ||
                role === Role.hrRestrictedAdmin
            );
        });

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        const isManager: boolean = securityContext.roleMemberships.some((role) => role === Role.hrManager);
        const emailAddress: string = securityContext.principal.email;
        const {
            requestContext: { domainName, path },
        } = event;

        const results = await esignatureService.listEmployeeDocumentCategoriesByCompany(
            tenantId,
            companyId,
            event.queryStringParameters,
            domainName,
            path,
            isManager,
            emailAddress,
        );
        return results.count === 0 ? { statusCode: 204, headers: new Headers() } : results;
    },
);

/**
 * List each document category among an employee's documents by employee
 */
export const listEmployeeDocumentCategories = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listEmployeeDocumentCategories');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId, companyId, employeeId } = event.pathParameters;

    const {
        requestContext: { domainName, path },
    } = event;

    const isManagerOrAbove: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.hrManager ||
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    let results: any;
    if (isManagerOrAbove) {
        const isManager: boolean = securityContext.roleMemberships.some((role) => role === Role.hrManager);
        const emailAddress: string = securityContext.principal.email;
        results = await esignatureService.listEmployeeDocumentCategoriesByCompany(
            tenantId,
            companyId,
            event.queryStringParameters,
            domainName,
            path,
            isManager,
            emailAddress,
        );
    } else {
        results = await esignatureService.listEmployeeDocumentCategories(
            tenantId,
            companyId,
            employeeId,
            event.queryStringParameters,
            domainName,
            path,
            isManagerOrAbove,
            securityContext.principal.email,
        );
    }
    return results.count === 0 ? { statusCode: 204, headers: new Headers() } : results;
});

/**
 * List each document category among a company's documents
 */
export const listCompanyDocumentCategories = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listCompanyDocumentCategories');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId, companyId } = event.pathParameters;
    const {
        requestContext: { domainName, path },
    } = event;

    const results = await esignatureService.listCompanyDocumentCategories(
        tenantId,
        companyId,
        event.queryStringParameters,
        domainName,
        path,
    );
    return results.count === 0 ? { statusCode: 204, headers: new Headers() } : results;
});

/**
 * Handles event callbacks from HelloSign
 */
export const eventCallbackDelegate = async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('esignature.handler.eventCallback');

    const hellosignEvent = JSON.parse(new Buffer(event.body, 'base64').toString('ascii').match(/\{(.*)\}/g)[0]);
    if (hellosignEvent) {
        switch (hellosignEvent.event.event_type) {
            case 'callback_test':
                console.info('callback test');
                break;
            case 'signature_request_downloadable':
                console.info('signature request downloadable');
                await utilService.invokeInternalService('uploadSignedDocument', hellosignEvent, utilService.InvocationType.Event);
                break;
            default:
        }
        return 'Hello API Event Received';
    }
};

export const eventCallback = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: eventCallbackDelegate,
});

/**
 * Performs the necessary steps for onboarding
 */
export const onboarding = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.onboarding');

        const {
            headers: { origin = '' },
            requestContext: { stage },
        } = event;
        if (stage === 'production' && !new RegExp(/.*\.evolutionadvancedhr.com$/g).test(origin)) {
            console.log(`Not authorized on origin: ${origin}`);
            throw errorService.getErrorResponse(11);
        }

        console.log(`request body: ${JSON.stringify(requestBody)}`);
        console.log(`event: ${JSON.stringify(event)}`);

        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);

        utilService.validateAndThrow(requestBody, onboardingSignatureRequestValidationSchema);

        utilService.checkAdditionalProperties(onboardingSignatureRequestValidationSchema, requestBody, 'Onboarding Signature Request');

        await utilService.validateRequestBody(onboardingSignatureRequestSchema, requestBody);

        const { tenantId, companyId } = event.pathParameters;

        const result = await esignatureService.onboarding(tenantId, companyId, requestBody);
        return result;
    },
});

/**
 * Remove signed onboarding documents from the database if the onboarding they're associated with is incomplete.
 */
export const deleteOnboardingDocuments = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.deleteOnboardingDocuments');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, onboardingResourceUriSchema);

        const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
            console.log(`User Role: ${role}`);
            return role === Role.globalAdmin;
        });

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        const { tenantId, companyId, onboardingId } = event.pathParameters;

        return await esignatureService.deleteOnboardingDocuments(tenantId, companyId, onboardingId);
    },
);

/**
 *  Adds/Remove e-signature functionality for a specified company within a tenant
 */
export const configure = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('esignature.handler.configure');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);

    // payload validation & checks:
    await utilService.requirePayload(requestBody);
    utilService.validateAndThrow(requestBody, configurationValidationSchema);
    utilService.checkAdditionalProperties(configurationValidationSchema, requestBody, 'E-Signature Configuration');
    await utilService.validateRequestBody(configurationSchema, requestBody);

    const { tenantId, companyId } = event.pathParameters;
    const accessToken = event.headers.authorization.replace(/Bearer /i, '');

    return await esignatureService.configure(tenantId, companyId, accessToken, requestBody);
});

/**
 *  List all legacy and Esigned documents for a given tenant
 */
export const listEmployeeDocumentsByTenant = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listCompanySignatureRequests');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId } = event.pathParameters;
    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return role === Role.globalAdmin || role === Role.serviceBureauAdmin || role === Role.superAdmin;
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const emailAddress: string = securityContext.principal.email;

    const {
        requestContext: { domainName, path },
    } = event;

    return await esignatureService.listEmployeeDocumentsByTenant(tenantId, event.queryStringParameters, domainName, path, emailAddress);
});

/**
 *  List all legacy and Esigned documents for given company within a tenant
 */
export const listEmployeeDocumentsByCompany = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listCompanySignatureRequests');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId, companyId } = event.pathParameters;
    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.hrManager ||
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    let specifiedRole;
    if (event.queryStringParameters) {
        await utilService.validateRequestBody(roleQueryParameterSchema, event.queryStringParameters);
        specifiedRole = event.queryStringParameters.role;
    }

    const isManager: boolean = securityContext.roleMemberships.some((role) => role === Role.hrManager) && specifiedRole === 'manager';
    const emailAddress: string = securityContext.principal.email;
    const {
        requestContext: { domainName, path },
    } = event;

    return await esignatureService.listEmployeeDocumentsByCompany(
        tenantId,
        companyId,
        event.queryStringParameters,
        domainName,
        path,
        isManager,
        emailAddress,
    );
});

/**
 *  List all legacy and Esigned documents for given employee
 */
export const listEmployeeDocuments = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listCompanySignatureRequests');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId, companyId, employeeId } = event.pathParameters;

    const {
        requestContext: { domainName, path },
    } = event;

    const includePrivateDocs: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.hrManager ||
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    return await esignatureService.listEmployeeDocuments(
        tenantId,
        companyId,
        employeeId,
        event.queryStringParameters,
        domainName,
        path,
        includePrivateDocs,
        securityContext.principal.email,
    );
});

export const getOnboardingDocumentPreview = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.getOnboardingDocumentPreview');

        utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, onboardingPreviewValidationSchema);
        utilService.checkAdditionalProperties(onboardingPreviewValidationSchema, requestBody, 'Get Onboarding Document Preview');
        await utilService.validateRequestBody(onboardingPreviewSchema, requestBody);

        const { tenantId, documentId } = event.pathParameters;

        return await esignatureService.getOnboardingDocumentPreview(tenantId, documentId, requestBody);
    },
});

export const saveOnboardingDocuments = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.saveOnboardingDocuments');

        utilService.validateAndThrow(event.pathParameters, employeeOnboardingResourceUriSchema);

        const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
            return role === Role.globalAdmin || role === Role.serviceBureauAdmin || role === Role.superAdmin || role === Role.hrAdmin;
        });

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, saveOnboardingDocumentsValidationSchema);
        utilService.checkAdditionalProperties(saveOnboardingDocumentsValidationSchema, requestBody, 'Save Onboarding Documents');
        await utilService.validateRequestBody(saveOnboardingDocumentsSchema, requestBody);

        const { tenantId, companyId, employeeId, onboardingId } = event.pathParameters;

        return await esignatureService.saveOnboardingDocuments(tenantId, companyId, employeeId, onboardingId, requestBody);
    },
);

/**
 * Generates a preview of an employee's saved document under a tenant
 */
export const getDocumentPreviewByTenant = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.getDocumentPreviewByTenant');

    utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return role === Role.globalAdmin || role === Role.serviceBureauAdmin || role === Role.superAdmin;
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const { tenantId, documentId } = event.pathParameters;

    return await esignatureService.getDocumentPreview(tenantId, documentId);
});

/**
 * Generates a preview of an employee's saved document under a company
 */
export const getDocumentPreviewByCompany = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.getDocumentPreviewByCompany');

    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.hrManager ||
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const { tenantId, documentId } = event.pathParameters;

    return await esignatureService.getDocumentPreview(tenantId, documentId);
});

/**
 * Generates a preview of an employee's saved document
 */
export const getDocumentPreview = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.getDocumentPreview');

    utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);

    const { tenantId, documentId } = event.pathParameters;

    return await esignatureService.getDocumentPreview(tenantId, documentId);
});

/**
 * Persists an upload document metadata
 */
export const saveUploadedDocumentMetadata = async (event: any, context: any, callback: any) => {
    console.info('esignature.handler.saveUploadedDocumentMetadata');

    console.info(`Received Event: ${JSON.stringify(event)}`);

    const eventRecord: any = event.Records[0];

    const {
        eventTime: uploadTime,
        s3: {
            object: { key: uploadedItemKey },
        },
    } = eventRecord;
    await esignatureService.saveUploadedDocumentMetadata(decodeURI(uploadedItemKey), uploadTime);
};

/**
 *  Generates an S3 presigned url for document uploads
 */
export const generateDocumentUploadUrl = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.generateDocumentUploadUrl');

        const { tenantId, companyId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, generateDocumentUploadValidationSchema);
        utilService.checkAdditionalProperties(generateDocumentUploadValidationSchema, requestBody, 'Generate Document Upload Url');
        await utilService.validateRequestBody(generateDocumentUploadSchema, requestBody);

        const { givenName: firstname, surname } = securityContext.principal;

        const invokingUser = `${firstname} ${surname}`;
        return await esignatureService.generateDocumentUploadUrl(tenantId, companyId, invokingUser, requestBody);
    },
);

/**
 * Creates a specified document record for a company
 */
export const createCompanyDocument = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createCompanyDocument');

        const { tenantId, companyId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, createCompanyDocumentValidationSchema);
        utilService.checkAdditionalProperties(createCompanyDocumentValidationSchema, requestBody, 'Create Company Document');
        await utilService.validateRequestBody(createCompanyDocumentSchema, requestBody);

        const { givenName, surname } = securityContext.principal;

        return {
            statusCode: 201,
            body: await esignatureService.createCompanyDocument(tenantId, companyId, requestBody, givenName, surname),
        };
    },
);

/**
 * Updates the status of a signature request (EsignatureMetadata).
 */
export const updateSignatureRequestStatus = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.updateSignatureRequestStatus');

        const { tenantId, companyId, employeeId, documentId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, updateSignatureRequestStatusValidationSchema);
        utilService.checkAdditionalProperties(updateSignatureRequestStatusValidationSchema, requestBody, 'Update Esignature Metadata');
        await utilService.validateRequestBody(updateSignatureRequestStatusSchema, requestBody);

        return await esignatureService.updateSignatureRequestStatus(tenantId, companyId, employeeId, documentId, requestBody);
    },
);

/**
 * Updates a specified document record for a company
 */
export const updateCompanyDocument = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.updateCompanyDocument');

        const { tenantId, companyId, documentId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, updateCompanyDocumentValidationSchema);
        utilService.checkAdditionalProperties(updateCompanyDocumentValidationSchema, requestBody, 'Update Company Document');
        await utilService.validateRequestBody(updateCompanyDocumentSchema, requestBody);
        if (requestBody.fileObject) {
            await utilService.requirePayload(requestBody.fileObject);
            utilService.validateAndThrow(requestBody.fileObject, fileObjectValidationSchema);
            utilService.checkAdditionalProperties(fileObjectValidationSchema, requestBody.fileObject, 'File Object');
            await utilService.validateRequestBody(fileObjectSchema, requestBody.fileObject);
        }

        return await esignatureService.updateCompanyDocument(tenantId, companyId, documentId, requestBody);
    },
);

/**
 * Updates a specified document record for a company
 */
export const updateEmployeeDocument = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.updateEmployeeDocument');

        const { tenantId, companyId, employeeId, documentId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);

        const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
            return (
                role === Role.hrManager ||
                role === Role.globalAdmin ||
                role === Role.serviceBureauAdmin ||
                role === Role.superAdmin ||
                role === Role.hrAdmin ||
                role === Role.hrRestrictedAdmin
            );
        });

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, updateEmployeeDocumentValidationSchema);
        utilService.checkAdditionalProperties(updateEmployeeDocumentValidationSchema, requestBody, 'Update Employee Document');
        await utilService.validateRequestBody(updateEmployeeDocumentSchema, requestBody);

        const { email } = securityContext.principal;

        return await esignatureService.updateEmployeeDocument(
            tenantId,
            companyId,
            employeeId,
            documentId,
            requestBody,
            securityContext.roleMemberships,
            email,
        );
    },
);

/**
 * Deletes a specified document record for a company
 */
export const deleteCompanyDocument = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.deleteCompanyDocument');

    const { tenantId, companyId, documentId } = event.pathParameters;

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyDocumentResourceUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const { email } = securityContext.principal;

    return await esignatureService.deleteCompanyDocument(tenantId, companyId, documentId, email);
});

/**
 * Deletes a specified document record for an employee
 */
export const deleteEmployeeDocument = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.deleteEmployeeDocument');

    const { tenantId, companyId, employeeId, documentId } = event.pathParameters;

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, employeeDocumentResourceUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const { email } = securityContext.principal;

    return await esignatureService.deleteEmployeeDocument(
        tenantId,
        companyId,
        employeeId,
        documentId,
        email,
        securityContext.roleMemberships,
    );
});

/**
 * Creates a signed version of a simple sign document for an employee
 */
export const createSimpleSignDocument = utilService.gatewayEventHandlerV2(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createSimpleSignDocument');

        const { tenantId, companyId, employeeId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, createSimpleSignDocumentValidationSchema);
        utilService.checkAdditionalProperties(createSimpleSignDocumentValidationSchema, requestBody, 'Create Simple Sign Document');
        await utilService.validateRequestBody(createSimpleSignDocumentSchema, requestBody);

        return await esignatureService.createSimpleSignDocument(
            tenantId,
            companyId,
            requestBody,
            event.requestContext.identity.sourceIp,
            employeeId,
        );
    },
);

/**
 * Creates a signed version of an onboarding simple sign document for an employee
 */
export const createOnboardingSimpleSignDocument = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createOnboardingSimpleSignDocument');

        const { tenantId, companyId, onboardingId } = event.pathParameters;

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.pathParameters, onboardingResourceUriSchema);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, createSimpleSignDocumentValidationSchema);
        utilService.checkAdditionalProperties(
            createSimpleSignDocumentValidationSchema,
            requestBody,
            'Create Onboarding Simple Sign Document',
        );
        await utilService.validateRequestBody(createSimpleSignDocumentSchema, requestBody);

        return await esignatureService.createSimpleSignDocument(
            tenantId,
            companyId,
            requestBody,
            event.requestContext.identity.sourceIp,
            undefined,
            onboardingId,
        );
    },
});

/**
 * Returns all e-signature data related to a tenant.
 */
export const getTenantEsignatureData = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.getTenantEsignatureData');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId } = event.pathParameters;
    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return (
            role === Role.globalAdmin ||
            role === Role.serviceBureauAdmin ||
            role === Role.superAdmin ||
            role === Role.hrAdmin ||
            role === Role.hrRestrictedAdmin
        );
    });

    if (!isAuthorized) {
        throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    return await esignatureService.getTenantEsignatureData(tenantId);
});

/**
 * Updates the e-signature product tier for a company.
 */
export const updateEsignatureProductTier = utilService.gatewayEventHandlerV2(
    async ({ securityContext, requestBody, event }: IGatewayEventInput) => {
        console.info('esignature.handler.updateEsignatureProductTier');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, updateCompanyEsignatureProductTierValidationSchema);
        utilService.checkAdditionalProperties(
            updateCompanyEsignatureProductTierValidationSchema,
            requestBody,
            'Update Company Esignature Product Tier',
        );
        await utilService.validateRequestBody(updateCompanyEsignatureProductTierSchema, requestBody);

        const { tenantId, companyId } = event.pathParameters;
        const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
            return (
                role === Role.globalAdmin ||
                role === Role.serviceBureauAdmin ||
                role === Role.superAdmin ||
                role === Role.hrAdmin ||
                role === Role.hrRestrictedAdmin
            );
        });

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        const { email } = securityContext.principal;

        return await esignatureService.updateEsignatureProductTier(tenantId, companyId, email, requestBody);
    },
);

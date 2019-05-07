import * as UUID from '@smallwins/validate/uuid';
import * as Yup from 'yup';
import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from './esignature.service';

import { IGatewayEventInput } from '../../../util.service';

const headerSchema = {
    authorization: { required: true, type: String },
};

const createSignUrlUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
    signatureId: { required: true, type: String },
};

const companyResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
};

const createEmbeddedTemplateValidationSchema = {
    file: { required: true, type: String },
    fileName: { required: true, type: String },
    signerRoles: { required: true, type: Array },
    ccRoles: { required: false, type: Array },
    customFields: { required: false, type: Array },
};

const createEmbeddedTemplateSchema = Yup.object().shape({
    file: Yup.string().required(),
    fileName: Yup.string().required(),
    signerRoles: Yup.array()
        .min(1, 'You must provide at least one signer role.')
        .required(),
    ccRoles: Yup.array(),
    customFields: Yup.array().of(Yup.object()),
});
const customFieldsSchema = Yup.object().shape({
    name: Yup.string().required(),
    type: Yup.string()
        .oneOf(['text', 'checkbox'], "The type field must be one of the following values: ['text', 'checkbox']")
        .required(),
});

//   Bulk Signature Request schemas
const bulkSignatureRequestValidationSchema = {
    templateId: { required: true, type: String },
    subject: { required: false, type: String },
    message: { required: false, type: String },
    signatories: { required: true, type: Array },
};

const bulkSignatureRequestSchema = Yup.object().shape({
    templateId: Yup.string().required(),
    subject: Yup.string(),
    message: Yup.string(),
    signatories: Yup.array()
        .min(1, 'You must provide at least one signatory')
        .max(250, 'You can only send 250 signatories at a time, consider batching your requests')
        .of(Yup.object())
        .required(),
});

const signatorySchema = Yup.object().shape({
    emailAddress: Yup.string().required(),
    name: Yup.string().required(),
    role: Yup.string().required(),
});

// Signature Request schemas
const signatureRequestValidationSchema = {
    templateId: { required: true, type: String },
    subject: { required: false, type: String },
    message: { required: false, type: String },
    role: { required: true, type: String },
};

const signatureRequestSchema = Yup.object().shape({
    templateId: Yup.string().required(),
    subject: Yup.string(),
    message: Yup.string(),
    role: Yup.string().required(),
});

// Onboarding Signature Request schemas
const onboardingSignatureRequestValidationSchema = {
    onboardingKey: { required: true, type: String },
    taskListId: { required: true, type: Number },
    emailAddress: { required: true, type: String },
    name: { required: true, type: String },
};

const onboardingSignatureRequestSchema = Yup.object().shape({
    onboardingKey: Yup.string().required(),
    taskListId: Yup.number().required(),
    emailAddress: Yup.string().required(),
    name: Yup.string().required(),
});

//  Configuration schemas:
const configurationValidationSchema = {
    op: { required: true, type: String },
};

const configurationSchema = Yup.object().shape({
    op: Yup.string()
        .matches(/^(add|remove)$/, { excludeEmptyString: false })
        .required(),
});

/**
 * Creates a new template of a document to be e-signed
 */
export const createTemplate = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

    return await esignatureService.createTemplate(tenantId, companyId, requestBody);
});

export const createBulkSignatureRequest = utilService.gatewayEventHandler(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createBulkSignatureRequest');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, bulkSignatureRequestValidationSchema);
        utilService.checkAdditionalProperties(bulkSignatureRequestValidationSchema, requestBody, 'Signature Request');

        await utilService.validateRequestBody(bulkSignatureRequestSchema, requestBody);
        await utilService.validateCollection(signatorySchema, requestBody.signatories);

        const { tenantId, companyId } = event.pathParameters;

        return await esignatureService.createBulkSignatureRequest(tenantId, companyId, requestBody);
    },
);

export const createSignatureRequest = utilService.gatewayEventHandler(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createSignatureRequest');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, signatureRequestValidationSchema);
        utilService.checkAdditionalProperties(signatureRequestValidationSchema, requestBody, 'Signature Request');
        await utilService.validateRequestBody(signatureRequestSchema, requestBody);

        const { tenantId, companyId, employeeId } = event.pathParameters;

        return await esignatureService.createSignatureRequest(tenantId, companyId, employeeId, requestBody);
    },
);

/**
 * Lists all templates under a given company
 */
export const listTemplates = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listTemplates');

    const { tenantId, companyId } = event.pathParameters;

    // TODO: We will implement security/authorization in MJ-1815.
    // await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeCompanyDocumentList', 'CanRead');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    return await esignatureService.listTemplates(tenantId, companyId, event.queryStringParameters);
});

/**
 * Generates a sign url for a specific employee
 */
export const createSignUrl = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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
});

/**
 *  List documents uploaded for E-Signing
 */
export const listDocuments = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listDocuments');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const {
        requestContext: { domainName, path },
    } = event;
    const { tenantId, companyId } = event.pathParameters;

    return await esignatureService.listDocuments(tenantId, companyId, event.queryStringParameters, domainName, path);
});

/**
 *  List all signature requests under a specific company
 */
export const listCompanySignatureRequests = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.listCompanySignatureRequests');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const { tenantId, companyId } = event.pathParameters;

    return await esignatureService.listCompanySignatureRequests(tenantId, companyId, event.queryStringParameters);
});

/**
 * Handles event callbacks from HelloSign
 */
export const eventCallback = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('esignature.handler.eventCallback');

    const hellosignEvent = JSON.parse(new Buffer(event.body, 'base64').toString('ascii').match(/\{(.*)\}/g)[0]);
    if (hellosignEvent) {
        switch (hellosignEvent.event.event_type) {
            case 'callback_test':
                console.info('callback test');
                return 'Hello API Event Received';
            case 'signature_request_downloadable':
                console.info('signature request downloadable');
                await utilService.invokeInternalService('uploadSignedDocument', hellosignEvent, utilService.InvocationType.Event);
                return;
            default:
        }
    }
});

/**
 * Performs the necessary steps for onboarding
 */
export const onboarding = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('esignature.handler.onboarding');

    const {
        headers: { origin = '' },
        requestContext: { stage },
    } = event;
    if (stage === 'production' && !new RegExp(/.*\.evolutionadvancedhr.com$/g).test(origin)) {
        console.log(`Not authorized on origin: ${origin}`);
        throw errorService.getErrorResponse(11);
    }

    utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    await utilService.requirePayload(requestBody);
    utilService.validateAndThrow(requestBody, onboardingSignatureRequestValidationSchema);
    utilService.checkAdditionalProperties(onboardingSignatureRequestValidationSchema, requestBody, 'Onboarding Signature Request');
    await utilService.validateRequestBody(onboardingSignatureRequestSchema, requestBody);

    const { tenantId, companyId } = event.pathParameters;

    return await esignatureService.onboarding(tenantId, companyId, requestBody);
});

/**
 *  Adds/Remove e-signature functionality for a specified company within a tenant
 */
export const configure = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

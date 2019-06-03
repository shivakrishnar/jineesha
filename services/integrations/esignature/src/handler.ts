import * as UUID from '@smallwins/validate/uuid';
import * as Yup from 'yup';
import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from './esignature.service';

import { Role } from '../../../api/models/Role';
import { IGatewayEventInput } from '../../../util.service';

import * as thundra from '@thundra/core';

const thundraWrapper = thundra({
    apiKey: configService.lambdaPerfMonitorApiKey(),
});

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
    category: { required: true, type: String },
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
    category: Yup.string().required(),
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
    category: { required: true, type: String },
};

const saveTemplateMetadataSchema = Yup.object().shape({
    fileName: Yup.string().required(),
    category: Yup.string().required(),
    title: Yup.string().required(),
});

//   Bulk Signature Request schemas
const bulkSignatureRequestValidationSchema = {
    templateId: { required: true, type: String },
    subject: { required: false, type: String },
    message: { required: false, type: String },
    signatories: { required: true, type: Array },
    employeeCodes: { required: true, type: Array },
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
    employeeCodes: Yup.array()
        .min(1, 'You must provide at least one employee code')
        .of(Yup.string())
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
    employeeCode: { required: true, type: String },
};

const signatureRequestSchema = Yup.object().shape({
    templateId: Yup.string().required(),
    subject: Yup.string(),
    message: Yup.string(),
    role: Yup.string().required(),
    employeeCode: Yup.string().required(),
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

//  Configuration schemas:
const configurationValidationSchema = {
    op: { required: true, type: String },
};

const configurationSchema = Yup.object().shape({
    op: Yup.string()
        .matches(/^(add|remove|delete)$/, { excludeEmptyString: false })
        .required(),
});

/**
 * Creates a new template of a document to be e-signed
 */

export const createTemplate = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

        return await esignatureService.createTemplate(tenantId, companyId, requestBody, email, securityContext.payrollApiCredentials);
    }),
);

/**
 * Saves a template's metadata
 */
export const saveTemplateMetadata = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

        return await esignatureService.saveTemplateMetadata(
            tenantId,
            companyId,
            templateId,
            email,
            requestBody,
            securityContext.payrollApiCredentials,
        );
    }),
);

export const createBulkSignatureRequest = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

        return await esignatureService.createBulkSignatureRequest(
            tenantId,
            companyId,
            requestBody,
            {},
            securityContext.payrollApiCredentials,
        );
    }),
);

export const createSignatureRequest = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createSignatureRequest');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        await utilService.requirePayload(requestBody);
        utilService.validateAndThrow(requestBody, signatureRequestValidationSchema);
        utilService.checkAdditionalProperties(signatureRequestValidationSchema, requestBody, 'Signature Request');
        await utilService.validateRequestBody(signatureRequestSchema, requestBody);

        const { tenantId, companyId, employeeId } = event.pathParameters;

        return await esignatureService.createSignatureRequest(
            tenantId,
            companyId,
            employeeId,
            requestBody,
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 * Lists all templates under a given company
 */
export const listTemplates = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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

        return await esignatureService.listTemplates(
            tenantId,
            companyId,
            event.queryStringParameters,
            domainName,
            path,
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 * Generates a sign url for a specific employee
 */
export const createSignUrl = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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

        return await esignatureService.createSignUrl(tenantId, companyId, employeeId, signatureId, undefined);
    }),
);

/**
 * Generates an edit url for a specific e-signature template
 */
export const createEditUrl = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
        console.info('esignature.handler.createEditUrl');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.pathParameters, createEditUrlUriSchema);

        const { tenantId, companyId, templateId } = event.pathParameters;

        return await esignatureService.createEditUrl(tenantId, companyId, templateId, securityContext.payrollApiCredentials);
    }),
);

/**
 *  List documents uploaded for E-Signing
 */
export const listDocuments = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
        console.info('esignature.handler.listDocuments');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        const {
            requestContext: { domainName, path },
        } = event;
        const { tenantId, companyId } = event.pathParameters;

        return await esignatureService.listDocuments(
            tenantId,
            companyId,
            event.queryStringParameters,
            domainName,
            path,
            false,
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 *  List all signature requests under a specific company
 */
export const listCompanySignatureRequests = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 * Handles event callbacks from HelloSign
 */
export const eventCallback = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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
    }),
);

/**
 * Performs the necessary steps for onboarding
 */
export const onboarding = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

        const result = await esignatureService.onboarding(tenantId, companyId, requestBody, undefined);
        return result;
    }),
);

/**
 *  Adds/Remove e-signature functionality for a specified company within a tenant
 */
export const configure = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
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

        return await esignatureService.configure(tenantId, companyId, accessToken, requestBody, securityContext.payrollApiCredentials);
    }),
);

/**
 *  List all legacy and Esigned documents for a given tenant
 */
export const listEmployeeDocumentsByTenant = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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
            errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        const emailAddress: string = securityContext.principal.email;

        const {
            requestContext: { domainName, path },
        } = event;

        return await esignatureService.listEmployeeDocumentsByTenant(
            tenantId,
            event.queryStringParameters,
            domainName,
            path,
            emailAddress,
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 *  List all legacy and Esigned documents for given company within a tenant
 */
export const listEmployeeDocumentsByCompany = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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
            errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
        }

        const isManager: boolean = securityContext.roleMemberships.some((role) => role === Role.hrManager);
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
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 *  List all legacy and Esigned documents for given employee
 */
export const listEmployeeDocuments = thundraWrapper(
    utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
        console.info('esignature.handler.listCompanySignatureRequests');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        const { tenantId, employeeId } = event.pathParameters;

        const {
            requestContext: { domainName, path },
        } = event;

        return await esignatureService.listEmployeeDocuments(
            tenantId,
            employeeId,
            event.queryStringParameters,
            domainName,
            path,
            securityContext.payrollApiCredentials,
        );
    }),
);

/**
 * Generates a preview of an employee's saved document under a tenant
 */
export const getDocumentPreviewByTenant = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.getDocumentPreviewByTenant');

    utilService.validateAndThrow(event.pathParameters, tenantResourceUriSchema);

    const isAuthorized: boolean = securityContext.roleMemberships.some((role) => {
        return role === Role.globalAdmin || role === Role.serviceBureauAdmin || role === Role.superAdmin;
    });

    if (!isAuthorized) {
        errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const { tenantId, documentId } = event.pathParameters;

    return await esignatureService.getDocumentPreview(tenantId, documentId);
});

/**
 * Generates a preview of an employee's saved document under a company
 */
export const getDocumentPreviewByCompany = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
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
        errorService.getErrorResponse(11).setMoreInfo('The user does not have the required role to use this endpoint');
    }

    const { tenantId, documentId } = event.pathParameters;

    return await esignatureService.getDocumentPreview(tenantId, documentId);
});

/**
 * Generates a preview of an employee's saved document
 */
export const getDocumentPreview = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('esignature.handler.getDocumentPreview');

    utilService.validateAndThrow(event.pathParameters, employeeResourceUriSchema);

    const { tenantId, documentId } = event.pathParameters;

    return await esignatureService.getDocumentPreview(tenantId, documentId);
});

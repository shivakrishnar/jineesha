import * as Yup from 'yup';
import * as utilService from '../../../util.service';
import * as esignatureService from './esignature.service';

import { IGatewayEventInput } from '../../../util.service';

const headerSchema = {
    authorization: { required: true, type: String },
};

const createEmbeddedTemplateResourceUriSchema = {
    tenantId: { required: true, type: String },
    companyId: { required: true, type: String },
};

const createEmbeddedTemplateValidationSchema = {
    file: { required: true, type: String },
    fileName: { required: true, type: String },
    signerRoles: { required: true, type: Array },
};

const createEmbeddedTemplateSchema = Yup.object().shape({
    file: Yup.string().required(),
    fileName: Yup.string().required(),
    signerRoles: Yup.array()
        .min(1, 'You must provide at least one signer role.')
        .of(Yup.object())
        .required(),
});
const signerRoleSchema = Yup.object().shape({
    name: Yup.string().required(),
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
    utilService.validateAndThrow(event.pathParameters, createEmbeddedTemplateResourceUriSchema);
    utilService.validateAndThrow(requestBody, createEmbeddedTemplateValidationSchema);
    utilService.checkAdditionalProperties(createEmbeddedTemplateValidationSchema, requestBody, 'Create Embedded Template');
    utilService.validateRequestBody(createEmbeddedTemplateSchema, requestBody);
    utilService.validateCollection(signerRoleSchema, requestBody.signerRoles);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const accessToken = event.headers.authorization.replace(/Bearer /i, '');

    return await esignatureService.createTemplate(tenantId, companyId, accessToken, requestBody);
});

export const createBulkSignatureRequest = utilService.gatewayEventHandler(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createBulkSignatureRequest');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        utilService.validateAndThrow(requestBody, bulkSignatureRequestValidationSchema);
        utilService.checkAdditionalProperties(bulkSignatureRequestValidationSchema, requestBody, 'Signature Request');

        await utilService.validateRequestBody(bulkSignatureRequestSchema, requestBody);
        await utilService.validateCollection(signatorySchema, requestBody.signatories);

        const { tenantId, companyId } = event.pathParameters;
        const accessToken = event.headers.authorization.replace(/Bearer /i, '');

        return await esignatureService.createBulkSignatureRequest(tenantId, companyId, requestBody, accessToken);
    },
);

export const createSignatureRequest = utilService.gatewayEventHandler(
    async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('esignature.handler.createSignatureRequest');

        utilService.normalizeHeaders(event);
        utilService.validateAndThrow(event.headers, headerSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        utilService.validateAndThrow(requestBody, signatureRequestValidationSchema);
        utilService.checkAdditionalProperties(signatureRequestValidationSchema, requestBody, 'Signature Request');
        await utilService.validateRequestBody(signatureRequestSchema, requestBody);

        const { tenantId, companyId, employeeId } = event.pathParameters;
        const accessToken = event.headers.authorization.replace(/Bearer /i, '');

        return await esignatureService.createSignatureRequest(tenantId, companyId, employeeId, requestBody, accessToken);
    },
);

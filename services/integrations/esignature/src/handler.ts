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

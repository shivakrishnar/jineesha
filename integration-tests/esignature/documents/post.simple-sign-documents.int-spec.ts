import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';
import * as documentsService from './documents.service';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;
let document: any;
let createdSignatureRequest: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const createSimpleSignDocumentSchema = JSON.parse(fs.readFileSync('services/integrations/models/CreateSimpleSignDocument.json').toString());
const signatureStatusSchema = JSON.parse(fs.readFileSync('services/integrations/models/SignatureStatus.json').toString());

const schemas = [errorMessageSchema, createSimpleSignDocumentSchema, signatureStatusSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    CreateSimpleSignDocument = 'CreateSimpleSignDocument',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('create simple sign document', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            createdSignatureRequest = await esignatureService.createBatchSignRequest(baseUri, accessToken, true);
            document = documentsService.getValidPostSimpleSignDocumentObject(createdSignatureRequest[0].id);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    // TODO: delete created signature request after all tests run

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if companyID is not found', (done) => {
        const unknownCompanyId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if employeeId is not found', (done) => {
        const unknownEmployeeId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${unknownEmployeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a supplied field is invalid', (done) => {
        const invalidRequest = {
            test: 'invalid',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a required field is not provided', (done) => {
        const invalidRequest = {
            timeZone: 'America/New_York'
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if an additional field is provided', (done) => {
        const invalidRequest = {
            signatureRequestId: createdSignatureRequest.id,
            timeZone: 'America/New_York',
            extraField: 'man playing handball',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if the document does not exist', (done) => {
        const invalidRequest = {
            signatureRequestId: 'def does not exist',
            timeZone: 'America/New_York',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 201 when a simple sign document is created', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.CreateSimpleSignDocument, response.body);
                });
            });
    });

    test('must return a 422 if the document has already been signed', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(422)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });
});

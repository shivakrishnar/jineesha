import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();
const baseUri = configs.apiDomain;

let accessToken: string;
let signatureRequest: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('create bulk signature requests', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            signatureRequest = esignatureService.getValidBulkSignatureRequestObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
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
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if the template ID does not exist', (done) => {
        const invalidRequest = {
            templateId: 'this definitely does not exist',
            subject: 'This is a test request',
            message: 'This is a test request message',
            signatories: [
                {
                    employeeCode: '445',
                    role: 'OnboardingSignatory',
                },
            ],
            isSimpleSign: false,
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
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

    test('must return a 400 if a required field is not provided', (done) => {
        const invalidRequest = {
            templateId: 'this definitely does not exist',
            subject: 'This is a test request',
            message: 'This is a test request message',
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
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

    test('must return a 404 if employees are not found', (done) => {
        const invalidRequest = {
            ...signatureRequest,
            signatories: [
                {
                    employeeCode: '99999',
                    role: 'Employee',
                },
                {
                    employeeCode: '1234567',
                    role: 'Employee',
                },
            ],
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
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

    test('must return a 201 when a request is created', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });
});

describe('create bulk simple signature requests', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            signatureRequest = esignatureService.getValidBulkSimpleSignatureRequestObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
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
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if the template ID does not exist', (done) => {
        const invalidRequest = {
            templateId: configs.esignature.nonExistentSignableDocument,
            subject: 'This is a test request',
            message: 'This is a test request message',
            signatories: [
                {
                    employeeCode: '445',
                    role: 'OnboardingSignatory',
                },
            ],
            isSimpleSign: true,
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
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

    test('must return a 400 if a required field is not provided', (done) => {
        const invalidRequest = {
            templateId: 'this definitely does not exist',
            subject: 'This is a test request',
            message: 'This is a test request message',
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
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

    test('must return a 404 if employees are not found', (done) => {
        const invalidRequest = {
            ...signatureRequest,
            signatories: [
                {
                    employeeCode: '99999',
                    role: 'Employee',
                },
                {
                    employeeCode: '1234567',
                    role: 'Employee',
                },
            ],
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
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

    test('must return a 201 when a request is created', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(signatureRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });
});

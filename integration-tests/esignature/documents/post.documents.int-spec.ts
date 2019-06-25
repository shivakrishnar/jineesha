import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;
let document: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const companyDocumentSchema = JSON.parse(fs.readFileSync('services/integrations/models/CompanyDocument.json').toString());
const employeeDocumentSchema = JSON.parse(fs.readFileSync('services/integrations/models/EmployeeDocument.json').toString());

const schemas = [errorMessageSchema, companyDocumentSchema, employeeDocumentSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    CompanyDocument = 'CompanyDocument',
    EmployeeDocument = 'EmployeeDocument',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('create company document', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            document = esignatureService.getValidCompanyDocumentObject();

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
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
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/documents`;
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
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/documents`;
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
        const uri: string = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/documents`;
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
            file: 'bobam',
            fileName: 1234,
            title: 'title',
            category: 'bobam',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
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
            fileName: 'name.png',
            title: 'title',
            category: 'bobam',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
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
            file: 'bobam',
            fileName: 'name.png',
            title: 'title',
            category: 'bobam',
            extraField: 'man playing handball',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
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

    test('must return a 201 when a company document is created', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, response.body);
                });
            });
    });
});

describe('create employee document', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            document = esignatureService.getValidEmployeeDocumentObject();

            done();
        } catch (error) {
            done.fail(error);
        }
    });

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

    test('must return a 404 if employeeID is not found', (done) => {
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
            file: 'bobam',
            fileName: 1234,
            title: 'title',
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
            fileName: 'name.png',
            title: 'title',
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
            file: 'bobam',
            fileName: 'name.png',
            title: 'title',
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

    test('must return a 201 when an employee document is created', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.EmployeeDocument, response.body);
                });
            });
    });
});

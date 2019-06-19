import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const previewSchema = JSON.parse(fs.readFileSync('services/integrations/models/Preview.json').toString());

const schemas = [errorMessageSchema, previewSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    Preview = 'Preview',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get preview by tenant', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 if a user does not have the correct permissions', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
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
        const uri: string = `/tenants/${invalidTenantId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri: string = `/tenants/${unknownTenantId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if document ID is invalid', async (done) => {
        accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
        const unknownDocumentId = '9999999';
        const uri: string = `/tenants/${configs.tenantId}/documents/${unknownDocumentId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 200 when the document exists', async (done) => {
        accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
        const uri: string = `/tenants/${configs.tenantId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Preview, response.body);
                });
            });
    });
});

describe('get preview by company', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 if a user does not have the correct permissions', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
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
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/documents/${configs.esignature.documentId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if document ID is invalid', async (done) => {
        accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
        const unknownRequestId = 99999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${unknownRequestId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 200 when the document exists', async (done) => {
        accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Preview, response.body);
                });
            });
    });
});

describe('get preview by employee', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
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
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if document ID is invalid', (done) => {
        const unknownRequestId = 99999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/documents/${unknownRequestId}/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 200 when the document exists', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.documentId
        }/preview`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Preview, response.body);
                });
            });
    });
});

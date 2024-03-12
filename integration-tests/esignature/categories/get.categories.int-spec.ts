import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';

const configs = utils.getConfig();
const baseUri = configs.apiDomain;
const nonProxiedBaseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('list document categories', () => {
    describe('for company by company', () => {
        beforeAll(async (done) => {
            try {
                accessToken = await utils.getAccessToken();

                const jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
                jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
                accessToken = await utils.generateAccessToken(jsonPayload);

                done();
            } catch (error) {
                done.fail(error);
            }
        });

        test('must return a 401 if a token is not provided', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/categories`;
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
            const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/esignatures/categories`;
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

        test('must return a 404 if tenantID is not found', (done) => {
            const unknownTenantId = uuidV4();
            const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/esignatures/categories`;
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

        test('must return a 404 if companyID is not found', (done) => {
            const unknownCompanyId = 999999999;
            const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/esignatures/categories`;
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

        test.skip('must return a 204 if no categories are available', (done) => {
            const noCategoryCompanyId = 600050;
            const uri = `/tenants/${configs.tenantId}/companies/${noCategoryCompanyId}/esignatures/categories`;
            request(baseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(204)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 200 when categories are found', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/categories`;
            request(baseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                    });
                });
        });
    });

    describe('for employee docs by company', () => {
        beforeAll(async (done) => {
            try {
                accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

                const jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
                jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
                accessToken = await utils.generateAccessToken(jsonPayload);

                done();
            } catch (error) {
                done.fail(error);
            }
        });

        test('must return a 401 if a token is not provided', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/categories`;
            request(nonProxiedBaseUri)
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
            const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if tenantID is not found', (done) => {
            const unknownTenantId = uuidV4();
            const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if companyID is not found', (done) => {
            const unknownCompanyId = 999999999;
            const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 200 when categories are found', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/categories`;
            request(nonProxiedBaseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                    });
                });
        });
    });

    describe('for employee documents by employee for manager or above', () => {
        beforeAll(async (done) => {
            try {
                accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

                const jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
                jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
                accessToken = await utils.generateAccessToken(jsonPayload);

                done();
            } catch (error) {
                done.fail(error);
            }
        });

        test('must return a 401 if a token is not provided', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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
            const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if tenantID is not found', (done) => {
            const unknownTenantId = uuidV4();
            const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if companyID is not found', (done) => {
            const unknownCompanyId = 999999999;
            const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 200 when categories are found', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                    });
                });
        });
    });
    
    describe('for employee documents by employee for employee', () => {
        beforeAll(async (done) => {
            try {
                accessToken = await utils.getAccessToken();
                done();
            } catch (error) {
                done.fail(error);
            }
        });

        test('must return a 401 if a token is not provided', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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
            const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if tenantID is not found', (done) => {
            const unknownTenantId = uuidV4();
            const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if companyID is not found', (done) => {
            const unknownCompanyId = 999999999;
            const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 404 if employeeID is not found', (done) => {
            const unknownEmployeeId = 99999999;
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${unknownEmployeeId}/documents/categories`;
            request(nonProxiedBaseUri)
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

        test('must return a 200 when categories are found', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/categories`;
            request(nonProxiedBaseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                    });
                });
        });
    });
});

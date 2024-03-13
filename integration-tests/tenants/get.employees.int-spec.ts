import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/internal`;

let accessToken: string;
let employeeAccessToken: string;
let nonAdminToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const employeeSchema = JSON.parse(fs.readFileSync('services/api/models/Employee.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());

const schemas = [errorMessageSchema, employeeSchema, paginatedResultSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    Employee = 'Employee',
    PaginatedResult = 'PaginatedResult',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('list employees by tenant', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            const jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            accessToken = await utils.generateAccessToken(jsonPayload);

            nonAdminToken = await utils.getAccessToken();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/employees`;
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

    test('must return a 401 if an invalid token is provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/employees`;
        request(baseUri)
            .get(uri)
            .set('Authorization', 'Bearer x8984399kjr')
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 if user does not have required role', (done) => {
        const uri = `/tenants/${configs.tenantId}/employees`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${nonAdminToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 400 if tenant ID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/employees`;
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

    test('must return a 404 if tenant ID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/employees`;
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

    test('must return a 200 if the tenant has employees', (done) => {
        const uri = `/tenants/${configs.tenantId}/employees`;
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

describe('list employees by company', () => {
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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees`;
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

    test('must return a 401 if an invalid token is provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees`;
        request(baseUri)
            .get(uri)
            .set('Authorization', 'Bearer x8984399kjr')
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 if user does not have required role', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${nonAdminToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 400 if tenant ID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees`;
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

    test('must return a 404 if tenant ID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees`;
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

    test('must return a 400 if company ID is invalid', (done) => {
        const invalidCompanyId = 'abc123';
        const uri = `/tenants/${configs.tenantId}/companies/${invalidCompanyId}/employees`;
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

    test('must return a 404 if company ID is not found', (done) => {
        const unknownCompanyId = 99999999;
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees`;
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

    test('must return a 200 if the company has employees', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees`;
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

describe('get employee by id', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            const jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            accessToken = await utils.generateAccessToken(jsonPayload);

            employeeAccessToken = await utils.getAccessToken();

            const jsonPayload2 = JSON.parse(Buffer.from(employeeAccessToken.split('.')[1], 'base64').toString())
            jsonPayload2.scope.push("https://www.asuresoftware.com/iam/hr.persona.user");
            employeeAccessToken = await utils.generateAccessToken(jsonPayload2);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 401 if an invalid token is provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}`;
        request(baseUri)
            .get(uri)
            .set('Authorization', 'Bearer x8984399kjr')
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if tenant ID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}`;
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

    test('must return a 404 if tenant ID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}`;
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

    test('must return a 200 if an employee is returned', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Employee, response.body);
                });
            });
    });

    test('must return a 401 if employee tries to access another employee', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.unauthorizedEmployeeId}`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

});

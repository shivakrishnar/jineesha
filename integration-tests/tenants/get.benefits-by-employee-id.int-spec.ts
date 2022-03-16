import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../utils';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/internal`;
let adminAccessToken: string;
let employeeAccessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());
const benefitSchema = JSON.parse(fs.readFileSync('services/api/models/Benefit.json').toString());
const benefitsSchema = JSON.parse(fs.readFileSync('services/api/models/Benefits.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema, benefitSchema, benefitsSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
    Benefits = 'Benefits',
    Benefit = 'Benefit',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get benefits by employee id as an admin user', () => {
    beforeAll(async (done) => {
        try {
            adminAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            console.log(configs.sbAdminUser.username)
            console.log(configs.sbAdminUser.password)
            done();
        } catch (error) {
            done.fail(error);       
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.benefits.tenantId}/companies/${configs.benefits.companyId}/employees/${
            configs.benefits.employeeId
        }/benefits`;
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

    [{ tenantId: configs.invalidTenantId }, { companyId: configs.invalidCompanyId }, { employeeId: configs.invalidEmployeeId }].forEach(
        (endpoint) => {
            test(`must return a 400 if ${Object.keys(endpoint)} is invalid`, (done) => {
                request(baseUri)
                    .get(
                        `/tenants/${endpoint.tenantId || configs.benefits.tenantId}/companies/${endpoint.companyId ||
                            configs.benefits.companyId}/employees/${endpoint.employeeId || configs.benefits.employeeId}/benefits`,
                    )
                    .set('Authorization', `Bearer ${adminAccessToken}`)
                    .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                    .expect(400)
                    .end((error, response) => {
                        utils.testResponse(error, response, done, () => {
                            return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                        });
                    });
            });
        },
    );

    [
        { tenantId: configs.nonExistentTenantId },
        { companyId: configs.nonExistentCompanyId },
        { employeeId: configs.nonExistentEmployeeId },
    ].forEach((endpoint) => {
        test(`must return a 404 if ${Object.keys(endpoint)} is not found`, (done) => {
            request(baseUri)
                .get(
                    `/tenants/${endpoint.tenantId || configs.benefits.tenantId}/companies/${endpoint.companyId ||
                        configs.benefits.companyId}/employees/${endpoint.employeeId || configs.benefits.employeeId}/benefits`,
                )
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(404)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                    });
                });
        });
    });

    test('must return a 200 if benefits exists', (done) => {
        const uri = `/tenants/${configs.benefits.tenantId}/companies/${configs.benefits.companyId}/employees/${
            configs.benefits.employeeId
        }/benefits`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Benefits, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Benefit, response.body.results[0]);
                });
            });
    });
});

describe('get benefits by employee Id as an employee user', () => {
    beforeAll(async (done) => {
        try {
            employeeAccessToken = await utils.getAccessToken(configs.employeeUser.review.username, configs.employeeUser.review.password);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return 401 error if employee level user is not tied to the requested employee', async (done) => {
        const uri = `/tenants/${configs.benefits.tenantId}/companies/${configs.benefits.companyId}/employees/${
            configs.benefits.userAccessTest.unrightfulEmployee}/benefits`

        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                     return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 200 if employee level user is tied to the requested employee', async (done) => {
        const uri = `/tenants/${configs.benefits.tenantId}/companies/${configs.benefits.companyId}/employees/${
            configs.benefits.userAccessTest.rightfulEmployee}/benefits`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, benefitsSchema, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
            });
    });
});


import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../utils';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/internal`;
let adminAccessToken: string;
let employeeAccessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());
const classSchema = JSON.parse(fs.readFileSync('services/api/models/Class.json').toString());
const classesSchema = JSON.parse(fs.readFileSync('services/api/models/Classes.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema, classSchema, classesSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
    Classes = 'Classes',
    Class = 'Class',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get classes by employee id as an admin user', () => {
    beforeAll(async (done) => {
        try {
            adminAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            const jsonPayload = JSON.parse(Buffer.from(adminAccessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            adminAccessToken = await utils.generateAccessToken(jsonPayload);

            done();
        } catch (error) {
            done.fail(error);       
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.classes.tenantId}/companies/${configs.classes.companyId}/employees/${
            configs.classes.employeeId
        }/classes`;
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
                        `/tenants/${endpoint.tenantId || configs.classes.tenantId}/companies/${endpoint.companyId ||
                            configs.classes.companyId}/employees/${endpoint.employeeId || configs.classes.employeeId}/classes`,
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
                    `/tenants/${endpoint.tenantId || configs.classes.tenantId}/companies/${endpoint.companyId ||
                        configs.classes.companyId}/employees/${endpoint.employeeId || configs.classes.employeeId}/classes`,
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

    test('must return a 200 if classes exists', (done) => {
        const uri = `/tenants/${configs.classes.tenantId}/companies/${configs.classes.companyId}/employees/${
            configs.classes.employeeId
        }/classes`;
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
                    return utils.assertJson(schemas, schemaNames.Classes, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Class, response.body.results[0]);
                });
            });
    });
});

describe('get classes by employee Id as an employee user', () => {
    beforeAll(async (done) => {
        try {
            
            employeeAccessToken = await utils.getAccessToken();

            const jsonPayload = JSON.parse(Buffer.from(employeeAccessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/hr.persona.user");
            employeeAccessToken = await utils.generateAccessToken(jsonPayload);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return 401 error if employee level user is not tied to the requested employee', async (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.classes.userAccessTest.unrightfulEmployee}/classes`

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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.classes.userAccessTest.rightfulEmployee}/classes`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, classesSchema, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
            });
    });
});

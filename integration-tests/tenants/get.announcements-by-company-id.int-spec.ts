import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../utils';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/internal`;
let adminAccessToken: string;
let employeeAccessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());
const announcementsSchema = JSON.parse(fs.readFileSync('services/api/models/Announcements.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema, announcementsSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
    Announcements = 'Announcements',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get announcements by company id as an admin user', () => {
    beforeAll(async (done) => {
        try {
            adminAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements`;

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

    [{ tenantId: configs.invalidTenantId }, { companyId: configs.invalidCompanyId }].forEach((endpoint) => {
        test(`must return a 400 if ${Object.keys(endpoint)} is invalid`, (done) => {
            request(baseUri)
                .get(`/tenants/${endpoint.tenantId || configs.tenantId}/companies/${endpoint.companyId || configs.companyId}/announcements`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(400)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                    });
                });
        });
    });

    [{ tenantId: configs.nonExistentTenantId }, { companyId: configs.nonExistentCompanyId }].forEach((endpoint) => {
        test(`must return a 404 if ${Object.keys(endpoint)} is not found`, (done) => {
            request(baseUri)
                .get(`/tenants/${endpoint.tenantId || configs.tenantId}/companies/${endpoint.companyId || configs.companyId}/announcements`)
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

    test('must return a 200 if announcement exists', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, schemaNames.Announcements, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
            });
    });

    test('should return 200 with the active param', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements?active=true`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, schemaNames.Announcements, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
            });
    });

    test('should return 200 with the indefinite param', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements?indefinite=true`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, schemaNames.Announcements, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
            });
    });

    test('should return 400 with the unsupported param', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements?abc=true`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('should return 400 with the invalid param', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements?indefinite=invalidvalue`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('should return 400 with unpairable params', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/announcements?indefinite=true&active=true`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });
});

describe('get announcements by company Id as an employee user', () => {
    beforeAll(async (done) => {
        try {
            employeeAccessToken = await utils.getAccessToken(configs.employeeUser.username, configs.employeeUser.password);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('should return 200 if user does not belong to company', async (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.announcements.companyA}/announcements`;

        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, schemaNames.Announcements, response.body.results);
                });
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.PaginatedResult, response.body);
                });
            });
    });

    test('should return 401 if user does not belong to company', async (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.announcements.companyB}/announcements`;

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
});

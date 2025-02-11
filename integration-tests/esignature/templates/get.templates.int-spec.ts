import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';

const configs = utils.getConfig();

const baseUri = configs.apiDomain;

let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());
const templateSchema = JSON.parse(fs.readFileSync('services/integrations/models/Template.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema, templateSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
    Template = 'Template',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('list templates', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates`;
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
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/esignatures/templates`;
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
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/esignatures/templates`;
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
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/esignatures/templates`;
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

    describe('list HelloSign templates', () => {
        test.skip('must return a 204 when no templates exist', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyWithNoData}/esignatures/templates`;
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

        test.skip('must return a 200 when templates exist', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates`;
            request(baseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        const success =
                            utils.assertJson(schemas, schemaNames.PaginatedResult, response.body) &&
                            utils.assertJson(schemas, schemaNames.Template, response.body.results);
                        return success;
                    });
                });
        });
    });

    describe('list consolidated templates', () => {
        test('must return a 200 when templates and legacy documents exist', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates?consolidated=true`;
            request(baseUri)
                .get(uri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });
    });

    describe('list filtered templates', () => {
        test('must return a 200 when templates that match the specified filter exist', (done) => {
            const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates?consolidated=true&search=${
                configs.esignature.searchQueryParam
            }`;
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
});

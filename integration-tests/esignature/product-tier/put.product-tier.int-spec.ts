import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;
let simpleRequestBody: any;
let enhancedRequestBody: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());
const productTierSchema = JSON.parse(fs.readFileSync('services/integrations/models/CompanyEsignatureProductTier.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema, productTierSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
    CompanyEsignatureProductTier = 'CompanyEsignatureProductTier',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('update company product tier', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            simpleRequestBody = esignatureService.getValidPutProductTierObject(1);
            console.log(simpleRequestBody);
            enhancedRequestBody = esignatureService.getValidPutProductTierObject(2);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .send(simpleRequestBody)
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
        const uri = `/tenants/${invalidTenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(simpleRequestBody)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if companyId is invalid', (done) => {
        const invalidCompanyId = 'abcd';
        const uri = `/tenants/${configs.tenantId}/companies/${invalidCompanyId}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(simpleRequestBody)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if company does not exist', (done) => {
        const nonExistentCompany = '99999999';
        const uri = `/tenants/${configs.tenantId}/companies/${nonExistentCompany}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(simpleRequestBody)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if product tier does not exist', (done) => {
        const requestBodyWithNonExistentId = {
            productTierId: 999999,
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(requestBodyWithNonExistentId)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if productTierId is not a number', (done) => {
        const requestBodyWithInvalidId = {
            productTierId: 'abcd',
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(requestBodyWithInvalidId)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if productTierId is not supplied', (done) => {
        const requestBodyWithoutId = {};
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(requestBodyWithoutId)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if additional fields are supplied', (done) => {
        const requestBodyWithAdditionalFields = {
            productTierId: 1,
            extraField: 'test',
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(requestBodyWithAdditionalFields)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 200 if product tier is updated to simple sign', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(simpleRequestBody)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.CompanyEsignatureProductTier, response.body);
                });
            });
    });

    test('must return a 200 if product tier is updated to enhanced e-signature', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.esignature.companyIdForProductTier}/esignatures`;
        request(baseUri)
            .put(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(enhancedRequestBody)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.CompanyEsignatureProductTier, response.body);
                });
            });
    });
});

import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';

const configs = utils.getConfig();

const baseUri = configs.apiDomain;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const embeddedUrlSchema = JSON.parse(fs.readFileSync('services/integrations/models/EmbeddedUrl.json').toString());

const schemas = [errorMessageSchema, embeddedUrlSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    EmbeddedUrl = 'EmbeddedUrl',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get sign url', () => {
    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/esignatures/${
            configs.esignature.signatureId
        }/sign-url`;
        request(baseUri)
            .get(uri)
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
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/esignatures/${
            configs.esignature.signatureId
        }/sign-url`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if CompanyID is not found', (done) => {
        const unknownCompanyId = 99999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees/${configs.employeeId}/esignatures/${
            configs.esignature.signatureId
        }/sign-url`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if request ID is not found', (done) => {
        const unknownRequestId = 99999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/esignatures/${unknownRequestId}/sign-url`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 200 when the request exists', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/esignatures/${
            configs.esignature.signatureId
        }/sign-url`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.EmbeddedUrl, response.body);
                });
            });
    });
});

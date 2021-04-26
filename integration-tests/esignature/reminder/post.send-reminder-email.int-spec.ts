import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';

const configs = utils.getConfig();
const baseUri = configs.nonProxiedApiDomain + '/integrations';

let accessToken: string;
let employeeToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const paginatedResultSchema = JSON.parse(fs.readFileSync('services/integrations/models/PaginatedResult.json').toString());

const schemas = [errorMessageSchema, paginatedResultSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    PaginatedResult = 'PaginatedResult',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('send reminder email', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            employeeToken = await utils.getAccessToken();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.requestId
        }/remind`;
        request(baseUri)
            .post(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.requestId
        }/remind`;
        request(baseUri)
            .post(uri)
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
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.requestId
        }/remind`;
        request(baseUri)
            .post(uri)
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
        const unknownEmployeeId = 999999999;
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${unknownEmployeeId}/documents/${
            configs.esignature.requestId
        }/remind`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if documentID is not found', (done) => {
        const unknownDocumentId = 999999999;
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/documents/${unknownDocumentId}/remind`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 401 when sent by an employee', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.requestId
        }/remind`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${employeeToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });
    test('must return a 204 when a request is sent', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.requestId
        }/remind`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(204)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });
});

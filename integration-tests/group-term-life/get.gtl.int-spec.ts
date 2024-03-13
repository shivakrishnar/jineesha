import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/gtl`;

let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const gtlRecordSchema = JSON.parse(fs.readFileSync('services/api/models/GtlRecord.json').toString());

const schemas = [errorMessageSchema, gtlRecordSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    GtlRecord = 'GtlRecord',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('list gtl records by employee', () => {
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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/gtl`;
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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/gtl`;
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
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/gtl`;
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
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/gtl`;
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

    test('must return a 200 if an employee is found', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeIdForGTL}/gtl`;
        request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.GtlRecord, response.body);
                });
            });
    });
});

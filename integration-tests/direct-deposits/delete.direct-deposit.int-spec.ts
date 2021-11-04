import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

import { DirectDeposit } from '../../services/api/direct-deposits/src/directDeposit';
import * as directDepositService from './direct-deposit.service';

const configs = utils.getConfig();

const baseUri = configs.apiDomain;
const testUri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/direct-deposits`;

let accessToken: string;

let initialDirectDeposit: DirectDeposit;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());

const schemas = [errorMessageSchema];

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('delete direct deposit', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            initialDirectDeposit = await directDepositService.setup(baseUri, accessToken);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 when no token is provided', (done) => {
        request(baseUri)
            .del(`${testUri}/${initialDirectDeposit.id}`)
            .set('Authorization', 'Bearer xxx.xxx.xxx')
            .expect('Content-Type', /json/)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 when trying to delete another users direct deposit', (done) => {
        request(baseUri)
            .del(`/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/123/direct-deposits/${initialDirectDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 404 when the direct deposit does not exist', (done) => {
        request(baseUri)
            .del(`${testUri}/999999999`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 404 when the tenant id is non-existent', (done) => {
        const invalidTenantId = uuidV4();
        const unknownTenantUri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/direct-deposits`;
        request(baseUri)
            .del(`${unknownTenantUri}/${initialDirectDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson([errorMessageSchema], 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 400 when the direct deposit id is non-numeric', (done) => {
        request(baseUri)
            .del(`${testUri}/abc`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 400 when the direct deposit id exceeds the max safe integer', (done) => {
        request(baseUri)
            .del(`${testUri}/99999999999999999`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 204 when a direct deposit is deleted', (done) => {
        request(baseUri)
            .del(`${testUri}/${initialDirectDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(204)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    afterAll(() => {
        directDepositService.tearDown(configs.apiDomain, initialDirectDeposit, accessToken, () => {
            return;
        });
    });
});

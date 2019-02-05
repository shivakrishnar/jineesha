import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

import { DirectDeposit } from '../../api/direct-deposits/directDeposit';
import * as directDepositService from './direct-deposit.service';

const configs = utils.getConfig();

const baseUri = configs.apiDomain;
const testUri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/direct-deposits`;

let accessToken: string;

let directDeposit: DirectDeposit;

const errorMessageSchema = JSON.parse(fs.readFileSync('./src/models/ErrorMessage.json').toString());
const bankAccountSchema = JSON.parse(fs.readFileSync('./src/models/BankAccount.json').toString());
const directDepositSchema = JSON.parse(fs.readFileSync('./src/models/DirectDeposit.json').toString());

const schemas = [bankAccountSchema, directDepositSchema];

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('patch direct deposit', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            directDeposit = await directDepositService.setup(baseUri, accessToken);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 when no token is provided', (done) => {
        request(baseUri)
            .patch(`${testUri}/${directDeposit.id}`)
            .set('Authorization', 'Bearer xxx.xxx.xxx')
            .set('Content-Type', 'application/json')
            .send(directDeposit)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 when token is an invalid JWT', (done) => {
        request(baseUri)
            .patch(`${testUri}/${directDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}-xxx-invalid-xxx`)
            .set('Content-Type', 'application/json')
            .send(directDeposit)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 401 when an employee attempts to update a direct deposit for another employee', (done) => {
        const anotherEmployeeId = 1;
        const restrictedUri: string = `/tenants/${configs.tenantId}/companies/${
            configs.companyId
        }/employees/${anotherEmployeeId}/direct-deposits`;

        request(baseUri)
            .patch(`${restrictedUri}/${directDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(directDeposit)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson([errorMessageSchema], 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 404 when the tenant id is non-existent', (done) => {
        const invalidTenantId = uuidV4();
        const unknownTenantUri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/direct-deposits`;
        request(baseUri)
            .patch(`${unknownTenantUri}/${directDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(directDeposit)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson([errorMessageSchema], 'ErrorMessage', response.body);
                });
            });
    });

    test('must return 200 when a direct deposit is updated', (done) => {
        request(baseUri)
            .patch(`${testUri}/${directDeposit.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send({
                amountType: 'Percentage',
                amount: 34,
            })
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, 'DirectDeposit', response.body);
                });
            });
    });

    afterAll(() => {
        directDepositService.tearDown(configs.apiDomain, directDeposit, accessToken, () => {
            return;
        });
    });
});

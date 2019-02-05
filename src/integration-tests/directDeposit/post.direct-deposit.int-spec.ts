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

describe('post direct deposits', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            directDeposit = directDepositService.getValidDirectDepositObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 when no token is provided', (done) => {
        request(baseUri)
            .post(testUri)
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
            .post(testUri)
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

    test('must return a 401 when an employee attempts to create a direct deposit for another employee', (done) => {
        const anotherEmployeeId = 1;
        const restrictedAccessUri: string = `/tenants/${configs.tenantId}/companies/${
            configs.companyId
        }/employees/${anotherEmployeeId}/direct-deposits`;

        request(baseUri)
            .post(restrictedAccessUri)
            .set('Authorization', `Bearer ${accessToken}`)
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

    test('must return a 404 when the tenant id is non-existent', (done) => {
        const invalidTenantId = uuidV4();
        const unknownTenantUri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/direct-deposits`;
        request(baseUri)
            .post(unknownTenantUri)
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

    test('must return a 201 when a direct deposit is created', (done) => {
        request(baseUri)
            .post(testUri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(directDeposit)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    const createdDirectDeposit = response.body;
                    expect(createdDirectDeposit.status).toBe('Pending');

                    const expectedDirectDeposit: DirectDeposit = new DirectDeposit(directDeposit);

                    // Match fields for test comparison
                    expectedDirectDeposit.status = createdDirectDeposit.status;
                    expectedDirectDeposit.id = createdDirectDeposit.id;
                    expectedDirectDeposit.obfuscate();

                    expect(createdDirectDeposit).toEqual(expectedDirectDeposit);
                    return utils.assertJson(schemas, 'DirectDeposit', response.body);
                });
            });
    });

    test('must return a 400 when the account number exceeds more than 20 characters', (done) => {
        const invalidDirectDeposit: DirectDeposit = new DirectDeposit({
            amount: 19083.58,
            bankAccount: {
                routingNumber: '011401876',
                accountNumber: 'AVeryLongLongLongTestAccountNumber1234',
                designation: 'Savings',
            },
            amountType: 'Flat',
        });

        request(baseUri)
            .post(testUri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidDirectDeposit)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson([errorMessageSchema], 'ErrorMessage', response.body);
                });
            });
    });

    test('must return a 409 when attempting to create a duplicate direct deposit', async (done) => {
        const additionalDirectDeposit: DirectDeposit = new DirectDeposit({
            amount: 19083.58,
            bankAccount: {
                routingNumber: '011401876',
                accountNumber: 'IntegrationTest2',
                designation: 'Savings',
            },
            amountType: 'Flat',
        });

        try {
            const directDepositsUri = directDepositService.getDirectDepositsUri(baseUri);
            await directDepositService.createDirectDeposit(directDepositsUri, additionalDirectDeposit, accessToken);
            // second call to create the same direct deposit should fail
            await directDepositService.createDirectDeposit(directDepositsUri, additionalDirectDeposit, accessToken);
            done.fail('Failure. Expected a conflict on creation of a duplicate direct deposit');
        } catch (apiError) {
            expect(apiError.code).toBe(40);
            expect(apiError.statusCode).toBe(409);
            done();
        }
    });

    afterAll(() => {
        directDepositService.tearDown(configs.apiDomain, directDeposit, accessToken, () => {
            return;
        });
    });
});

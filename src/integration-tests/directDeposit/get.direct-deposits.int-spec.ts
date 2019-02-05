import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

import { DirectDeposit } from '../../api/direct-deposits/directDeposit';
import { DirectDeposits } from '../../api/direct-deposits/directDeposits';
import * as directDepositService from './direct-deposit.service';

const configs = utils.getConfig();

const baseUri = configs.apiDomain;
const testUri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/direct-deposits`;

let accessToken: string;

let initialDirectDeposit: DirectDeposit;

const errorMessageSchema = JSON.parse(fs.readFileSync('./src/models/ErrorMessage.json').toString());
const bankAccountSchema = JSON.parse(fs.readFileSync('./src/models/BankAccount.json').toString());
const directDepositSchema = JSON.parse(fs.readFileSync('./src/models/DirectDeposit.json').toString());
const directDepositsSchema = JSON.parse(fs.readFileSync('./src/models/DirectDeposits.json').toString());

const schemas = [bankAccountSchema, directDepositSchema, directDepositsSchema];

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get direct deposits', () => {
    test('must return a 204 when an employee has no direct deposits', async (done) => {
        accessToken = await utils.getAccessToken();
        const directDepositsUri = directDepositService.getDirectDepositsUri(baseUri);
        await directDepositService.clearAll(directDepositsUri, accessToken);
        request(baseUri)
            .get(testUri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(204)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    describe('for an employee with direct deposits', () => {
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
                .get(testUri)
                .set('Authorization', 'Bearer xxx.xxx.xxx')
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(401)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test(`must return a 401 when attempting to get another employee's direct deposits`, (done) => {
            const anotherEmployeeId = 1;
            const restrictedAccessUri: string = `/tenants/${configs.tenantId}/companies/${
                configs.companyId
            }/employees/${anotherEmployeeId}/direct-deposits`;
            request(baseUri)
                .get(restrictedAccessUri)
                .set('Authorization', `Bearer ${accessToken}`)
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
                .get(unknownTenantUri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(404)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson([errorMessageSchema], 'ErrorMessage', response.body);
                    });
                });
        });

        test('must return a 200 when at least a direct deposit exists for the employee', (done) => {
            request(baseUri)
                .get(testUri)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, 'DirectDeposits', response.body);
                    });
                });
        });

        test('must return a 200 and exclude end-dated (deleted) direct deposits', async (done) => {
            const additionalDirectDeposit: DirectDeposit = new DirectDeposit({
                amount: 19083.58,
                bankAccount: {
                    routingNumber: '011401876',
                    accountNumber: 'IntegrationTest',
                    designation: 'MoneyMarket',
                },
                amountType: 'Flat',
            });

            try {
                const domain = directDepositService.getDirectDepositsUri(baseUri);
                const addedDirectDeposit: DirectDeposit = await directDepositService.createDirectDeposit(
                    domain,
                    additionalDirectDeposit,
                    accessToken,
                );
                const directDepositUri: string = directDepositService.getDirectDepositUri(baseUri, addedDirectDeposit.id);
                await directDepositService.deleteDirectDeposit(directDepositUri, accessToken);

                request(baseUri)
                    .get(testUri)
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                    .expect(200)
                    .end((error, response) => {
                        utils.testResponse(error, response, done, () => {
                            const directDeposits: DirectDeposits = response.body;
                            expect(directDeposits.results.length).toBe(1);
                            expect(directDeposits.results[0].id).toBe(initialDirectDeposit.id);
                            return utils.assertJson(schemas, 'DirectDeposits', directDeposits);
                        });
                    });
            } catch (error) {
                done.fail(error);
            }
        });

        afterAll(() => {
            directDepositService.tearDown(configs.apiDomain, initialDirectDeposit, accessToken, () => {
                return;
            });
        });
    });
});

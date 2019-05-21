import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();
const baseUri = configs.apiDomain;

let onboardingRequest: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());

const schemas = [errorMessageSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('create onboarding signature requests', () => {
    beforeAll(async (done) => {
        try {
            onboardingRequest = esignatureService.getValidOnboardingObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(onboardingRequest)
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
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(onboardingRequest)
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
        const uri: string = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(onboardingRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 404 if onboardingKey does not exist', (done) => {
        const invalidOnboardingRequest = {
            onboardingKey: 'this definitely does not exist',
            taskListId: configs.esignature.taskListId,
            emailAddress: 'cuong.lai@asuresoftware.com',
            name: 'Cuong Lai',
            employeeCode: '1234',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(invalidOnboardingRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 404 if taskListId does not exist', (done) => {
        const invalidOnboardingRequest = {
            onboardingKey: configs.esignature.onboardingKey,
            taskListId: 99999999999,
            emailAddress: 'cuong.lai@asuresoftware.com',
            name: 'Cuong Lai',
            employeeCode: '1234',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(invalidOnboardingRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a required field is not provided', (done) => {
        const invalidOnboardingRequest = {
            taskListId: configs.esignature.taskListId,
            emailAddress: 'cuong.lai@asuresoftware.com',
            name: 'Cuong Lai',
            employeeCode: '1234',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(invalidOnboardingRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 201 when onboarding signature requests are created', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/requests/onboarding`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(onboardingRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });
});

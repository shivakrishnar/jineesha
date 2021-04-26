import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let payload: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const previewSchema = JSON.parse(fs.readFileSync('services/integrations/models/Preview.json').toString());

const schemas = [errorMessageSchema, previewSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    Preview = 'Preview',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get onboarding preview', () => {
    beforeAll(async (done) => {
        try {
            payload = esignatureService.getValidOnboardingPreviewObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/documents/${configs.esignature.documentId}/onboarding-preview`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(payload)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if document ID is not found', async (done) => {
        const unknownDocumentId = '9999999';
        const uri = `/tenants/${configs.tenantId}/documents/${unknownDocumentId}/onboarding-preview`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(payload)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 422 if the Company Documents step is not active on the onboarding', async (done) => {
        const uri = `/tenants/${configs.tenantId}/documents/${configs.esignature.documentId}/onboarding-preview`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send({
                onboardingKey: configs.esignature.onboardingKey,
            })
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(422)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('returns an onboarding non-sign document preview', async (done) => {
        const uri = `/tenants/${configs.tenantId}/documents/${
            configs.esignature.onboardingWithCompanyDocumentsActive.nonSignableDocument
        }/onboarding-preview`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(payload)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Preview, response.body);
                });
            });
    });

    test('returns an onboarding legacy document preview', async (done) => {
        const uri = `/tenants/${configs.tenantId}/documents/${
            configs.esignature.onboardingWithCompanyDocumentsActive.legacyDocument
        }/onboarding-preview`;
        request(baseUri)
            .post(uri)
            .set('Content-Type', 'application/json')
            .send(payload)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.Preview, response.body);
                });
            });
    });
});

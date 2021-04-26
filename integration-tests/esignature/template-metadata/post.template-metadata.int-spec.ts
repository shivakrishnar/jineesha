import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();
const baseUri = configs.apiDomain;

let accessToken: string;
let templateMetadata: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());

const schemas = [errorMessageSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('save template metadata', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            templateMetadata = esignatureService.getValidTemplateMetadataObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/esignatures/templates/${
            configs.esignature.templateId
        }/save-metadata`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(templateMetadata)
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
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/esignatures/templates/${
            configs.esignature.templateId
        }/save-metadata`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(templateMetadata)
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
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/esignatures/templates/${
            configs.esignature.templateId
        }/save-metadata`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(templateMetadata)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 404 if templateID is not found', (done) => {
        const unknownTemplateId = 'this definitely does not exist';
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates/${unknownTemplateId}/save-metadata`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(templateMetadata)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a required field is not provided', (done) => {
        const invalidTemplateMetadata = {
            fileName: 'test.pdf',
            category: 'onboarding',
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates/${
            configs.esignature.templateId
        }/save-metadata`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidTemplateMetadata)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test.skip('must return a 201 when onboarding signature requests are created', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures/templates/${
            configs.esignature.templateId
        }/save-metadata`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(templateMetadata)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });
});

import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as esignatureService from '../esignature.service';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;
let payload: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const previewSchema = JSON.parse(fs.readFileSync('services/integrations/models/Preview.json').toString());

const schemas = [errorMessageSchema, previewSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    Preview = 'Preview',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('save onboarding documents', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            payload = esignatureService.getValidSaveOnboardingDocumentObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/onboarding/${configs.esignature.onboardingWithCompanyDocumentsActive.key}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
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

    test('must return a 404 if the onboarding does not exist', async (done) => {
        const nonExistentObKey = uuidV4();
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/onboarding/${nonExistentObKey}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
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
});

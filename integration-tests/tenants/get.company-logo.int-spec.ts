import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/internal`;

let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const schemas = [errorMessageSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get company logo', () => {

    beforeAll(async () => {
        try {
            accessToken = await utils.getAccessToken();
        } catch (error) {
            throw new Error('Error in beforeAll: ' + error);
        }
    });

    test('must return a 400 if tenant ID is invalid', async () => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/companies/${configs.logo.companyWithLogo}/logo`;
        await request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return a 404 if tenant ID is not found', async () => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/companies/${configs.logo.companyWithLogo}/logo`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return 404 for company with no logo', async () => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.logo.companyWithNoLogo}/logo`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return company logo for company with logo', async () => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.logo.companyWithLogo}/logo`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .expect(response => {
                expect(response.body).toBeDefined();
                expect(response.headers['content-type']).toContain('image/');
            });
    });
});

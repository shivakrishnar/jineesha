import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../utils';

const configs = utils.getConfig();

const baseUri = `${configs.nonProxiedApiDomain}/internal`;

let accessToken: string;
let adminToken: string;

const companySchema = JSON.parse(fs.readFileSync('services/api/models/Company.json').toString());
const companiesSchema = JSON.parse(fs.readFileSync('services/api/models/Companies.json').toString());
const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const schemas = [companySchema, companiesSchema, errorMessageSchema];

const enum schemaNames {
    Company = 'Company',
    Companies = 'Companies',
    ErrorMessage = 'ErrorMessage',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('list companies by sso account', () => {

    beforeAll(async () => {
        try {
            accessToken = await utils.getAccessToken();

            adminToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            const jsonPayload = JSON.parse(Buffer.from(adminToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            adminToken = await utils.generateAccessToken(jsonPayload);

        } catch (error) {
            throw new Error('Error in beforeAll: ' + error);
        }
    });

    test('must return a 401 if a token is not provided', async () => {
        const uri = `/tenants/${configs.tenantId}/accounts/${configs.ssoAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return a 401 if an invalid token is provided', async () => {
        const uri = `/tenants/${configs.tenantId}/accounts/${configs.ssoAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', 'Bearer x8984399kjr')
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return a 403 if requesting for a different user (and not admin user)', async () => {
        const otherAccountId = uuidV4();
        const uri = `/tenants/${configs.tenantId}/accounts/${otherAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(403)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return a 400 if tenant ID is invalid', async () => {
        const invalidTenantId = '99999999';
        const uri = `/tenants/${invalidTenantId}/accounts/${configs.ssoAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return a 400 if account ID is invalid', async () => {
        const invalidAccountId = '99999999';
        const uri = `/tenants/${configs.tenantId}/accounts/${invalidAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.ErrorMessage, response.body);
            });
    });

    test('must return an empty list if tenant ID is not found', async () => {
        const unknownTenantId = uuidV4();
        const uri = `/tenants/${unknownTenantId}/accounts/${configs.ssoAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .expect(response => {
                expect(response.body).toEqual([]);
            });
    });

    test('must return an empty list if account ID is not found', async () => {
        const unknownAccountId = uuidV4();
        const uri = `/tenants/${configs.tenantId}/accounts/${unknownAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .expect(response => {
                expect(response.body).toEqual([]);
            });
    });

    test('must return list of companies if requesting own user, and have companies', async () => {
        const uri = `/tenants/${configs.tenantId}/accounts/${configs.ssoAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.Companies, response.body);
                const theCompany = response.body.find(c => c.companyId === configs.companyId);
                expect(theCompany).toBeDefined();
            });
    });

    test('must return logo url if company has logo', async () => {
        const uri = `/tenants/${configs.tenantId}/accounts/${configs.logo.ssoAccountId}/companies`;
        await request(baseUri)
            .get(uri)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .expect(response => {
                utils.assertJsonOrThrow(schemas, schemaNames.Companies, response.body);
                const theCompany = response.body.find(c => c.companyId === configs.logo.companyWithLogo);
                expect(theCompany).toBeDefined();
                expect(theCompany.logoUrl).toContain(`/tenants/${configs.tenantId}/companies/${configs.logo.companyWithLogo}/logo`);
            });
    });
});

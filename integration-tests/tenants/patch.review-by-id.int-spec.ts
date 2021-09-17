import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../utils';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/internal`;
let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const updateEmailAcknowledgedSchema = JSON.parse(
    fs.readFileSync('services/api/models/updateEmailAcknowledged.json').toString(),
);
const schemas = [errorMessageSchema, updateEmailAcknowledgedSchema];
const errorMessageSchemaName = 'ErrorMessage';

function setUpEmailAcknowledgedBody(value: any) {
    return { emailAcknowledged: value };
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('update employee review EmailAcknowledged column By Id', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/reviews/${
            configs.reviews.id
        }`;
        request(baseUri)
            .patch(uri)
            .send(setUpEmailAcknowledgedBody(true))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                });
            });
    });

    test('must return a 400 if body is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/reviews/${
            configs.reviews.id
        }`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                });
            });
    });

    test('return a 400 if an invalid value for emailAcknowledged is provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/reviews/${
            configs.reviews.id
        }`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(setUpEmailAcknowledgedBody('invalid value'))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                });
            });
    });

    test('must return a 400 if body is invalid', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/reviews/${
            configs.reviews.id
        }`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ invalidKey: 'invalid value' })
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                });
            });
    });

    [
        { tenantId: configs.invalidTenantId },
        { companyId: configs.invalidCompanyId },
        { employeeId: configs.invalidEmployeeId },
        { id: configs.reviews.invalidId },
    ].forEach((invalid) => {
        test(`must return a 400 if ${Object.keys(invalid)} is invalid`, (done) => {
            request(baseUri)
                .patch(
                    `/tenants/${invalid.tenantId || configs.tenantId}/companies/${invalid.companyId ||
                        configs.companyId}/employees/${invalid.employeeId || configs.employeeId}/reviews/${invalid.id ||
                        configs.reviews.id}`,
                )
                .set('Authorization', `Bearer ${accessToken}`)
                .send(setUpEmailAcknowledgedBody(true))
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(400)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                    });
                });
        });
    });

    [
        { tenantId: configs.nonExistentTenantId },
        { companyId: configs.nonExistentCompanyId },
        { employeeId: configs.nonExistentEmployeeId },
        { id: configs.reviews.nonExistentId },
    ].forEach((nonexistent) => {
        test(`must return a 404 if ${Object.keys(nonexistent)} is nonexistent`, (done) => {
            request(baseUri)
                .patch(
                    `/tenants/${nonexistent.tenantId || configs.tenantId}/companies/${nonexistent.companyId ||
                        configs.companyId}/employees/${nonexistent.employeeId || configs.employeeId}/reviews/${nonexistent.id ||
                        configs.reviews.id}`,
                )
                .set('Authorization', `Bearer ${accessToken}`)
                .send(setUpEmailAcknowledgedBody(true))
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(404)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                    });
                });
        });
    });

    test('must return 200 if emailAcknowledged is patched', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.reviews.employeeWithUpcomingReviews
        }/reviews/${configs.reviews.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(setUpEmailAcknowledgedBody(true))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, updateEmailAcknowledgedSchema, response.body);
                });

                expect(response.body.id).toBe(configs.reviews.id);
                expect(response.body.newEmailAcknowledged).toBe(true);
            });

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(setUpEmailAcknowledgedBody(false))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, updateEmailAcknowledgedSchema, response.body);
                });

                expect(response.body.id).toBe(configs.reviews.id);
                expect(response.body.oldEmailAcknowledged).toBe(true);
                expect(response.body.newEmailAcknowledged).toBe(false);
            });
    });
});

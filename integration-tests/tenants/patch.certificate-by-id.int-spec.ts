import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../utils';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/internal`;
let adminAccessToken: string;
let employeeAccessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const updateEmailAcknowledgedSchema = JSON.parse(fs.readFileSync('services/api/models/updateEmailAcknowledged.json').toString());
const schemas = [errorMessageSchema, updateEmailAcknowledgedSchema];
const errorMessageSchemaName = 'ErrorMessage';

function setUpEmailAcknowledgedBody(value: any) {
    return { emailAcknowledged: value };
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('update employee certificate EmailAcknowledged column By Id as an admin user', () => {
    beforeAll(async (done) => {
        try {
            adminAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            const jsonPayload = JSON.parse(Buffer.from(adminAccessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            adminAccessToken = await utils.generateAccessToken(jsonPayload);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/certificates/${configs.certificates.id}`;
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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/certificates/${configs.certificates.id}`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                });
            });
    });

    test('must return a 400 if body return and invalid value for emailAcknowledged', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/certificates/${configs.certificates.id}`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/certificates/${configs.certificates.id}`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
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
        { id: configs.certificates.invalidId },
    ].forEach((invalid) => {
        test(`must return a 400 if ${Object.keys(invalid)} is invalid`, (done) => {
            request(baseUri)
                .patch(
                    `/tenants/${invalid.tenantId || configs.tenantId}/companies/${invalid.companyId ||
                        configs.companyId}/employees/${invalid.employeeId || configs.employeeId}/certificates/${invalid.id ||
                        configs.certificates.id}`,
                )
                .set('Authorization', `Bearer ${adminAccessToken}`)
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
        { id: configs.certificates.nonExistentId },
    ].forEach((nonexistent) => {
        test(`must return a 404 if ${Object.keys(nonexistent)} is nonexistent`, (done) => {
            request(baseUri)
                .patch(
                    `/tenants/${nonexistent.tenantId || configs.tenantId}/companies/${nonexistent.companyId ||
                        configs.companyId}/employees/${nonexistent.employeeId || configs.employeeId}/certificates/${nonexistent.id ||
                        configs.certificates.id}`,
                )
                .set('Authorization', `Bearer ${adminAccessToken}`)
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
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.certificates.employeeWithExpiringCertificates}/certificates/${configs.certificates.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send(setUpEmailAcknowledgedBody(true))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, updateEmailAcknowledgedSchema, response.body);
                });
                expect(response.body.id).toBe(configs.certificates.id);
                expect(response.body.newEmailAcknowledged).toBe(true);

                request(baseUri)
                    .patch(uri)
                    .set('Authorization', `Bearer ${adminAccessToken}`)
                    .send(setUpEmailAcknowledgedBody(false))
                    .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                    .expect(200)
                    .end((requestError, requestResponse) => {
                        utils.testResponse(requestError, requestResponse, done, () => {
                            return utils.assertJsonOrThrow(schemas, updateEmailAcknowledgedSchema, requestResponse.body);
                        });
                        expect(requestResponse.body.id).toBe(configs.certificates.id);
                        expect(requestResponse.body.oldEmailAcknowledged).toBe(true);
                        expect(requestResponse.body.newEmailAcknowledged).toBe(false);
                    });
            });
    });
});

describe('update certificate by id as an employee user', () => {
    beforeAll(async (done) => {
        try {
            employeeAccessToken = await utils.getAccessToken();

            const jsonPayload = JSON.parse(Buffer.from(employeeAccessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/hr.persona.user");
            employeeAccessToken = await utils.generateAccessToken(jsonPayload);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return 401 error if employee level user is not tied to the requested employee', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.certificates.userAccessTest.unrightfulEmployee}/certificates/${configs.certificates.userAccessTest.unrightfulEmployeeCertificateId}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .send(setUpEmailAcknowledgedBody(true))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, errorMessageSchemaName, response.body);
                });
            });
    });

    test('must return a 200 if employee level user is tied to the requested employee', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.certificates.userAccessTest.rightfulEmployee}/certificates/${configs.certificates.userAccessTest.rightfulEmployeeCertificateId}`;

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${employeeAccessToken}`)
            .send(setUpEmailAcknowledgedBody(true))
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJsonOrThrow(schemas, updateEmailAcknowledgedSchema, response.body);
                });
                expect(response.body.id).toBe(configs.certificates.userAccessTest.rightfulEmployeeCertificateId);
                expect(response.body.newEmailAcknowledged).toBe(true);

                request(baseUri)
                    .patch(uri)
                    .set('Authorization', `Bearer ${employeeAccessToken}`)
                    .send(setUpEmailAcknowledgedBody(false))
                    .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                    .expect(200)
                    .end((requestError, requestResponse) => {
                        utils.testResponse(requestError, requestResponse, done, () => {
                            return utils.assertJsonOrThrow(schemas, updateEmailAcknowledgedSchema, requestResponse.body);
                        });
                        expect(requestResponse.body.id).toBe(configs.certificates.userAccessTest.rightfulEmployeeCertificateId);
                        expect(requestResponse.body.oldEmailAcknowledged).toBe(true);
                        expect(requestResponse.body.newEmailAcknowledged).toBe(false);
                    });
            });
    });
});

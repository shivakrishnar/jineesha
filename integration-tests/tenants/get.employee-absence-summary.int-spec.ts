import * as fs from 'fs';
import * as request from 'supertest';
import * as utils from '../utils';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/internal`;
let accessToken: string;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const employeeAbsenceSummary = JSON.parse(fs.readFileSync('services/api/models/EmployeeAbsenceSummary.json').toString());
const employeeAbsenceSummaryCategory = JSON.parse(fs.readFileSync('services/api/models/EmployeeAbsenseSummaryCategory.json').toString());

const schemas = [errorMessageSchema, employeeAbsenceSummary, employeeAbsenceSummaryCategory];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    EmployeeAbsenceSummary = 'EmployeeAbsenceSummary',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('get employee absence summary by employee id', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            let jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            accessToken = await utils.generateAccessToken(jsonPayload);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.licenses.tenantId}/companies/${configs.licenses.companyId}/employees/${
            configs.licenses.employeeId
        }/absence-summary`;
        request(baseUri)
            .get(uri)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    [{ tenantId: configs.invalidTenantId }, { companyId: configs.invalidCompanyId }, { employeeId: configs.invalidEmployeeId }].forEach(
        (endpoint) => {
            test(`must return a 400 if ${Object.keys(endpoint)} is invalid`, (done) => {
                request(baseUri)
                    .get(
                        `/tenants/${endpoint.tenantId || configs.licenses.tenantId}/companies/${endpoint.companyId ||
                            configs.licenses.companyId}/employees/${endpoint.employeeId || configs.licenses.employeeId}/absence-summary`,
                    )
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                    .expect(400)
                    .end((error, response) => {
                        utils.testResponse(error, response, done, () => {
                            return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                        });
                    });
            });
        },
    );

    [
        { tenantId: configs.nonExistentTenantId },
        { companyId: configs.nonExistentCompanyId },
        { employeeId: configs.nonExistentEmployeeId },
    ].forEach((endpoint) => {
        test(`must return a 404 if ${Object.keys(endpoint)} is not found`, (done) => {
            request(baseUri)
                .get(
                    `/tenants/${endpoint.tenantId || configs.licenses.tenantId}/companies/${endpoint.companyId ||
                        configs.licenses.companyId}/employees/${endpoint.employeeId || configs.licenses.employeeId}/absence-summary`,
                )
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(404)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                    });
                });
        });
    });

    configs.timeOff.existingTimeOffs.forEach(async (timeOff) => {
        await test(`admins should be able to get every summary from any company - ${timeOff.companyId}`, (done) => {
            request(baseUri)
                .get(`/tenants/${configs.tenantId}/companies/${timeOff.companyId}/employees/${timeOff.employeeId}/absence-summary`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return utils.assertJson(schemas, schemaNames.EmployeeAbsenceSummary, response.body);
                    });
                });
        });
    });

    test(`employees should be able to get their own absence summary`, async (done) => {
        accessToken = await utils.getAccessToken();

        let jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
        jsonPayload.scope.push("https://www.asuresoftware.com/iam/hr.persona.user");
        accessToken = await utils.generateAccessToken(jsonPayload);

        request(baseUri)
            .get(
                `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
                    configs.timeOff.existingTimeOffs[0].employeeId
                }/absence-summary`,
            )
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.EmployeeAbsenceSummary, response.body);
                });
            });
    });

    test(`employees should not be able to get another employee's absence summary`, async (done) => {
        accessToken = await utils.getAccessToken(configs.employeeUser.timeOff.username, configs.employeeUser.timeOff.password);

        request(baseUri)
            .get(
                `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
                    configs.timeOff.existingTimeOffs[1].employeeId
                }/absence-summary`,
            )
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });
});

import * as request from 'supertest';
import * as utils from '../../utils';

const configs = utils.getConfig();
const baseUri = configs.apiDomain;

let accessToken: string;

const esignatureConfigurationUri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/esignatures`;

const EsignatureConfigurationOp = {
    enable: {
        op: 'add',
    },
    disable: {
        op: 'remove',
    },
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('esignature configuration', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);

            const jsonPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            accessToken = await utils.generateAccessToken(jsonPayload);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    describe(' on adding configuration to a company', () => {
        test('must return a 401 if a token is not provided', (done) => {
            request(baseUri)
                .patch(esignatureConfigurationUri)
                .set('Content-Type', 'application/json')
                .send(EsignatureConfigurationOp.enable)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(401)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 401 if an invalid token is provided', (done) => {
            request(baseUri)
                .patch(esignatureConfigurationUri)
                .set('Authorization', 'Bearer xxx.xxx.xxx')
                .set('Content-Type', 'application/json')
                .send(EsignatureConfigurationOp.enable)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(401)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 204 when successful', (done) => {
            request(baseUri)
                .patch(esignatureConfigurationUri)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Content-Type', 'application/json')
                .send(EsignatureConfigurationOp.enable)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(204)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });
    });

    describe(' on disabling a configuration on a company', () => {
        test('must return a 401 if a token is not provided', (done) => {
            request(baseUri)
                .patch(esignatureConfigurationUri)
                .set('Content-Type', 'application/json')
                .send(EsignatureConfigurationOp.disable)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(401)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 401 if an invalid token is provided', (done) => {
            request(baseUri)
                .patch(esignatureConfigurationUri)
                .set('Authorization', 'Bearer xxx.xxx.xxx')
                .set('Content-Type', 'application/json')
                .send(EsignatureConfigurationOp.disable)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(401)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 204 when successful', (done) => {
            request(baseUri)
                .patch(esignatureConfigurationUri)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Content-Type', 'application/json')
                .send(EsignatureConfigurationOp.disable)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(204)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });
    });
});

import * as request from 'supertest';
import * as utils from '../../utils';

const configs = utils.getConfig();
const baseUri = configs.nonProxiedApiDomain;

let accessToken: string;

const esignatureBillingUri = `/integrations/esignatures/billing`;

const requestOptions = { returnReport: true };

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('generate esignature billing', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    describe(' on generating a billing report', () => {
        test('must return a 401 if a token is not provided', (done) => {
            request(baseUri)
                .post(esignatureBillingUri)
                .set('Content-Type', 'application/json')
                .send(requestOptions)
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
                .post(esignatureBillingUri)
                .set('Authorization', 'Bearer xxx.xxx.xxx')
                .set('Content-Type', 'application/json')
                .send(requestOptions)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(401)
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 200 when successful and requesting a response', (done) => {
            request(baseUri)
                .post(esignatureBillingUri)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Content-Type', 'application/json')
                .send(requestOptions)
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(200)
                .expect((res) => {
                    expect(res.body).not.toBe('');
                })
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });

        test('must return a 204 when successful without requesting a response', (done) => {
            request(baseUri)
                .post(esignatureBillingUri)
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Content-Type', 'application/json')
                .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
                .expect(204)
                .expect((res) => {
                    expect(res.body).toBe('');
                })
                .end((error, response) => {
                    utils.testResponse(error, response, done, () => {
                        return undefined;
                    });
                });
        });
    });
});

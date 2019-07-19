import * as Ajv from 'ajv';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as mime from 'mime-types';
import * as nJwt from 'njwt';
import * as request from 'superagent';
import * as uuidV4 from 'uuid/v4';
import { DebuggingInfo } from './debuggingInfo';

const configs = getConfig();

export async function getAccessToken(
    username: string = configs.user.username,
    password: string = configs.user.password,
    callback?: any,
): Promise<string> {
    const { apiKey, apiSecret } = JSON.parse(await getSecret(configs.secretsManager.apiSecretId));
    const ssoToken = _generateSsoToken(configs.applicationId, apiKey, apiSecret, { id: configs.tenantId });
    return _getAccessToken(configs.tokenUrl, configs.tenantId, username, password, ssoToken).then((token) => {
        if (callback) {
            callback(undefined, token);
        }
        return token;
    }, callback);
}

function _getAccessToken(domain: string, tenantId: string, username: string, password: string, ssoToken: string): Promise<string> {
    return request
        .post(`${domain}/tenants/${tenantId}/oauth/token`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${ssoToken}`)
        .send(`{ "grant_type": "password", "username": "${username}", "password": "${password}" }`)
        .then((response) => response.body.access_token);
}

async function getSecret(id: string): Promise<string> {
    const client = new AWS.SecretsManager({
        endpoint: configs.secretsManager.endpoint,
        region: configs.secretsManager.region,
    });

    const data = await client.getSecretValue({ SecretId: id }).promise();
    return data.SecretString;
}

export function getConfig(): any {
    const configFilename = process.env.INTEGRATION_TEST_CONFIG_FILENAME || 'development.config.json';
    try {
        return JSON.parse(fs.readFileSync(`./integration-tests/${configFilename}`, 'utf-8'));
    } catch (error) {
        throw new Error(
            `The environment variable INTEGRATION_TEST_CONFIG_FILENAME was not set or the file ${configFilename} could not be found.`,
        );
    }
}

export function assertJson(schemas: any, schemaName: string, body: object): any {
    const ajv = new Ajv();
    ajv.addSchema(schemas);

    const valid = ajv.validate(schemaName, body);
    const detailedErrorMsg = '\n' + ajv.errorsText(ajv.errors, { separator: '\n' }) + '\n';

    if (!valid) {
        return detailedErrorMsg;
    } else {
        return undefined;
    }
}

const assertHeader = (response: any, name: string, expected: string | RegExp) => {
    const value = response.header[name];
    if (expected instanceof RegExp) {
        if (!(expected as RegExp).test(value)) {
            throw new Error(`Expected "${name}" header to match "${expected}" but was ${value}`);
        }
    } else {
        if (value !== expected) {
            throw new Error(`Expected "${name}" header to be "${expected}" but was ${value}`);
        }
    }
};

export function corsAssertions(corsAllowedHeaderList: string): ((response: any) => void) {
    return (response: any): void => {
        // this helper skips these assertions if "corsAllowedHeaderList" is empty (i.e. when using local config)
        if (corsAllowedHeaderList) {
            assertHeader(response, 'access-control-allow-headers', corsAllowedHeaderList);
            assertHeader(response, 'access-control-allow-origin', '*');
        }
    };
}

export function testResponse(error: any, response: any, done: any, asserts: any): void {
    const errorMessage = new DebuggingInfo();
    errorMessage.response = response;
    if (error) {
        errorMessage.errorDetails = {
            message: error.message,
            stack: error.stack,
        };
    }

    try {
        if (response.body.httpStatus >= 400) {
            if (response.body.message === '') {
                done.fail('Expected error message is missing.');
            }
        }

        if (error) {
            done.fail(JSON.stringify(errorMessage, undefined, 2));
        }

        error = asserts();

        if (error) {
            // This isn't ideal, as we have no stack trace. In the future,
            // it may be worthwhile to revisit exception handling and have
            // the schema assertion throw an exception.
            errorMessage.errorDetails = {
                message: error,
            };
            done.fail(JSON.stringify(errorMessage));
        } else {
            done();
        }
    } catch (err) {
        done.fail(err);
    }
}

function _generateSsoToken(
    applicationId: string,
    apiKey: string,
    apiSecret: string,
    tenant: { id?: string; name?: string },
    nbf?: number,
): string {
    const claims: any = {
        iat: new Date().getTime(),
        iss: apiKey,
        sub: applicationId,
        callbackUrl: 'https://adhr-test-1.dev.evolution-software.com/LoginEvoReturn.aspx',
        tenantId: tenant.id,
        tenantName: tenant.name,
        jti: uuidV4(),
    };

    if (nbf) {
        claims.nbf = nbf;
    }

    const token = nJwt.create(claims, apiSecret);
    return token.compact();
}

export function getTokenPayload(token: string): any {
    return jwt.decode(token);
}

export const expectResponse = ({ statusCode, body, code, message, developerMessage }: any) => (response: any) => {
    expect(response.statusCode).toEqual(statusCode);
    if (body) {
        expect(response.body).toMatchObject(body);
    }
    if (code) {
        expect(response.body.code).toEqual(code);
    }
    if (message) {
        expect(response.body.message).toContain(message);
    }
    if (developerMessage) {
        expect(response.body.developerMessage).toContain(developerMessage);
    }
    if (configs.corsAllowedHeaderList) {
        assertHeader(response, 'access-control-allow-headers', configs.corsAllowedHeaderList);
        assertHeader(response, 'access-control-allow-origin', '*');
    }
    assertHeader(response, 'content-type', /json/);
    return response;
};

export const base64EncodeFile = (filePath: string): string => {
    const bitmap = fs.readFileSync(filePath);
    return new Buffer(bitmap).toString('base64');
};

export const uriEncodeTestFile = (filePath: string): string => {
    const mimeType = mime.lookup(filePath);
    const encoding = base64EncodeFile(filePath);
    return `data:${mimeType};base64,${encoding}`;
};

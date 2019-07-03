import * as AuthPolicy from 'aws-auth-policy';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

import * as configService from '../../config.service';
import * as errorService from '../../errors/error.service';
import * as ssoService from '../../remote-services/sso.service';
import * as utilService from '../../util.service';

import { IPayrollApiCredentials } from '../../api/models/IPayrollApiCredentials';
import { SecurityContext } from './securityContext';

import * as thundra from '@thundra/core';

const thundraWrapper = thundra({
    apiKey: configService.lambdaPerfMonitorApiKey(),
});

/**
 * Lambda function that is used as the custom authorizer function for AWS API
 * Gateway. This function allows API Gateway to validate the JWT before passing
 * the call on to the API endpoint.
 */

enum AuthorizerType {
    HR = 'HR',
    Evolution = 'Evolution',
    Golidlocks = 'Goldilocks',
}

export const tokenVerifier = thundraWrapper(
    async (event: APIGatewayEvent, context: Context, callback: any): Promise<void> => {
        console.info('authentication.tokenVerifier');

        const apiSecret = JSON.parse(await utilService.getSecret(configService.getApiSecretId())).apiSecret;
        await verify(event, context, callback, apiSecret, AuthorizerType.Evolution);
    },
);

export const ssoTokenVerifier = thundraWrapper(
    async (event: APIGatewayEvent, context: Context, callback: any): Promise<void> => {
        console.info('authentication.SsoTokenVerifier');
        const apiSecret = JSON.parse(await utilService.getSecret(configService.getSsoCredentialsId())).apiSecret;
        await verify(event, context, callback, apiSecret, AuthorizerType.Golidlocks);
    },
);

export const hrTokenVerifier = thundraWrapper(
    async (event: APIGatewayEvent, context: Context, callback: any): Promise<void> => {
        console.info('authentication.hrTokenVerifier');
        const apiSecret = JSON.parse(await utilService.getSecret(configService.getHrCredentialsId())).apiSecret;
        await verify(event, context, callback, apiSecret, AuthorizerType.Evolution);
    },
);

async function verify(event: APIGatewayEvent, context: Context, callback: any, apiSecret: string, authType: AuthorizerType): Promise<void> {
    console.info('authentication.verify');

    try {
        const policy = await buildPolicy(event, apiSecret, authType);
        callback(undefined, policy);
    } catch (error) {
        console.info('authentication.tokenVerifier error:' + JSON.stringify(utilService.makeSerializable(error)));
        callback('Unauthorized');
    }
}

async function buildPolicy(event: any, secret: string, authType: AuthorizerType): Promise<any> {
    console.info('authenticationService.buildPolicy');

    const accessToken = event.authorizationToken.replace(/Bearer /i, '');
    const verifiedToken = jwt.verify(accessToken, secret);

    if (!verifiedToken) {
        throw errorService.notAuthenticated();
    }

    const decodedToken: any = jwt.decode(accessToken);
    const { account, scope } = decodedToken;

    let payrollApiCredentials: IPayrollApiCredentials;
    let roleMemberships;
    if (authType === AuthorizerType.Golidlocks) {
        payrollApiCredentials = undefined;
        roleMemberships = utilService.parseRoles(scope);
    }

    if (authType === AuthorizerType.Evolution) {
        payrollApiCredentials = await utilService.getPayrollApiCredentials(account.tenantId);
        const hrAccessToken = (await ssoService.exchangeToken(
            account.tenantId,
            accessToken,
            configService.getHrApplicationId(),
        )).access_token;
        const decodedHrToken: any = jwt.decode(hrAccessToken);
        const { scope: hrScope } = decodedHrToken;
        roleMemberships = utilService.parseRoles(scope).concat(utilService.parseRoles(hrScope));
    }

    const securityContext = new SecurityContext(account, roleMemberships, accessToken, payrollApiCredentials);

    const tmp = event.methodArn.split(':');
    const region = tmp[3];
    const awsAccountId = tmp[4];
    const [restApiId, stage] = tmp[5].split('/');

    const policy = new AuthPolicy(JSON.stringify(securityContext), awsAccountId, { region, restApiId, stage });
    policy.allowAllMethods();
    return policy.build();
}

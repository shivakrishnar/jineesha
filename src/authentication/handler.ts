import * as AuthPolicy from 'aws-auth-policy';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

import * as  configService from '../config.service';
import * as errorService from '../errors/error.service';
import * as utilService from '../util.service';

import { SecurityContext } from './securityContext';

/**
 * Lambda function that is used as the custom authorizer function for AWS API
 * Gateway. This function allows API Gateway to validate the JWT before passing
 * the call on to the API endpoint.
 */
export async function tokenVerifier(event: APIGatewayEvent, context: Context, callback: any): Promise<void> {
  console.info('authentication.tokenVerifier');

  try {
    const apiSecret = await utilService.getSecret(configService.getApiSecretId());
    const policy = await buildPolicy(event, apiSecret);
    callback(undefined, policy);
  } catch (error) {
    console.info('authentication.tokenVerifier error:' + JSON.stringify(utilService.makeSerializable(error)));
    callback('Unauthorized');
  }
}

async function buildPolicy(event: any, secret: string): Promise<any> {
  console.info('authenticationService.buildPolicy');

  const accessToken = event.authorizationToken.replace(/Bearer /i, '');
  const verifiedToken = jwt.verify(accessToken, secret);

  if (!verifiedToken) {
    throw errorService.notAuthenticated();
  }

  const decodedToken: any = jwt.decode(accessToken);

  const { account, scope} = decodedToken;
  const securityContext = new SecurityContext(account, scope, accessToken);

  const tmp = event.methodArn.split(':');
  const region = tmp[3];
  const awsAccountId = tmp[4];
  const [ restApiId, stage ] = tmp[5].split('/');

  const policy = new AuthPolicy(JSON.stringify(securityContext), awsAccountId, { region, restApiId, stage });
  policy.allowAllMethods();
  return policy.build();
}

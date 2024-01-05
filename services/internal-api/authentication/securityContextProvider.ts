import { APIGatewayEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

import * as configService from '../../config.service';
import * as errorService from '../../errors/error.service';
import * as ssoService from '../../remote-services/sso.service';
import * as utilService from '../../util.service';
import { SecurityContext } from './securityContext';

export class SecurityContextProvider {
    getSecurityContext = async ({
        event,
        allowAnonymous,
    }: {
        event: Partial<APIGatewayEvent>;
        allowAnonymous?: boolean;
    }): Promise<SecurityContext> => {
        console.info('SecurityContextProvider.getSecurityContext');

        try {
            const headers = event.headers;

            // assume header might not have been normalized
            const authHeader = headers ? headers.authorization || headers.Authorization : undefined;

            if (!authHeader && allowAnonymous) {
                return undefined;
            }

            if (!authHeader) {
                throw new Error('Authorization header not found');
            }

            const accessToken = authHeader.replace(/^Bearer /i, '');

            const { header, payload } = jwt.decode(accessToken, { complete: true });
            const { account, scope, policy: tokenPolicy, exp } = payload;

            let algorithm: string;
            let secret: string;

            if (!header.kid) {
                // V1 access token
                console.log('Verifying a V1 access token');
                algorithm = 'HS256';
                const { applicationId } = payload;
                secret = await utilService.getApplicationSecret(applicationId);

                // if app is not AHR, append AHR scope to the application scope
                if (applicationId !== configService.getHrApplicationId()) {
                    const hrScope = await this.getHrScope(account.tenantId, accessToken);
                    scope.push(...hrScope);
                }
            } else {
                // V2 access token
                console.log('Verifying a V2 access token');
                algorithm = 'RS256';
                const keys = configService.getSsoPublicKeys().find((key) => key.keyId === header.kid);
                secret = keys ? keys.publicKey : undefined;
                if (!secret) {
                    throw new Error(`Could not find a key to verify V2 access token with kid ${header.kid}.`);
                }
            }

            const verifiedToken = jwt.verify(accessToken, secret, { algorithm: [algorithm] });

            if (!verifiedToken) {
                throw new Error('Access token could not be verified');
            }

            const roleMemberships = utilService.parseRoles(scope);

            return new SecurityContext(account, roleMemberships, accessToken, tokenPolicy, exp);
        } catch (e) {
            console.error(`Authentication failed: ${e.message}`);
            throw errorService.notAuthenticated();
        }
    };

    private async getHrScope(tenantId: string, accessToken: string): Promise<string[]> {
        console.info('SecurityContextProvider.getHrScope');

        try {
            const hrAppTokenResponse = await ssoService.exchangeToken(tenantId, accessToken, configService.getHrApplicationId());
            const hrAccessToken = hrAppTokenResponse.access_token;
            const { payload: decodedHrToken } = jwt.decode(hrAccessToken, { complete: true });
            const { scope } = decodedHrToken;
            return scope;
        } catch (e) {
            throw new Error(`Failed to get HR scope via token exchange: ${e.message}`);
        }
    }
}

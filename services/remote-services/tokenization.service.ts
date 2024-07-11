import * as request from 'request-promise-native';
import * as tenantService from '../api/tenants/src/tenants.service';
import * as errorService from '../errors/error.service';
import * as configService from '../config.service';
import * as utilService from '../util.service';
import { ErrorMessage } from '../errors/errorMessage';

async function getAccessTokenForTokenization(): Promise<string> {
    console.info('tokenization.service.getAccessTokenForTokenization');

    try {
        const credentials = JSON.parse(await utilService.getSecret(configService.getTokenizationServiceCredentialsId()));
        const authUrl = configService.getTokenizationAuthUrl();

        const result = await request.post({
            url: authUrl,
            json: true,
            headers: {
                Authorization: `Basic ${Buffer.from(`${credentials.ClientId}:${credentials.ClientSecret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                'grant_type': 'client_credentials',
            }
        });

        if (!result || !result.access_token) {
            throw errorService.getErrorResponse(0).setDeveloperMessage('Unable to obtain tokenization access token');
        }

        return result.access_token;
    } catch (error) {
        console.log(error);
        throw errorService.getErrorResponse(0).setDeveloperMessage('An error occurred while retrieving tokenization access token');
    }
}

/**
* Tokenize employee bank account numbers
 * @param {string} tenantId: Tenant id of the employee's company 
 * @param {array} values: Array of unmasked (non-tokenized) bank accounts
 */
export async function getTokenizedOutput(tenantId: string, values: string[]): Promise<any> {
    console.info('tokenization.service.getTokenizedOutput');
    const tenantConnectionStringData = await tenantService.getConnectionStringByTenant(tenantId);
    
    try {
        const TokenizationTenantID  =  (tenantConnectionStringData[0])?.TokenizationTenantID;
        if(!TokenizationTenantID || !configService.getTokenizationServiceHostUrl()) {
            console.info("Unable to obtain the tokenizationTenantID data");
            return values;
        }

        const accessToken = await getAccessTokenForTokenization();

        const apiUrl = `${configService.getTokenizationServiceHostUrl()}/api/v1.0/${TokenizationTenantID}/tokenization/TryEncrypt`;
        const result = await request.post({
            url: apiUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            json: true,
            body: {
                Values: values,
            },
        });

        if (!result || result.errors > 0) {
            throw errorService.getErrorResponse(0).setDeveloperMessage('Unable to obtain tokenization response');
        } 
        const tokenizationList =  result.values.map(tokenizationObj => tokenizationObj.tokenizedValue);
        return tokenizationList;
    } catch (error) {
        console.log("Unable to tokenize input values");
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0).setDeveloperMessage('Unable to obtain tokenization response');
    }
 }    

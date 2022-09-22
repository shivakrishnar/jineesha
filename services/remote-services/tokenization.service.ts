import * as request from 'request-promise-native';
import * as tenantService from '../api/tenants/src/tenants.service';
import * as errorService from '../errors/error.service';
import * as configService from '../config.service';
import { ErrorMessage } from '../errors/errorMessage';

/**
* Tokenize employee bank account numbers
 * @param {string} tenantId: Tenant id of the employee's company 
 * @param {array} values: Array of unmasked (non-tokenized) bank accounts
 */
export async function getTokenizedOutput(tenantId: string, values: string[]): Promise<any> {
    console.info('util.service.getTokenizedOutput');
    const tenantConnectionStringData = await tenantService.getConnectionStringByTenant(tenantId);
    const TokenizationTenantID  =  (tenantConnectionStringData[0])?.TokenizationTenantID;
    const apiUrl = `${configService.getTokenizationServiceHostUrl()}/api/v1.0/${TokenizationTenantID}/tokenization/Encrypt`;
    
    try {
        if(!TokenizationTenantID) {
            console.log("Unable to obtain the tokenizationTenantID data");
            return values;
        }
        const result = await request.post({
            url: apiUrl,
            json: true,
            body: {
                Values: values,
            },
        });
        if (!result || result.length === 0) {
            throw errorService.getErrorResponse(0).setDeveloperMessage('Unable to obtain tokenization response');
        } 
        const tokenizationList =  result.map(tokenizationObj => tokenizationObj.tokenizedValue);
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
import * as randomstring from 'randomstring';
import * as request from 'superagent';

import { DirectDeposit } from '../../services/api/direct-deposits/src/directDeposit';
import * as utils from '../utils';

const configs = utils.getConfig();

export async function setup(domain: string, accessToken: string): Promise<DirectDeposit> {
    const directDepositsUri: string = getDirectDepositsUri(domain);
    /**
     * Note: Use of clearAll() within the setup function requires that integration
     * test suites be run sequentially for valid results. Otherwise, there exists the risk
     * of direct deposits setup for a particular test suite being deleted by another test suite's
     * execution
     */
    await clearAll(directDepositsUri, accessToken);
    return await createDirectDeposit(directDepositsUri, getValidDirectDepositObject(), accessToken);
}

export function createDirectDeposit(url: string, directDeposit: DirectDeposit, accessToken: string): Promise<DirectDeposit> {
    return new Promise((resolve, reject) => {
        request
            .post(url)
            .send(directDeposit)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .end((error, response) => {
                if (error) {
                    reject(response.body);
                } else {
                    resolve(response.body);
                }
            });
    });
}

export function tearDown(domain: string, directDeposit: DirectDeposit, accessToken: string, callback: any): void {
    deleteDirectDeposit(getDirectDepositUri(domain, directDeposit.id), accessToken)
        .then((result) => {
            callback(undefined, undefined);
        })
        .catch((error) => {
            callback(error);
        });
}

export function deleteDirectDeposit(url: string, accessToken: string): Promise<{}> {
    return new Promise((resolve, reject) => {
        request
            .delete(url)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .end((error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response.body);
                }
            });
    });
}

export function getValidDirectDepositObject(): DirectDeposit {
    const accountNumber = `${randomstring.generate({
        length: 15,
        charset: 'alphanumeric',
    })}`;
    return new DirectDeposit({
        amount: 450.5,
        bankAccount: {
            routingNumber: '000000000',
            accountNumber,
            designation: 'Checking',
        },
        amountType: 'Flat',
    });
}

export function getDirectDepositsUri(domain: string): string {
    return `${domain}/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/direct-deposits`;
}

export function getDirectDepositUri(domain: string, directDepositId: number): string {
    return `${domain}/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
        configs.employeeId
    }/direct-deposits/${directDepositId}`;
}

export async function clearAll(directDepositsUri: string, accessToken: string): Promise<void> {
    try {
        const apiResponse = await request.get(directDepositsUri).set('Authorization', `Bearer ${accessToken}`);

        if (apiResponse && apiResponse.body) {
            const directDeposits = apiResponse.body;
            for (const directDeposit of directDeposits.results) {
                await deleteDirectDeposit(`${directDepositsUri}/${directDeposit.id}`, accessToken);
            }
        }
    } catch (error) {
        console.error(`Unable to clear direct deposits. Reason: ${error}`);
    }
}

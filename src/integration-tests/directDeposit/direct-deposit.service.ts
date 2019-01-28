import * as request from 'superagent';

import { DirectDeposit } from '../../api/direct-deposits/directDeposit';
import * as utils from '../utils';

const configs = utils.getConfig();

export function setup(domain: string, accessToken: string, callback: any): void {
    createDirectDeposit(getDirectDepositsUri(domain), getValidDirectDepositObject(), accessToken)
        .then((directDeposit) => {
            callback(undefined, directDeposit);
        })
        .catch((error) => {
            callback(error);
        });
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
                    reject(error);
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
    return new DirectDeposit({
        amount: 450.5,
        bankAccount: {
            routingNumber: '000000000',
            accountNumber: 'IntegrationTest',
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

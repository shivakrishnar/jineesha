import * as request from 'request-promise-native';
import * as configService from '../config.service';

import { IEvolutionKey } from '../api/models/IEvolutionKey';

const baseUrl = `${configService.getApiDomain()}/v3/api/bureaus`;
const unproxiedBaseUrl = `${configService.getApiDomain()}/v3/api/bureau`;

export async function getEvolutionEarningAndDeduction(tenantName: string, evolutionKeys: IEvolutionKey, token: string): Promise<any> {
    console.info('payrollService.getEvolutionEarningAndDeduction');

    const { clientId, companyId, employeeId, earningsAndDeductionsId } = evolutionKeys;

    const apiUrl = `${baseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/employees/${employeeId}/eds/${earningsAndDeductionsId}`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function updateEvolutionEarningAndDeduction(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
    requestBody: any,
): Promise<any> {
    console.info('payrollService.updateEvolutionEarningAndDeduction');

    const { clientId, companyId, employeeId, earningsAndDeductionsId } = evolutionKeys;

    const apiUrl = `${baseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/employees/${employeeId}/eds/${earningsAndDeductionsId}`;
    try {
        return await request.put({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            body: requestBody,
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function getEmployeeFromEvo(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string
): Promise<any> {
    console.info('payrollService.getEmployeeFromEvo');

    const { clientId, companyId, employeeId } = evolutionKeys;

    const apiUrl = `${baseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/employees/${employeeId}`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        throw e;
    }
}

export async function updateEmployeeInEvo(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
    requestBody: any,
): Promise<any> {
    console.info('payrollService.updateEmployeeInEvo');

    const { clientId, companyId, employeeId } = evolutionKeys;

    const apiUrl = `${baseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/employees/${employeeId}`;
    try {
        return await request.put({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            body: requestBody,
            json: true,
        });
    } catch (e) {
        throw e;
    }
}

export async function getEvolutionTimeOffCategoriesByEmployeeId(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
): Promise<any> {
    console.info('payrollService.getEvolutionTimeOffCategoriesByEmployeeId');

    const { clientId, companyId, employeeId } = evolutionKeys;

    const apiUrl = `${baseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/employees/${employeeId}/time-off-categories`;

    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        })
    } catch (e) {
        console.log(e);
    }
}

export async function getEvolutionTimeOffSummariesByEmployeeId(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
): Promise<any> {
    console.info('payrollService.getEvolutionTimeOffSummariesByEmployeeId');

    const { clientId, companyId, employeeId } = evolutionKeys;

    const apiUrl = `${baseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/employees/${employeeId}/time-off-summaries`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function getEvolutionCompanyTimeOffCategoriesByCompanyId(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
): Promise<any> {
    console.info('payrollService.getEvolutionCompanyTimeOffCategoriesByCompanyId');

    const { clientId, companyId } = evolutionKeys;

    const apiUrl = `${unproxiedBaseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/companytimeoffaccruals`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function getPayrollsByCompanyId(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
): Promise<any> {
    console.info('payrollService.getPayrollsByCompanyId');
    const { clientId, companyId } = evolutionKeys;
    const apiUrl = `${unproxiedBaseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/payrolls`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}
export async function getPayrollBatchesByPayrollId(
    tenantName: string,
    evolutionKeys: IEvolutionKey,
    token: string,
    payrollId,
): Promise<any> {
    console.info('payrollService.getPayrollBatchesByPayrollId');
    const { clientId, companyId } = evolutionKeys;
    const apiUrl = `${unproxiedBaseUrl}/${tenantName}/clients/${clientId}/companies/${companyId}/payrolls/${payrollId}/batches`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        console.log(e);
    }
}

export async function getPayrollUserByUsername(
    tenantName: string,
    username: string,
    token: string,
): Promise<any> {
    console.info('payrollService.getPayrollUserByUsername');

    const apiUrl = `${unproxiedBaseUrl}/${tenantName}/accounts?username=${username}`;
    try {
        return await request.get({
            url: encodeURI(apiUrl),
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        });
    } catch (e) {
        throw e;
    }
}
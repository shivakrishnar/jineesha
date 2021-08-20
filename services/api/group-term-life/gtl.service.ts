import { Queries } from '../../queries/queries';

import { ErrorMessage } from '../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../internal-api/database/events';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';

import * as errorService from '../../errors/error.service';
import * as utilService from '../../util.service';
import * as employeeService from '../tenants/src/employee.service';
import * as payrollService from '../../remote-services/payroll.service';
import * as ssoService from '../../remote-services/sso.service';
import { IEvolutionKey } from '../models/IEvolutionKey';

type GtlRecord = {
    flatCoverage: boolean;
    flatAmount?: number;
    earningsMultiplier?: number;
    workHours?: number;
};

/**
 * Lists group term life records for an employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to
 * @param {string} companyId: The company the specific employee belongs to
 * @param {string} employeeId: The id of the specific employee
 * @param {string} emailAddress: The email address of the user
 * @param {string[]} roles: A collection of roles that are associated with the user
 * @returns {Promise<GtlRecord>}: Promise of a GTL record
 */

export async function listGtlRecordsByEmployee(
    tenantId: string,
    companyId: string,
    employeeId: string,
    emailAddress: string,
    roles: string[],
): Promise<GtlRecord> {
    console.info('gtlService.listGtlRecordsByEmployee');

    try {
        const [employee]: any[] = await Promise.all([
            employeeService.getById(tenantId, companyId, employeeId, emailAddress, roles),
            utilService.validateCompany(tenantId, companyId),
        ]);

        if (!employee) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Employee with ID ${employeeId} not found.`);
        }

        const query = new ParameterizedQuery('ListGtlRecordsByEmployee', Queries.listGtlRecordsByEmployee);
        query.setParameter('@employeeId', employeeId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            return undefined;
        }

        const record = result.recordset[0];

        return {
            employeeId: record.EmployeeID,
            flatCoverage: record.FlatCoverage,
            flatAmount: record.FlatAmount,
            earningsMultiplier: record.EarningsMultiplier,
            workHours: record.WorkHours,
        } as GtlRecord;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Creates a group term life record
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to
 * @param {string} companyId: The company the specific employee belongs to
 * @param {string} employeeId: The id of the specific employee
 * @param {object} gtlData: An object that contains GTL data to be inserted into the database
 * @param {string} emailAddress: The email address of the user
 * @param {string[]} roles: A collection of roles that are associated with the user
 * @param {string} accessToken: HR access token
 * @returns {Promise<GtlRecord>}: Promise of a GTL record
 */

export async function createGtlRecord(
    tenantId: string,
    companyId: string,
    employeeId: string,
    gtlData: GtlRecord,
    emailAddress: string,
    roles: string[],
    accessToken: string,
): Promise<GtlRecord> {
    console.info('gtlService.createGtlRecord');

    try {
        const [employee]: any[] = await Promise.all([
            employeeService.getById(tenantId, companyId, employeeId, emailAddress, roles),
            utilService.validateCompany(tenantId, companyId),
        ]);

        if (!employee) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Employee with ID ${employeeId} not found.`);
        }

        let validationErrorMessage;
        if (gtlData.flatCoverage) {
            if (!gtlData.flatAmount) {
                validationErrorMessage = 'flatAmount must be provided if flatCoverage is true.';
            } else if (gtlData.earningsMultiplier || gtlData.workHours) {
                validationErrorMessage = 'earningsMultiplier and workHours must not be provided if flatCoverage is true.';
            }
        } else {
            if (!gtlData.earningsMultiplier) {
                validationErrorMessage = 'earningsMultiplier must be provided if flatCoverage is false.';
            } else if (!employee.isSalary && !gtlData.workHours) {
                validationErrorMessage = 'workHours must be provided if flatCoverage is false and employee is hourly.';
            } else if (gtlData.flatAmount) {
                validationErrorMessage = 'flatAmount must not be provided if flatCoverage is false.';
            }
        }

        if (validationErrorMessage) {
            throw errorService.getErrorResponse(30).setDeveloperMessage(validationErrorMessage);
        }

        const checkForExistingRecord: any = await listGtlRecordsByEmployee(tenantId, companyId, employeeId, emailAddress, roles);

        if (checkForExistingRecord) {
            throw errorService.getErrorResponse(73).setDeveloperMessage('Record already exists for this employee!');
        }

        await updateEvolution(tenantId, employee.evoData, accessToken, gtlData);

        const query = new ParameterizedQuery('CreateGtlRecord', Queries.createGtlRecord);
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@flatCoverage', gtlData.flatCoverage ? 1 : 0);
        query.setParameter('@flatAmount', gtlData.flatAmount || 'NULL');
        query.setParameter('@earningsMultiplier', gtlData.earningsMultiplier || 'NULL');
        query.setParameter('@workHours', gtlData.workHours || 'NULL');

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        return {
            employeeId,
            flatCoverage: gtlData.flatCoverage,
            flatAmount: gtlData.flatAmount,
            earningsMultiplier: gtlData.earningsMultiplier,
            workHours: gtlData.workHours,
        } as GtlRecord;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates Evolution employee with GTL data
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to
 * @param {string} evoKeys: Evo clientId, companyId, and employeeIds
 * @param {string} accessToken: HR access token
 * @param {object} gtlData: An object that contains GTL data to be inserted into the database
 */

async function updateEvolution(tenantId: string, evoKeys: IEvolutionKey, accessToken: string, gtlData: any): Promise<void> {
    console.info('gtlService.updateEvolution');

    try {
        const payrollApiAccessToken: string = await utilService.getEvoTokenWithHrToken(tenantId, accessToken);
        const tenantObject = await ssoService.getTenantById(tenantId, payrollApiAccessToken);
        const tenantName = tenantObject.subdomain;

        const employeeEvoInfo: any = await payrollService.getEmployeeFromEvo(tenantName, evoKeys, payrollApiAccessToken);

        employeeEvoInfo.groupTermLife.hours = gtlData.workHours;
        employeeEvoInfo.groupTermLife.policyAmount = gtlData.flatAmount;
        employeeEvoInfo.groupTermLife.rate = gtlData.earningsMultiplier;

        await payrollService.updateEmployeeInEvo(tenantName, evoKeys, payrollApiAccessToken, employeeEvoInfo);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

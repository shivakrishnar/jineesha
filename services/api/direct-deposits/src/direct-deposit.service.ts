import { AuditActionType, AuditAreaOfChange, IAudit } from '../../../internal-api/audit/audit';
import { Queries } from '../../../queries/queries';
import { DirectDeposit } from './directDeposit';

import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { IEvolutionKey } from '../../models/IEvolutionKey';

import * as jwt from 'jsonwebtoken';
import * as errorService from '../../../errors/error.service';
import { ErrorMessage } from '../../../errors/errorMessage';
import * as paginationService from '../../../pagination/pagination.service';
import { IQuery, Query } from '../../../queries/query';
import * as payrollService from '../../../remote-services/payroll.service';
import * as ssoService from '../../../remote-services/sso.service';
import * as utilService from '../../../util.service';

import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult, PaginationData } from '../../../pagination/paginatedResult';
import { InvocationType } from '../../../util.service';
import { IPayrollApiCredentials } from '../../models/IPayrollApiCredentials';

/**
 * Returns a listing of direct deposits for specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @returns {Promise<PaginatedResult>}: Promise of an array of direct deposits
 */
export async function list(
    employeeId: string,
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('directDepositService.list');

    const validQueryStringParameters: string[] = ['pageToken'];

    if (queryParams) {
        // Check for unsupported query params
        if (!Object.keys(queryParams).every((param) => validQueryStringParameters.includes(param))) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
            throw error;
        }
    }

    // Pagination validation
    const paginationData: PaginationData = await paginationService.retrievePaginationData(
        validQueryStringParameters,
        domainName,
        path,
        queryParams,
    );
    const { page } = paginationData;

    // employeeId value must be integral
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('DirectDepositListAll', Queries.directDepositList);
        query.setParameter('@employeeId', employeeId);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        return await getResultSet(tenantId, paginatedQuery, paginationData);
    } catch (error) {
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Creates a direct deposit for a specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @returns {Promise<DiectDeposit>}: Promise of a direct deposits
 */
export async function create(
    employeeId: string,
    companyId: string,
    tenantId: string,
    accessToken: string,
    requestBody: DirectDeposit,
    userEmail: string,
): Promise<DirectDeposit> {
    console.info('directDepositService.create');

    const {
        amount,
        amountType,
        bankAccount: { routingNumber, accountNumber, designation },
    } = requestBody;

    // employeeId value must be integral
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const bankAccountQuery = await getDuplicateBankAccountQuery(routingNumber, accountNumber, designation, employeeId);
        let duplicatesQuery;
        if (amountType === 'Balance Remainder') {
            const remainderOfPayQuery = await getDuplicateRemainderOfPayQuery(employeeId);
            duplicatesQuery = bankAccountQuery.union(remainderOfPayQuery);
        }
        await executeDuplicatesQuery(tenantId, duplicatesQuery || bankAccountQuery);

        const createQuery = new ParameterizedQuery('DirectDepositCreate', Queries.directDepositCreate);
        // Truncate the amount field by removing excess decimal places. This will not round the value.
        const truncatedAmount = parseInt('' + amount * 100, 10) / 100 || 0;
        createQuery.setParameter('@employeeId', employeeId);
        createQuery.setParameter('@routingNumber', routingNumber);
        createQuery.setParameter('@accountNumber', accountNumber);
        createQuery.setParameter('@amountType', amountType);
        createQuery.setParameter('@amount', truncatedAmount);
        // TODO: MJ-1177: Determine the status based on the role of the user.
        // Right now, only employees are using this endpoint so the status will always be Pending.
        createQuery.setParameter('@status', 'Pending');
        createQuery.setParameter('@designation', designation);

        const payload = {
            tenantId,
            queryName: createQuery.name,
            query: createQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const createResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const createdId: number = createResult.recordsets[1][0].ID;

        let resultSet: DirectDeposit[] = [];
        if (createdId) {
            const getQuery = new ParameterizedQuery('GetDirectDeposit', Queries.getDirectDeposit);
            getQuery.setParameter('@directDepositId', createdId);
            resultSet = await getResultSet(tenantId, getQuery);
        }

        utilService.logToAuditTrail({
            userEmail,
            newFields: createResult.recordset[0],
            type: AuditActionType.Insert,
            companyId,
            areaOfChange: AuditAreaOfChange.EmployeeDirectDeposit,
            tenantId,
            employeeId,
        } as IAudit); // Async call to invoke audit lambda - DO NOT AWAIT!!

        const payrollApiCredentials = await utilService.getPayrollApiCredentials(tenantId);
        const payrollApiToken: string = await getPayrollApiToken(accessToken, tenantId, payrollApiCredentials);
        await utilService.clearCache(tenantId, payrollApiToken);

        return new DirectDeposit(resultSet[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a direct deposit for a specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @param {DirectDeposit} requestBody: The request object containing the data to update.
 * @param {string} id: The unique identifier of the direct deposit resource to update.
 * @returns {Promise<DirectDeposit>}: Promise of a direct deposit
 */
export async function update(
    employeeId: string,
    tenantId: string,
    requestBody: DirectDeposit,
    id: string,
    accessToken: string,
    userEmail: string,
    companyId: string,
): Promise<DirectDeposit> {
    console.info('directDepositService.update');

    const method = 'patch';
    const { amount, amountType } = requestBody;

    // id and employeeId value must be integral
    if (Number.isNaN(Number(id))) {
        const errorMessage = `${id} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        if (amountType === 'Balance Remainder') {
            const remainderOfPayQuery = await getDuplicateRemainderOfPayQuery(employeeId);
            await executeDuplicatesQuery(tenantId, remainderOfPayQuery);
        }

        const directDeposits: DirectDeposit[] = await getEmployeeDirectDepositById(tenantId, id, employeeId);
        if (directDeposits.length === 0) {
            const errorMessage = `Resource with id ${id} does not exist.`;
            throw errorService.getErrorResponse(50).setDeveloperMessage(errorMessage);
        }

        const directDeposit = directDeposits[0];
        let payrollApiToken: string;

        if (directDeposit.status === 'Approved') {
            const evolutionKeys: IEvolutionKey = await getEvolutionKeys(tenantId, directDeposit.id);
            if (!utilService.hasAllKeysDefined(evolutionKeys)) {
                throw errorService.getErrorResponse(0).setMoreInfo('Associated direct deposit missing in Evolution');
            }
            const payrollApiCredentials = await utilService.getPayrollApiCredentials(tenantId);
            await updateEvolutionDirectDeposit(accessToken, tenantId, evolutionKeys, payrollApiCredentials, amount, amountType, method);
            payrollApiToken = await getPayrollApiToken(accessToken, tenantId, payrollApiCredentials);

            utilService.logToAuditTrail({
                isEvoCall: true,
                evoCompanyId: evolutionKeys.companyId,
                userEmail,
                type: AuditActionType.Update,
                companyId,
                areaOfChange: AuditAreaOfChange.EmployeeDirectDeposit,
                tenantId,
                employeeId,
            } as IAudit); // Async call to invoke audit lambda - DO NOT AWAIT!!
        }

        await utilService.clearCache(tenantId, payrollApiToken);

        return await updateDirectDeposit(id, amount, amountType, userEmail, companyId, tenantId, employeeId);
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Deletes a direct deposit for a specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @param {string} id: The unique identifier of the direct deposit resource to update.
 * @param {string} accessToken: The access token for the user.
 */
export async function remove(
    employeeId: string,
    tenantId: string,
    id: string,
    accessToken: string,
    userEmail: string,
    companyId: string,
): Promise<void> {
    console.info('directDepositService.delete');

    const method = 'delete';

    // id, employeeId, and companyId value must be integral
    if (Number.isNaN(Number(id))) {
        const errorMessage = `${id} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const directDeposits: DirectDeposit[] = await getEmployeeActiveDirectDepositById(tenantId, id, employeeId);
        if (directDeposits.length === 0) {
            const errorMessage = `Resource with id ${id} does not exist.`;
            throw errorService.getErrorResponse(50).setDeveloperMessage(errorMessage);
        }

        const directDeposit = directDeposits[0];
        const payrollApiCredentials = await utilService.getPayrollApiCredentials(tenantId);

        if (directDeposit.status === 'Pending') {
            await deleteDirectDeposit(id, userEmail, companyId, tenantId, employeeId);
        } else if (directDeposit.status === 'Approved') {
            // update Evolution with end-dated direct deposit before updating the HR equivalent
            const evolutionKeys: IEvolutionKey = await getEvolutionKeys(tenantId, directDeposit.id);
            if (!utilService.hasAllKeysDefined(evolutionKeys)) {
                throw errorService.getErrorResponse(0);
            }
            await updateEvolutionDirectDeposit(accessToken, tenantId, evolutionKeys, payrollApiCredentials, 0, '', method);
            await endDateDirectDeposit(id, userEmail, companyId, tenantId, employeeId);

            utilService.logToAuditTrail({
                isEvoCall: true,
                evoCompanyId: evolutionKeys.companyId,
                userEmail,
                type: AuditActionType.Update,
                companyId,
                areaOfChange: AuditAreaOfChange.EmployeeDirectDeposit,
                tenantId,
                employeeId,
            } as IAudit); // Async call to invoke audit lambda - DO NOT AWAIT!!
        }

        const payrollApiToken: string = await getPayrollApiToken(accessToken, tenantId, payrollApiCredentials);
        await utilService.clearCache(tenantId, payrollApiToken);
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates an existing direct deposit
 * @param {number} amount: The direct deposit amount
 * @param {string} amountType: The type of amount for the direct deposit.
 */
async function updateDirectDeposit(
    directDepositId: string,
    amount: number,
    amountType: string,
    userEmail: string,
    companyId: string,
    tenantId: string,
    employeeId: string,
): Promise<DirectDeposit> {
    const updateQuery = new ParameterizedQuery('DirectDepositUpdate', Queries.directDepositUpdate);

    // Truncate the amount field by removing excess decimal places. This will not round the value.
    const truncatedAmount = parseInt('' + amount * 100, 10) / 100 || 0;
    updateQuery.setParameter('@id', directDepositId);
    updateQuery.setParameter('@amountType', amountType);
    updateQuery.setParameter('@amount', truncatedAmount);
    const payload = {
        tenantId,
        queryName: updateQuery.name,
        query: updateQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

    const oldFields = result.recordsets[0][0];
    const newFields = result.recordsets[1][0];

    const getQuery = new ParameterizedQuery('GetDirectDeposit', Queries.getDirectDeposit);
    getQuery.setParameter('@directDepositId', directDepositId);
    const directDepositResultSet = await getResultSet(tenantId, getQuery);

    utilService.logToAuditTrail({
        userEmail,
        oldFields,
        newFields,
        type: AuditActionType.Update,
        companyId,
        areaOfChange: AuditAreaOfChange.EmployeeDirectDeposit,
        tenantId,
        employeeId,
    } as IAudit); // Async call to invoke audit lambda - DO NOT AWAIT!!

    return new DirectDeposit(directDepositResultSet[0]);
}

/**
 * Deletes an existing direct deposit.
 * @param {string} directDepositId: The unique identifier of the direct deposit
 */
async function deleteDirectDeposit(
    directDepositId: string,
    userEmail: string,
    companyId: string,
    tenantId: string,
    employeeId: string,
): Promise<void> {
    const deleteQuery = new ParameterizedQuery('DirectDepositDelete', Queries.directDepositDelete);
    deleteQuery.setParameter('@directDepositId', directDepositId);
    const payload = {
        tenantId,
        queryName: deleteQuery.name,
        query: deleteQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

    utilService.logToAuditTrail({
        userEmail,
        oldFields: result.recordset[0],
        type: AuditActionType.Delete,
        companyId,
        areaOfChange: AuditAreaOfChange.EmployeeDirectDeposit,
        tenantId,
        employeeId,
    } as IAudit); // Async call to invoke audit lambda - DO NOT AWAIT!!
}

/**
 * Updates the end date of an existing direct deposit
 * @param {string} directDepositId: The unique identifier of the direct deposit
 */
async function endDateDirectDeposit(
    directDepositId: string,
    userEmail: string,
    companyId: string,
    tenantId: string,
    employeeId: string,
): Promise<void> {
    const endDateQuery = new ParameterizedQuery('DirectDepositDelete', Queries.updateDirectDepositEndDate);
    endDateQuery.setParameter('@directDepositId', directDepositId);
    const payload = {
        tenantId,
        queryName: endDateQuery.name,
        query: endDateQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

    const oldFields = result.recordsets[0][0];
    const newFields = result.recordsets[1][0];

    utilService.logToAuditTrail({
        userEmail,
        oldFields,
        newFields,
        type: AuditActionType.Update,
        companyId,
        areaOfChange: AuditAreaOfChange.EmployeeDirectDeposit,
        tenantId,
        employeeId,
    } as IAudit); // Async call to invoke audit lambda - DO NOT AWAIT!!
}

/**
 * Executes the specified query and returns the result as a DirectDeposit
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {IQuery} query: The query to run against the database.
 * @param {PaginationData} [paginationData]: The pagination data specified by the user.
 * @returns {Promise<any>}: Promise of an array of direct deposits
 */
async function getResultSet(tenantId: string, query: IQuery, paginationData?: PaginationData): Promise<any> {
    const payload = {
        tenantId,
        queryName: query.name,
        query: query.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
    let recordSet = result.recordset;
    let totalRecords: number;
    if (paginationData) {
        recordSet = result.recordsets[1];
        totalRecords = result.recordsets[0][0].totalCount;
    }
    const directDeposits = recordSet.map((entry) => {
        return new DirectDeposit({
            id: Number(entry.id),
            amount: Number(parseFloat(entry.amount).toFixed(2)),
            bankAccount: {
                routingNumber: entry.routingNumber,
                accountNumber: entry.accountNumber,
                designation: entry.designation,
            },
            amountType: entry.amountType,
            status: entry.status,
        });
    });
    return paginationData
        ? await paginationService.createPaginatedResult(directDeposits, paginationData.baseUrl, totalRecords, paginationData.page)
        : directDeposits;
}

/**
 * Checks if a specified direct deposit exists
 * @param {string} tenantId: The unique identifier of the tenant.
 * @param {string} directDepositId: The direct deposit identifier.
 * @param {string} employeeId: The employee's identifier.
 * @returns {Promise<DirectDeposit[]>}: Promise of an array of Direct Deposits
 */
function getEmployeeDirectDepositById(tenantId: string, directDepositId: string, employeeId: string): Promise<DirectDeposit[]> {
    const directDepositQuery = new ParameterizedQuery('GetDirectDepositById', Queries.getDirectDeposit);
    const employeeFilterCondition = `EmployeeID = ${employeeId}`;
    directDepositQuery.appendFilter(employeeFilterCondition);
    directDepositQuery.setParameter('@directDepositId', directDepositId);
    return getResultSet(tenantId, directDepositQuery);
}

/**
 * Checks if a specified direct deposit exists and does not have an end date
 * @param {string} tenantId: The unique identifier of the tenant.
 * @param {string} directDepositId: The direct deposit identifier.
 * @param {string} employeeId: The employee's identifier.
 * @returns {Promise<DirectDeposit[]>}: Promise of an array of Direct Deposits
 */
async function getEmployeeActiveDirectDepositById(tenantId: string, directDepositId: string, employeeId: string): Promise<DirectDeposit[]> {
    const directDepositQuery = new ParameterizedQuery('GetActiveDirectDepositById', Queries.getDirectDeposit);
    const employeeFilterCondition = `EmployeeID = ${employeeId}`;
    const endDateFilterCondition = 'EndDate is NULL';
    directDepositQuery.appendFilter(employeeFilterCondition);
    directDepositQuery.appendFilter(endDateFilterCondition);
    directDepositQuery.setParameter('@directDepositId', directDepositId);
    return getResultSet(tenantId, directDepositQuery);
}

/**
 * Executes queries that check for duplicate bank accounts and
 * duplicate remainder of pay direct deposits in the database.
 * @param {string} tenantId: The unique identifier of the tenant.
 * @param {Query} query: The duplicates query to be run.
 */
async function executeDuplicatesQuery(tenantId: string, query: Query): Promise<void> {
    const payload = {
        tenantId,
        queryName: query.name,
        query: query.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const duplicatesResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
    const duplicates: any[] = duplicatesResult.recordset;

    if (duplicates.length > 0) {
        let moreInfo = '';
        if (duplicates[0].DuplicateType === 'accounts') {
            moreInfo = 'Routing number, account number and designation must be collectively unique.';
        } else if (duplicates[0].DuplicateType === 'remainder') {
            moreInfo = 'You can only have one direct deposit with an amountType of Balance Remainder';
        }
        throw errorService.getErrorResponse(40).setMoreInfo(moreInfo);
    }
}

async function getDuplicateBankAccountQuery(
    routingNumber: string,
    accountNumber: string,
    designation: string,
    employeeId: string,
): Promise<ParameterizedQuery> {
    const bankAccountsQuery = new ParameterizedQuery('CheckForDuplicateBankAccounts', Queries.checkForDuplicateBankAccounts);
    bankAccountsQuery.setParameter('@routingNumber', routingNumber);
    bankAccountsQuery.setParameter('@accountNumber', accountNumber);
    bankAccountsQuery.setParameter('@employeeId', employeeId);
    if (designation === 'Checking') {
        bankAccountsQuery.setParameter('@designationColumnName', 'Checking');
    } else if (designation === 'Savings') {
        bankAccountsQuery.setParameter('@designationColumnName', 'IsSavings');
    } else {
        bankAccountsQuery.setParameter('@designationColumnName', 'IsMoneyMarket');
    }
    return bankAccountsQuery;
}

async function getDuplicateRemainderOfPayQuery(employeeId: string): Promise<ParameterizedQuery> {
    const remainderOfPayQuery = new ParameterizedQuery('CheckForDuplicateRemainderOfPay', Queries.checkForDuplicateRemainderOfPay);
    remainderOfPayQuery.setParameter('@employeeId', employeeId);
    return remainderOfPayQuery;
}

/**
 *  Updates an existing direct deposit in Evolution
 * @param {string} hrAccessToken: The access token for the HR user.
 * @param {string} tenantId: The unqiue identifier for the tenant.
 * @param {IEvolutionKey} evolutionKeys: The Evolution-equivalent identifiers for entities in HR
 * @param {IPayrollApiCredentials} payrollApiCredentials: The credentials of the HR global admin.
 * @param {number} amount: The amount tied to the direct deposit.
 * @param {string} amountType: The type of amount.
 * @param {string} method: The method of the desired call.
 */
async function updateEvolutionDirectDeposit(
    hrAccessToken: string,
    tenantId: string,
    evolutionKeys: IEvolutionKey,
    payrollApiCredentials: IPayrollApiCredentials,
    amount: number,
    amountType: string,
    method: string,
): Promise<void> {
    const decodedToken: any = jwt.decode(hrAccessToken);
    const ssoToken = await utilService.getSSOToken(tenantId, decodedToken.applicationId);
    const payrollApiAccessToken = await ssoService.getAccessToken(
        tenantId,
        ssoToken,
        payrollApiCredentials.evoApiUsername,
        payrollApiCredentials.evoApiPassword,
    );
    const tenantObject = await ssoService.getTenantById(tenantId, payrollApiAccessToken);
    const tenantName = tenantObject.subdomain;

    let ed = await payrollService.getEvolutionEarningAndDeduction(tenantName, evolutionKeys, payrollApiAccessToken);
    if (method === 'patch') {
        ed = applyDirectDepositBusinessRules(ed, amount, amountType);
    } else if (method === 'delete') {
        ed.effectiveEndDate = new Date().toISOString();
    }
    await payrollService.updateEvolutionEarningAndDeduction(tenantName, evolutionKeys, payrollApiAccessToken, ed);
}

/**
 * Retrieves the Evolution-equivalent of HR entities ids.
 * @param {string} tenantId: The unique identifier of the tenant.
 * @param {number} directDepositId: The direct deposit identifier.
 */
async function getEvolutionKeys(tenantId: string, directDepositId: number): Promise<IEvolutionKey | undefined> {
    const getEvoDataQuery = new ParameterizedQuery('GetEvoData', Queries.getEvoData);
    getEvoDataQuery.setParameter('@id', directDepositId);
    const payload = {
        tenantId,
        queryName: getEvoDataQuery.name,
        query: getEvoDataQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const evoDataResultSet: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

    if (evoDataResultSet.recordset.length === 1) {
        return {
            clientId: evoDataResultSet.recordset[0].clientId,
            companyId: evoDataResultSet.recordset[0].companyId,
            employeeId: evoDataResultSet.recordset[0].employeeId,
            earningsAndDeductionsId: evoDataResultSet.recordset[0].earningsAndDeductionsId,
        };
    }

    return undefined;
}

/**
 * Applies the business rules on updates to an existing and approved direct deposit
 * in Evolution Payroll.
 * @param {any} ed: The earning and deduction associated with the direct deposit.
 * @param {number} amount: The amount tied to the direct deposit.
 * @param {string} amountType: The type of amount.
 */
function applyDirectDepositBusinessRules(ed: any, amount: number, amountType: string): any {
    switch (amountType) {
        // tslint:disable no-null-keyword
        case 'Balance Remainder':
            ed.deductWholeCheck = true;
            ed.calculation.method = 'None';
            ed.calculation.amount = null;
            ed.calculation.rate = null;
            break;

        case 'Flat':
            ed.deductWholeCheck = false;
            ed.calculation.method = 'Fixed';
            ed.calculation.amount = amount;
            ed.calculation.rate = null;
            ed.employeeTakeHomePay = null;
            break;

        case 'Percentage':
            ed.deductWholeCheck = false;
            ed.calculation.method = 'PercOfNet';
            ed.calculation.amount = null;
            ed.calculation.rate = amount;
            break;

        default: // added per TS lint rules
    }

    // Default rules applied:
    ed.deductionToZero = true;
    ed.isEnabled = true;
    ed.isIgnoredWhenAlone = false;
    ed.applyToCurrentPayroll = false;
    ed.monthNumber = 0;
    ed.payrollsToDeduct = 'All';
    ed.useSystemPensionLimit = false;
    ed.applyStateTaxCredit = true;
    ed.garnishment.minimumWageMultiplier = null;
    ed.garnishment.maximumPercentage = null;
    ed.target.action = 'None';

    // tslint:enable no-null-keyword

    return ed;
}

/**
 *  Swaps an HR access token for a Payroll API access token.
 * @param {string} hrAccessToken: The access token for the HR user.
 * @param {string} tenantId: The unqiue identifier for the tenant.
 * @param {IPayrollApiCredentials} payrollApiCredentials: The credentials of the user to access the Payroll API
 * @return {string}: A Promise of the access token to access the Payroll API with.
 */
async function getPayrollApiToken(hrAccessToken: string, tenantId: string, payrollApiCredentials: IPayrollApiCredentials): Promise<string> {
    const decodedToken: any = jwt.decode(hrAccessToken);
    const ssoToken = await utilService.getSSOToken(tenantId, decodedToken.applicationId);
    return await ssoService.getAccessToken(tenantId, ssoToken, payrollApiCredentials.evoApiUsername, payrollApiCredentials.evoApiPassword);
}

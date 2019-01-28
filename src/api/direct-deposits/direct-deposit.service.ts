import * as directDepositDao from './direct-deposit.dao';

import { ConnectionPool, IResult } from 'mssql';
import { Queries } from '../../queries/queries';
import { DirectDeposit } from './directDeposit';

import { IEvolutionKey } from '../../models/IEvolutionKey';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { DirectDeposits } from './directDeposits';

import * as jwt from 'jsonwebtoken';
import * as configService from '../../config.service';
import * as errorService from '../../errors/error.service';
import { ErrorMessage } from '../../errors/errorMessage';
import { IQuery, Query } from '../../queries/query';
import * as payrollService from '../../remote-services/payroll.service';
import * as ssoService from '../../remote-services/sso.service';
import * as utilService from '../../util.service';

import { ConnectionString, findConnectionString } from '../../dbConnections';
import { IPayrollApiCredentials } from '../../models/IPayrollApiCredentials';

/**
 * Returns a listing of direct deposits for specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @returns {Promise<DiectDeposits>}: Promise of an array of direct deposits
 */
export async function list(employeeId: string, tenantId: string): Promise<DirectDeposits> {
    console.info('directDepositService.list');

    // employeeId value must be integral
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await directDepositDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const query = new ParameterizedQuery('DirectDepositListAll', Queries.directDepositList);
        query.setParameter('@employeeId', employeeId);

        const resultSet = await getResultSet(pool, query);

        return new DirectDeposits(resultSet);
    } catch (error) {
        console.error(error);
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

/**
 * Creates a direct deposit for a specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @returns {Promise<DiectDeposit>}: Promise of a direct deposits
 */
export async function create(employeeId: string, tenantId: string, requestBody: DirectDeposit): Promise<DirectDeposit> {
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

    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await directDepositDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const bankAccountQuery = await getDuplicateBankAccountQuery(routingNumber, accountNumber, designation);
        let duplicatesQuery;
        if (amountType === 'Balance Remainder') {
            const remainderOfPayQuery = await getDuplicateRemainderOfPayQuery(employeeId);
            duplicatesQuery = bankAccountQuery.union(remainderOfPayQuery);
        }
        await executeDuplicatesQuery(pool, duplicatesQuery || bankAccountQuery);

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

        const createResult: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), createQuery);
        const createdId: number = createResult.recordset[0].ID;

        let resultSet: DirectDeposit[] = [];
        if (createdId) {
            const getQuery = new ParameterizedQuery('GetDirectDeposit', Queries.getDirectDeposit);
            getQuery.setParameter('@directDepositId', createdId);
            resultSet = await getResultSet(pool, getQuery);
        }

        return new DirectDeposit(resultSet[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
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
    payrollApiCredentials: IPayrollApiCredentials,
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

    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await directDepositDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        if (amountType === 'Balance Remainder') {
            const remainderOfPayQuery = await getDuplicateRemainderOfPayQuery(employeeId);
            await executeDuplicatesQuery(pool, remainderOfPayQuery);
        }

        const directDeposits: DirectDeposit[] = await getEmployeeDirectDepositById(pool, id, employeeId);
        if (directDeposits.length === 0) {
            const errorMessage = `Resource with id ${id} does not exist.`;
            throw errorService.getErrorResponse(50).setDeveloperMessage(errorMessage);
        }

        const directDeposit = directDeposits[0];

        if (directDeposit.status === 'Approved') {
            const evolutionKeys: IEvolutionKey = await getEvolutionKeys(pool, directDeposit.id);
            if (!utilService.hasAllKeysDefined(evolutionKeys)) {
                throw errorService.getErrorResponse(0);
            }
            await updateEvolutionDirectDeposit(accessToken, tenantId, evolutionKeys, payrollApiCredentials, amount, amountType, method);
        }

        return await updateDirectDeposit(pool, id, amount, amountType);
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

/**
 * Deletes a direct deposit for a specific employee within a tenant
 * @param {string} employeeId: The unique identifier for the employee
 * @param {string} tenantId: The unique identifier for the tenant the employee belongs to.
 * @param {string} id: The unique identifier of the direct deposit resource to update.
 * @param {string} accessToken: The access token for the user.
 * @param {IPayrollApiCredentials} payrollApiCredentials: The credentials of the HR global admin.
 */
export async function remove(
    employeeId: string,
    tenantId: string,
    id: string,
    accessToken: string,
    payrollApiCredentials: IPayrollApiCredentials,
): Promise<void> {
    console.info('directDepositService.delete');

    const method = 'delete';

    // id and employeeId value must be integral
    if (Number.isNaN(Number(id))) {
        const errorMessage = `${id} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await directDepositDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const directDeposits: DirectDeposit[] = await getEmployeeActiveDirectDepositById(pool, id, employeeId);
        if (directDeposits.length === 0) {
            const errorMessage = `Resource with id ${id} does not exist.`;
            throw errorService.getErrorResponse(50).setDeveloperMessage(errorMessage);
        }

        const directDeposit = directDeposits[0];

        if (directDeposit.status === 'Pending') {
            await deleteDirectDeposit(pool, id);
        } else if (directDeposit.status === 'Approved') {
            await endDateDirectDeposit(pool, id);
            const evolutionKeys: IEvolutionKey = await getEvolutionKeys(pool, directDeposit.id);
            if (!utilService.hasAllKeysDefined(evolutionKeys)) {
                throw errorService.getErrorResponse(0);
            }
            await updateEvolutionDirectDeposit(accessToken, tenantId, evolutionKeys, payrollApiCredentials, 0, '', method);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

/**
 * Updates an existing direct deposit
 * @param {ConnectionPool} pool:  The open connection to the database.
 * @param {number} amount: The direct deposit amount
 * @param {string} amountType: The type of amount for the direct deposit.
 */
async function updateDirectDeposit(
    pool: ConnectionPool,
    directDepositId: string,
    amount: number,
    amountType: string,
): Promise<DirectDeposit> {
    const updateQuery = new ParameterizedQuery('DirectDepositUpdate', Queries.directDepositUpdate);

    // Truncate the amount field by removing excess decimal places. This will not round the value.
    const truncatedAmount = parseInt('' + amount * 100, 10) / 100 || 0;
    updateQuery.setParameter('@id', directDepositId);
    updateQuery.setParameter('@amountType', amountType);
    updateQuery.setParameter('@amount', truncatedAmount);

    await directDepositDao.executeQuery(pool.transaction(), updateQuery);

    const getQuery = new ParameterizedQuery('GetDirectDeposit', Queries.getDirectDeposit);
    getQuery.setParameter('@directDepositId', directDepositId);
    const directDepositResultSet = await getResultSet(pool, getQuery);

    return new DirectDeposit(directDepositResultSet[0]);
}

/**
 * Deletes an existing direct deposit.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} directDepositId: The unique identifier of the direct deposit
 */
async function deleteDirectDeposit(pool: ConnectionPool, directDepositId: string): Promise<void> {
    const deleteQuery = new ParameterizedQuery('DirectDepositDelete', Queries.directDepositDelete);
    deleteQuery.setParameter('@directDepositId', directDepositId);

    await directDepositDao.executeQuery(pool.transaction(), deleteQuery);
}

/**
 * Updates the end date of an existing direct deposit
 * @param {ConnectionPool} pool:  The open connection to the database.
 * @param {string} directDepositId: The unique identifier of the direct deposit
 */
async function endDateDirectDeposit(pool: ConnectionPool, directDepositId: string): Promise<void> {
    const endDateQuery = new ParameterizedQuery('DirectDepositDelete', Queries.updateDirectDepositEndDate);
    endDateQuery.setParameter('@directDepositId', directDepositId);

    await directDepositDao.executeQuery(pool.transaction(), endDateQuery);
}

/**
 * Executes the specified query and returns the result as a DirectDeposit
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {IQuery} query: The query to run against the database.
 * @returns {Promise<DiectDeposit[]>}: Promise of an array of direct deposits
 */
async function getResultSet(pool: ConnectionPool, query: IQuery): Promise<DirectDeposit[]> {
    const result: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), query);
    return (result.recordset || []).map((entry) => {
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
}

/**
 * Checks if a specified direct deposit exists
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} directDepositId: The direct deposit identifier.
 * @param {string} employeeId: The employee's identifier.
 * @returns {Promise<DirectDeposit[]>}: Promise of an array of Direct Deposits
 */
function getEmployeeDirectDepositById(pool: ConnectionPool, directDepositId: string, employeeId: string): Promise<DirectDeposit[]> {
    const directDepositQuery = new ParameterizedQuery('GetDirectDepositById', Queries.getDirectDeposit);
    const employeeFilterCondition = `EmployeeID = ${employeeId}`;
    directDepositQuery.appendFilter(employeeFilterCondition);
    directDepositQuery.setParameter('@directDepositId', directDepositId);
    return getResultSet(pool, directDepositQuery);
}

/**
 * Checks if a specified direct deposit exists and does not have an end date
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} directDepositId: The direct deposit identifier.
 * @param {string} employeeId: The employee's identifier.
 * @returns {Promise<DirectDeposit[]>}: Promise of an array of Direct Deposits
 */
async function getEmployeeActiveDirectDepositById(
    pool: ConnectionPool,
    directDepositId: string,
    employeeId: string,
): Promise<DirectDeposit[]> {
    const directDepositQuery = new ParameterizedQuery('GetActiveDirectDepositById', Queries.getDirectDeposit);
    const employeeFilterCondition = `EmployeeID = ${employeeId}`;
    const endDateFilterCondition = 'EndDate is NULL';
    directDepositQuery.appendFilter(employeeFilterCondition);
    directDepositQuery.appendFilter(endDateFilterCondition);
    directDepositQuery.setParameter('@directDepositId', directDepositId);
    return getResultSet(pool, directDepositQuery);
}

/**
 * Executes queries that check for duplicate bank accounts and
 * duplicate remainder of pay direct deposits in the database.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} routingNumber: The routing number of the bank account.
 * @param {string} accountNumber: The account number of the bank account.
 * @param {string} designation: The bank account type.
 * @param {string} amountType: The direct deposit type.
 * @param {string} employeeId: The unique identifier of the employee.
 */
async function executeDuplicatesQuery(pool: ConnectionPool, query: Query): Promise<void> {
    const duplicatesResult: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), query);
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
): Promise<ParameterizedQuery> {
    const bankAccountsQuery = new ParameterizedQuery('CheckForDuplicateBankAccounts', Queries.checkForDuplicateBankAccounts);
    bankAccountsQuery.setParameter('@routingNumber', routingNumber);
    bankAccountsQuery.setParameter('@accountNumber', accountNumber);
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
    const tenantName = tenantObject.name;

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
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {number} directDepositId: The direct deposit identifier.
 */
async function getEvolutionKeys(pool: ConnectionPool, directDepositId: number): Promise<IEvolutionKey | undefined> {
    const getEvoDataQuery = new ParameterizedQuery('GetEvoData', Queries.getEvoData);
    getEvoDataQuery.setParameter('@id', directDepositId);
    const evoDataResultSet: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), getEvoDataQuery);

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

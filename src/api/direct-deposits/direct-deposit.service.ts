import * as directDepositDao from './direct-deposit.dao';

import { ConnectionPool, IResult } from 'mssql';
import { Queries } from '../../queries/queries';
import { DirectDeposit } from './directDeposit';

import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { DirectDeposits } from './directDeposits';

import * as configService from '../../config.service';
import * as dbConnections from '../../dbConnections';
import * as errorService from '../../errors/error.service';
import { ErrorMessage } from '../../errors/errorMessage';
import { IQuery, Query } from '../../queries/query';
import * as utilService from '../../util.service';

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
    const connectionString = dbConnections.findConnectionString(tenantId);
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
      bankAccount: {
          routingNumber,
          accountNumber,
          designation
      }
  } = requestBody;

  // employeeId value must be integral
  if (Number.isNaN(Number(employeeId))) {
    const errorMessage = `${employeeId} is not a valid number`;
    throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
  }

  let pool: ConnectionPool;

  try {
    const connectionString = dbConnections.findConnectionString(tenantId);
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
    const truncatedAmount = (parseInt('' + (amount * 100), 10) / 100) || 0;
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
 * @returns {Promise<DiectDeposit>}: Promise of a direct deposit
 */
export async function update(employeeId: string, tenantId: string, requestBody: DirectDeposit, id: string): Promise<DirectDeposit> {
  console.info('directDepositService.update');

  const {
      amount,
      amountType,
  } = requestBody;

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
    const connectionString = dbConnections.findConnectionString(tenantId);
    const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

    pool = await directDepositDao.createConnectionPool(
        rdsCredentials.username,
        rdsCredentials.password,
        connectionString.rdsEndpoint,
        connectionString.databaseName,
    );

    const exists: boolean = await checkIfDirectDepositExists(pool, id, employeeId);
    if (!exists) {
        const errorMessage = `Resource with id ${id} does not exist.`;
        throw errorService.getErrorResponse(50).setDeveloperMessage(errorMessage);
    }

    if (amountType === 'Balance Remainder') {
        const remainderOfPayQuery = await getDuplicateRemainderOfPayQuery(employeeId);
        await executeDuplicatesQuery(pool, remainderOfPayQuery);
    }

    const updateQuery = new ParameterizedQuery('DirectDepositUpdate', Queries.directDepositUpdate);
    // Truncate the amount field by removing excess decimal places. This will not round the value.
    const truncatedAmount = (parseInt('' + (amount * 100), 10) / 100) || 0;
    updateQuery.setParameter('@id', id);
    updateQuery.setParameter('@amountType', amountType);
    updateQuery.setParameter('@amount', truncatedAmount);

    await directDepositDao.executeQuery(pool.transaction(), updateQuery);

    const getQuery = new ParameterizedQuery('GetDirectDeposit', Queries.getDirectDeposit);
    getQuery.setParameter('@directDepositId', id);
    const resultSet = await getResultSet(pool, getQuery);

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
 * @returns {Promise<boolean>}: A boolean promise.
 */
async function checkIfDirectDepositExists(pool: ConnectionPool, directDepositId: string, employeeId: string): Promise<boolean> {
    const resourceExistsQuery = new ParameterizedQuery('CheckThatResourceExists', Queries.checkThatResourceExists);
    resourceExistsQuery.setParameter('@id', directDepositId);
    resourceExistsQuery.setParameter('@employeeId', employeeId);
    const result: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), resourceExistsQuery);
    const resultSet: any[] = result.recordset;

    return !(resultSet.length === 0);
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

async function getDuplicateBankAccountQuery(routingNumber: string, accountNumber: string, designation: string): Promise<ParameterizedQuery> {
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
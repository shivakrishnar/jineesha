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
import { IQuery } from '../../queries/query';
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
      },
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

    await checkForDuplicates(pool, routingNumber, accountNumber, designation);

    const createQuery = new ParameterizedQuery('DirectDepositCreate', Queries.directDepositCreate);
    // Truncate the amount field by removing excess decimal places. This will not round the value.
    const truncatedAmount = parseInt('' + (amount * 100), 10) / 100;
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
 * Executes a query that checks for duplicate direct deposits in the database.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} routingNumber: The routing number of the bank account.
 * @param {string} accountNumber: The account number of the bank account.
 * @param {string} designation: The bank account type.
 */
async function checkForDuplicates(pool: ConnectionPool, routingNumber: string, accountNumber: string, designation: string): Promise<void> {
    const checkForDuplicatesQuery = new ParameterizedQuery('CheckForDuplicateDirectDeposits', Queries.checkForDuplicateDirectDeposits);
    checkForDuplicatesQuery.setParameter('@routingNumber', routingNumber);
    checkForDuplicatesQuery.setParameter('@accountNumber', accountNumber);
    if (designation === 'Checking') {
        checkForDuplicatesQuery.setParameter('@designationColumnName', 'Checking');
    } else if (designation === 'Savings') {
        checkForDuplicatesQuery.setParameter('@designationColumnName', 'IsSavings');
    } else {
        checkForDuplicatesQuery.setParameter('@designationColumnName', 'IsMoneyMarket');
    }
    const duplicatesResult: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), checkForDuplicatesQuery);
    const duplicates: any[] = duplicatesResult.recordset;

    if (duplicates.length > 0) {
        const moreInfo = 'Routing number, account number and designation must be collectively unique.';
        throw errorService.getErrorResponse(40).setMoreInfo(moreInfo);
    }
}
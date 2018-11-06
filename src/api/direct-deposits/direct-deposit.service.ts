import * as directDepositDao from './direct-deposit.dao';

import { ConnectionPool, IResult } from 'mssql';
import { Queries } from '../../queries/queries';
import { DirectDeposit } from './directDeposit';

import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { DirectDeposits } from './directDeposits';

import * as configService from '../../config.service';
import * as dbConnections from '../../dbConnections';
import * as errorService from '../../errors/error.service';
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

    const result: IResult<any>  = await directDepositDao.executeQuery(pool.transaction(), query);
    console.log(result);
    const resultSet: DirectDeposit[] = (result.recordset || []).map((entry) => {
        return new DirectDeposit({
            id: Number(entry.id),
            amount: Number(parseFloat(entry.amount).toFixed(2)),
            bankAccount: {
                routingNumber: entry.routingNumber,
                accountNumber: entry.accountNumber,
                designation: entry.designation,
                accountHolder: entry.accountHolder,
            },
            amountType: entry.amountType,
            status: entry.status,
        });
    });

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
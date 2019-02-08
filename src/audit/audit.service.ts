import { ConnectionPool, IResult } from 'mssql';
import * as configService from '../config.service';
import { ConnectionString, findConnectionString } from '../dbConnections';
import { ParameterizedQuery } from '../queries/parameterizedQuery';
import { Queries } from '../queries/queries';
import * as utilService from '../util.service';
import { IAudit } from './audit';
import * as auditDao from './audit.dao';

/**
 * Logs an event to the audit trail.
 * @param {IAudit} audit: The audit information to log.
 * @return {boolean}: true if an audit event is successfully logged; false, otherwise.
 */
export async function logAudit(audit: IAudit): Promise<boolean> {
    console.info('audit.service.logAudit');

    const { isEvoCall, userEmail, tenantId, employeeId } = audit;

    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await auditDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const transactionName = await getTransactionName(isEvoCall, audit);
        const auditId = await createAuditEntry(pool, transactionName, userEmail);

        if (auditId && !isEvoCall) {
            const employeeDisplayName = await getEmployeeDisplayName(pool, employeeId);
            await createAuditDetailEntries(pool, auditId, audit, employeeDisplayName);
        }
        return true;
    } catch (error) {
        console.error(`error creating audit: ${error}`);
        return false;
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

/**
 * Constructs a transaction name for the audit.
 * @param {boolean} isEvoCall: Indicates whether or not the current transaction is a call to Evolution.
 * @param {IAudit} audit: The audit information to log.
 * @return {string}: The transaction name.
 */
async function getTransactionName(isEvoCall: boolean, audit: IAudit): Promise<string> {
    const { areaOfChange, type, companyId, evoCompanyId } = audit;

    if (isEvoCall) {
        return `Evolution Integration - EVO ${areaOfChange} ${type} from HR ID: ${companyId}, EVO ID: ${evoCompanyId}, At: ${new Date().toLocaleString()}`;
    } else {
        return new Date().toISOString().replace(/\D/g, ''); // removes all non-digit characters from the date string
    }
}

/**
 * Creates an audit entry.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} transacationName: The name of the transaction.
 * @param {string} userEmail: The email address of the current user.
 * @return {number}: The unique identifier of the audit entry.
 */
async function createAuditEntry(pool: ConnectionPool, transactionName: string, userEmail: string): Promise<number> {
    const createAuditQuery = new ParameterizedQuery('CreateAuditEntry', Queries.createAuditEntry);
    createAuditQuery.setParameter('@transactionName', transactionName);
    createAuditQuery.setParameter('@userEmail', userEmail);

    const auditResult: IResult<any> = await auditDao.executeQuery(pool.transaction(), createAuditQuery);
    return auditResult.recordset[0].auditId;
}

/**
 * Retrieves the current employee's display name and returns it in the correct format.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} employeeId: The unique identifier of the current employee.
 * @return {string}: The employee's display name in the correct format.
 */
async function getEmployeeDisplayName(pool: ConnectionPool, employeeId: string): Promise<string> {
    const query = new ParameterizedQuery('GetEmployeeDisplayNameById', Queries.getEmployeeDisplayNameById);
    query.setParameter('@employeeId', employeeId);

    const result: IResult<any> = await auditDao.executeQuery(pool.transaction(), query);
    const record = result.recordset[0];
    return `${record.CurrentDisplayName} (${record.EmployeeCode})`;
}

/**
 * Creates audit detail entries for the current audit.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {number} auditId: The unique identifier of the audit.
 * @param {IAudit} audit: The audit information to log.
 * @param {string} employeeDisplayName: The employee's display name.
 */
async function createAuditDetailEntries(pool: ConnectionPool, auditId: number, audit: IAudit, employeeDisplayName: string): Promise<void> {
    const { oldFields, newFields, type, companyId, areaOfChange } = audit;

    const fieldKeys = Object.keys(oldFields || newFields);
    const oldValues: any[] = oldFields ? Object.values(oldFields) : [];
    const newValues: any[] = newFields ? Object.values(newFields) : [];
    const auditDetailQuery = new ParameterizedQuery('CreateBatchAuditDetail', '');
    for (let i = 0; i < fieldKeys.length; i++) {
        const fieldQuery = new ParameterizedQuery(`CreateAuditDetailFor${fieldKeys[i]}`, Queries.createAuditDetailEntry);
        fieldQuery.setParameter('@auditId', auditId);
        fieldQuery.setParameter('@companyId', companyId);
        fieldQuery.setParameter('@affectedEmployee', employeeDisplayName);
        fieldQuery.setParameter('@actionType', type);
        fieldQuery.setParameter('@fieldChanged', fieldKeys[i]);
        // tslint:disable no-null-keyword
        fieldQuery.setParameter('@oldValue', [undefined, null, 'null'].includes(oldValues[i]) ? '[Blank]' : oldValues[i]);
        fieldQuery.setParameter('@newValue', [undefined, null, 'null'].includes(newValues[i]) ? '[Blank]' : newValues[i]);
        // tslint:enable no-null-keyword
        fieldQuery.setParameter('@areaOfChange', areaOfChange);
        auditDetailQuery.appendFilter(fieldQuery.value, false);
    }
    await auditDao.executeQuery(pool.transaction(), auditDetailQuery);
}

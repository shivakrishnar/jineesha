import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { Queries } from '../../queries/queries';

import * as utilService from '../../util.service';
import { InvocationType } from '../../util.service';
import { DatabaseEvent, QueryType } from '../database/events';
import { IAudit } from './audit';

/**
 * Logs an event to the audit trail.
 * @param {IAudit} audit: The audit information to log.
 * @return {boolean}: true if an audit event is successfully logged; false, otherwise.
 */
export async function logAudit(audit: IAudit): Promise<boolean> {
    console.info('audit.service.logAudit');

    const { isEvoCall, userEmail, tenantId, employeeId } = audit;

    try {
        const transactionName = await getTransactionName(isEvoCall, audit);
        const auditId = await createAuditEntry(tenantId, transactionName, userEmail);

        if (auditId && !isEvoCall) {
            const employeeDisplayName = await getEmployeeDisplayName(tenantId, employeeId);
            await createAuditDetailEntries(tenantId, auditId, audit, employeeDisplayName);
        }
        return true;
    } catch (error) {
        console.error(`error creating audit: ${error}`);
        return false;
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
async function createAuditEntry(tenantId: string, transactionName: string, userEmail: string): Promise<number> {
    const createAuditQuery = new ParameterizedQuery('CreateAuditEntry', Queries.createAuditEntry);
    createAuditQuery.setParameter('@transactionName', transactionName);
    createAuditQuery.setParameter('@userEmail', userEmail);

    const payload = {
        tenantId,
        queryName: createAuditQuery.name,
        query: createAuditQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const auditResult: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
    return auditResult.recordset[0].auditId;
}

/**
 * Retrieves the current employee's display name and returns it in the correct format.
 * @param {ConnectionPool} pool: The open connection to the database.
 * @param {string} employeeId: The unique identifier of the current employee.
 * @return {string}: The employee's display name in the correct format.
 */
async function getEmployeeDisplayName(tenantId: string, employeeId: string): Promise<string> {
    const query = new ParameterizedQuery('GetEmployeeInfoById', Queries.getEmployeeInfoById);
    query.setParameter('@employeeId', employeeId);

    const payload = {
        tenantId,
        queryName: query.name,
        query: query.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
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
async function createAuditDetailEntries(tenantId: string, auditId: number, audit: IAudit, employeeDisplayName: string): Promise<void> {
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

    const payload = {
        tenantId,
        queryName: auditDetailQuery.name,
        query: auditDetailQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    await utilService.invokeInternalService('queryExecutor', payload, InvocationType.Event);
}

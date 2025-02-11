import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { AuditActionType, AuditAreaOfChange, IAudit } from '../../../internal-api/audit/audit';


/**
 * Returns a list of ATApplicationStatusHistory by id.
 */
export async function getApplicationStatusHistoryById(
    tenantId: string,
    companyId: string,
    id: string
): Promise<atInterfaces.IApplicationStatusHistoryGET> {
    console.info('ApplicationStatusHistory.Service.getApplicationStatusHistoryById');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    //
    // getting data
    //
    try {
        const query = new ParameterizedQuery('getApplicationStatusHistoryById', Queries.getApplicationStatusHistoryById);
        query.setParameter('@id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IApplicationStatusHistoryGET = dbResults.recordset[0];

        if (result && result.companyId.toString() != companyId){
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        return result;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a list of ATApplicationStatusHistory by tenant.
 */
export async function getApplicationStatusHistoryByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('ApplicationStatusHistory.Service.getApplicationStatusHistoryByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getApplicationStatusHistoryByTenant', Queries.getApplicationStatusHistoryByTenant);
        const searchBy: string = queryParams && queryParams.searchBy ? queryParams.searchBy : '';
        query.setStringParameter('@searchBy', searchBy);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.IApplicationStatusHistoryGET[] = dbResults.recordsets[1];
        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a list of ATApplicationStatusHistory by company.
 */
export async function getApplicationStatusHistoryByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('ApplicationStatusHistory.Service.getApplicationStatusHistoryByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    const companyIds = companyId.split("-");
    companyIds.forEach(id => {
        if (Number.isNaN(Number(id))) {
            const errorMessage = `${id} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });

    try {
        const query = new ParameterizedQuery('getApplicationStatusHistoryByCompany', Queries.getApplicationStatusHistoryByCompany);
        query.setStringParameter('@companyId', companyId);
        const searchBy: string = queryParams && queryParams.searchBy ? queryParams.searchBy : '';
        query.setStringParameter('@searchBy', searchBy);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.IApplicationStatusHistoryGET[] = dbResults.recordsets[1];
        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Create ATApplicationStatusHistory.
 */
export async function createApplicationStatusHistory(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationStatusHistoryPOST
): Promise<atInterfaces.IApplicationStatusHistoryGET> {
    console.info('ApplicationStatusHistory.Service.createApplicationStatusHistory');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (requestBody.statusChangedDate && Number.isNaN(Date.parse(requestBody.statusChangedDate.toString()))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${requestBody.statusChangedDate} is not a valid date`);
    }

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createApplicationStatusHistory', Queries.createApplicationStatusHistory);
        query.setParameter('@ATApplicationID', requestBody.atApplicationId);
        query.setDateOrNullParameter('@StatusChangedDate', requestBody.statusChangedDate?.toString());
        query.setStringOrNullParameter('@StatusChangedByUsername', requestBody.statusChangedByUsername);
        query.setStringOrNullParameter('@ChangedStatusTitle', requestBody.changedStatusTitle);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const queryResult: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const id: any = queryResult.recordset[0].ID;
        if (id) {
            //
            // getting data
            //
            const apiresult = await getApplicationStatusHistoryById(tenantId, companyId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.statusChangedByUsername = utilService.sanitizeStringForSql(logResult.statusChangedByUsername);
            logResult.changedStatusTitle = utilService.sanitizeStringForSql(logResult.changedStatusTitle);
            delete logResult.companyId;
            delete logResult.companyName;

            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: companyId,
                areaOfChange: AuditAreaOfChange.ApplicantTracking,
                tenantId,
            } as IAudit);

            //
            // api response
            //
            return apiresult;
        } else {
            throw errorService.getErrorResponse(74).setDeveloperMessage('Was not possible to create the resource');
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Update ATApplicationStatusHistory.
 */
export async function updateApplicationStatusHistory(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationStatusHistoryPUT
): Promise<Boolean> {
    console.info('ApplicationStatusHistory.Service.updateApplicationStatusHistory');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (requestBody.statusChangedDate && Number.isNaN(Date.parse(requestBody.statusChangedDate.toString()))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${requestBody.statusChangedDate} is not a valid date`);
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getApplicationStatusHistoryById(tenantId, companyId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId.toString() != companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateApplicationStatusHistory', Queries.updateApplicationStatusHistory);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@ATApplicationID', requestBody.atApplicationId);
        query.setDateOrNullParameter('@StatusChangedDate', requestBody.statusChangedDate?.toString());
        query.setStringOrNullParameter('@StatusChangedByUsername', requestBody.statusChangedByUsername);
        query.setStringOrNullParameter('@ChangedStatusTitle', requestBody.changedStatusTitle);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        //
        // auditing log
        //
        const logResult = { ...requestBody };
        logResult.statusChangedByUsername = utilService.sanitizeStringForSql(logResult.statusChangedByUsername);
        logResult.changedStatusTitle = utilService.sanitizeStringForSql(logResult.changedStatusTitle);
        oldValues.statusChangedByUsername = utilService.sanitizeStringForSql(oldValues.statusChangedByUsername);
        oldValues.changedStatusTitle = utilService.sanitizeStringForSql(oldValues.changedStatusTitle);
        delete oldValues.companyId;
        delete oldValues.companyName;

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            newFields: logResult,
            type: AuditActionType.Update,
            companyId: companyId,
            areaOfChange: AuditAreaOfChange.ApplicantTracking,
            tenantId,
        } as IAudit);

        //
        // api response
        //
        return true;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Delete ATApplicationStatusHistory.
 */
export async function deleteApplicationStatusHistory(
    tenantId: string,
    companyId: string,
    userEmail: string,
    id: string
): Promise<boolean> {
    console.info('ApplicationStatusHistory.Service.deleteApplicationStatusHistory');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getApplicationStatusHistoryById(tenantId, companyId, id);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId.toString() != companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // deleting data
        //
        const query = new ParameterizedQuery('deleteApplicationStatusHistory', Queries.deleteApplicationStatusHistory);
        query.setParameter('@ID', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        //
        // auditing log
        //
        oldValues.statusChangedByUsername = utilService.sanitizeStringForSql(oldValues.statusChangedByUsername);
        oldValues.changedStatusTitle = utilService.sanitizeStringForSql(oldValues.changedStatusTitle);
        delete oldValues.companyId;
        delete oldValues.companyName;

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            type: AuditActionType.Delete,
            companyId: companyId,
            areaOfChange: AuditAreaOfChange.ApplicantTracking,
            tenantId,
        } as IAudit);

        //
        // api response
        //
        return true;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

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
 * Returns a list of Systems by id.
 */
export async function getSystemsById(
    tenantId: string,
    id: string
): Promise<atInterfaces.ISystemsGET> {
    console.info('Systems.Service.getSystemsById');

    //
    // validation
    //
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    //
    // getting data
    //
    try {
        const query = new ParameterizedQuery('getSystemsById', Queries.getSystemsById);
        query.setParameter('@id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.ISystemsGET = dbResults.recordset[0];

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
 * Returns a list of Systems by tenant.
 */
export async function getSystemsByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('Systems.Service.getSystemsByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getSystemsByTenant', Queries.getSystemsByTenant);
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
        const results: atInterfaces.ISystemsGET[] = dbResults.recordsets[1];
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
 * Create Systems.
 */
export async function createSystems(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.ISystemsPOST
): Promise<atInterfaces.ISystemsGET> {
    console.info('Systems.Service.createSystems');

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createSystems', Queries.createSystems);
        query.setStringParameter('@Name', requestBody.name);
        query.setStringParameter('@Description', requestBody.description);

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
            const apiresult = await getSystemsById(tenantId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.name = utilService.sanitizeStringForSql(logResult.name);
            logResult.description = utilService.sanitizeStringForSql(logResult.description);

            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: null,
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
 * Update Systems.
 */
export async function updateSystems(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.ISystemsPUT
): Promise<Boolean> {
    console.info('Systems.Service.updateSystems');

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getSystemsById(tenantId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateSystems', Queries.updateSystems);
        query.setParameter('@ID', requestBody.id);
        query.setStringParameter('@Name', requestBody.name);
        query.setStringParameter('@Description', requestBody.description);

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
        logResult.name = utilService.sanitizeStringForSql(logResult.name);
        logResult.description = utilService.sanitizeStringForSql(logResult.description);

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            newFields: logResult,
            type: AuditActionType.Update,
            companyId: null,
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
 * Delete Systems.
 */
export async function deleteSystems(
    tenantId: string,
    userEmail: string,
    id: string
): Promise<boolean> {
    console.info('Systems.Service.deleteSystems');

    //
    // validation
    //
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getSystemsById(tenantId, id);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }

        //
        // deleting data
        //
        const query = new ParameterizedQuery('deleteSystems', Queries.deleteSystems);
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
        oldValues.name = utilService.sanitizeStringForSql(oldValues.name);
        oldValues.description = utilService.sanitizeStringForSql(oldValues.description);

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            type: AuditActionType.Delete,
            companyId: null,
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

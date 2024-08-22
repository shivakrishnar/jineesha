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
 * Returns a list of Roles by id.
 */
export async function getRolesById(
    tenantId: string,
    id: string
): Promise<atInterfaces.IRolesGET> {
    console.info('Roles.Service.getRolesById');

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
        const query = new ParameterizedQuery('getRolesById', Queries.getRolesById);
        query.setParameter('@id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IRolesGET = dbResults.recordset[0];

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
 * Returns a list of Roles by tenant.
 */
export async function getRolesByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('Roles.Service.getRolesByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getRolesByTenant', Queries.getRolesByTenant);
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
        const results: atInterfaces.IRolesGET[] = dbResults.recordsets[1];
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
 * Create Roles.
 */
export async function createRoles(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IRolesPOST
): Promise<atInterfaces.IRolesGET> {
    console.info('Roles.Service.createRoles');

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createRoles', Queries.createRoles);
        query.setParameter('@SystemID', requestBody.systemId);
        query.setStringParameter('@Name', requestBody.name);
        query.setBooleanParameter('@IsAdmin', requestBody.isAdmin);

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
            const apiresult = await getRolesById(tenantId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.name = utilService.sanitizeStringForSql(logResult.name);
            delete logResult.systemName;

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
 * Update Roles.
 */
export async function updateRoles(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IRolesPUT
): Promise<Boolean> {
    console.info('Roles.Service.updateRoles');

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getRolesById(tenantId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateRoles', Queries.updateRoles);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@SystemID', requestBody.systemId);
        query.setStringParameter('@Name', requestBody.name);
        query.setBooleanParameter('@IsAdmin', requestBody.isAdmin);

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
        oldValues.name = utilService.sanitizeStringForSql(oldValues.name);
        delete oldValues.systemName;

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

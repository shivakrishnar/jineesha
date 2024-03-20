import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';

/**
 * Returns a list of ATApplicationVersion by tenant.
 */
export async function getApplicationVersionByTenant(
    tenantId: string,
    queryParams: any
): Promise<atInterfaces.IApplicationVersion[]> {
    console.info('ApplicationVersion.Service.getApplicationVersionByTenant');

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getApplicationVersionByTenant', Queries.getApplicationVersionByTenant);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.IApplicationVersion[] = dbResults.recordset;
        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a list of ATApplicationVersion by company.
 */
export async function getApplicationVersionByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any
): Promise<atInterfaces.IApplicationVersion[]> {
    console.info('ApplicationVersion.Service.getApplicationVersionByCompany');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getApplicationVersionByCompany', Queries.getApplicationVersionByCompany);
        query.setParameter('@CompanyID', companyId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.IApplicationVersion[] = dbResults.recordset;
        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a list of ATApplicationVersion by id.
 */
export async function getApplicationVersionById(
    tenantId: string,
    companyId: string,
    id: string,
    queryParams: any
): Promise<atInterfaces.IApplicationVersion> {
    console.info('ApplicationVersion.Service.getApplicationVersionById');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getApplicationVersionById', Queries.getApplicationVersionById);
        query.setParameter('@ID', id);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IApplicationVersion = dbResults.recordset[0];

        if (result && result.companyId.toString() != companyId){
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        return result;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}
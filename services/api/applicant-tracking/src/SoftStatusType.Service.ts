import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import * as paginationService from '../../../pagination/pagination.service';

/**
 * Returns a list of ATSoftStatusType by tenant.
 */
export async function getSoftStatusTypesByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('SoftStatusType.Service.getSoftStatusTypesByTenant');

    const validQueryStringParameters = ['pageToken'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getSoftStatusTypeByTenant', Queries.getSoftStatusTypeByTenant);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.ISoftStatusType[] = dbResults.recordsets[1];
        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a list of ATSoftStatusType by company.
 */
export async function getSoftStatusTypesByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any
): Promise<atInterfaces.ISoftStatusType[]> {
    console.info('SoftStatusType.Service.getSoftStatusTypesByCompany');

    //
    // validation
    //
    const companyIds = companyId.split("-");
    companyIds.forEach(id => {
        if (Number.isNaN(Number(id))) {
            const errorMessage = `${id} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });
    
    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getSoftStatusTypeByCompany', Queries.getSoftStatusTypeByCompany);
        query.setStringParameter('@CompanyID', companyId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.ISoftStatusType[] = dbResults.recordset;
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
 * Returns a list of ATSoftStatusType by id.
 */
export async function getSoftStatusTypesById(
    tenantId: string,
    companyId: string,
    id: string,
    queryParams: any
): Promise<atInterfaces.ISoftStatusType> {
    console.info('SoftStatusType.Service.getSoftStatusTypesById');

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
        const query = new ParameterizedQuery('getSoftStatusTypeById', Queries.getSoftStatusTypeById);
        query.setParameter('@Id', id);
        
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.ISoftStatusType = dbResults.recordset[0];

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

/**
 * Returns a list of ATSoftStatusType by Company and ATHardStatusType.
 */
export async function getSoftStatusTypesByCompanyAndHardStatusType(
    tenantId: string,
    companyId: string,
    hardStatusTypeId: string,
    queryParams: any
): Promise<atInterfaces.ISoftStatusType[]> {
    console.info('SoftStatusType.Service.getSoftStatusTypesByHardStatusType');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (Number.isNaN(Number(hardStatusTypeId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${hardStatusTypeId} is not a valid number`);
    }

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getSoftStatusTypesByCompanyAndHardStatusType', Queries.getSoftStatusTypesByCompanyAndHardStatusType);
        query.setParameter('@CompanyID', companyId);
        query.setParameter('@ATHardStatusTypeID', hardStatusTypeId);
        
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.ISoftStatusType[] = dbResults.recordset;
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
 * Returns a list of ATSoftStatusType by ATHardStatusType.
 */
export async function getSoftStatusTypesByHardStatusType(
    tenantId: string,
    hardStatusTypeId: string,
    queryParams: any
): Promise<atInterfaces.ISoftStatusType[]> {
    console.info('SoftStatusType.Service.getSoftStatusTypesByHardStatusType');

    //
    // validation
    //
    if (Number.isNaN(Number(hardStatusTypeId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${hardStatusTypeId} is not a valid number`);
    }

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getSoftStatusTypeByHardStatusType', Queries.getSoftStatusTypeByHardStatusType);
        query.setParameter('@ATHardStatusTypeID', hardStatusTypeId);
        
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.ISoftStatusType[] = dbResults.recordset;
        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

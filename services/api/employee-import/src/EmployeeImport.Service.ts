import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as paginationService from '../../../pagination/pagination.service';

import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { IDataImportType, IDataImportEventDetail, IDataImport } from './DataImport';

/**
 * Returns a listing of data importing type for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @returns {Promise<DataImportTypes>}: Promise of an array of DataImportType
 */
export async function listDataImportTypes(tenantId: string): Promise<IDataImportType[]> {
    console.info('tenantsService.listDataImportTypes');
    
    try {
        const query = new ParameterizedQuery('listDataImportTypes', Queries.listDataImportTypes);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        // This endpoint should return an empty list (not 404) if tenant not found in AHR.
        // This makes it easier for the caller to handle.
        if (!result || !result.recordset.length) {
            return [];
        }

        const results: IDataImportType[] = result.recordset.map((record) => {
            return {
                id: record.ID,
                name: record.Name,
                description: record.Description,
                importProcess: record.ImportProcess,
                lastProgramEvent: record.LastProgramEvent
            };
        });

        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            if (error.statusCode === 404) {
                return [];
            }
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a listing of data importing type for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @returns {Promise<DataImportTypes>}: Promise of an array of DataImportType
 */
export async function listDataImports(
    tenantId: string, 
    companyId: string, 
    dataImportTypeId: string, 
    queryParams: any,
    domainName: string,
    path: string): Promise<PaginatedResult> {
    console.info('companyService.listDataImports');
    
    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {

        let query = new ParameterizedQuery('listDataImportByCompany', Queries.listDataImportByCompany);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);
        }

        if (dataImportTypeId) {
            query = new ParameterizedQuery('listDataImportByCompanyAndDataImportType', Queries.listDataImportByCompanyAndDataImportType);
            query.setParameter('@dataImportTypeId', dataImportTypeId);
        }

        query.setParameter('@companyId', companyId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        
        if (result.recordsets[1].length === 0) {
            return undefined;
        }

        const totalCount = result.recordsets[0][0].totalCount;

        const results: IDataImport[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                companyId: record.CompanyID,
                dataImportTypeId: record.DataImportTypeID,
                status: record.Status,
                lastUserId: record.LastUserID,
                lastProgramEvent: record.LastProgramEvent,
                creationDate: record.CreationDate,
                lastUpdatedDate: record.LastUpdatedDate,
            };
        });

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
 * Returns a listing of data importing type for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @returns {Promise<DataImportEventDetails>}: Promise of an array of DataImportEventDetails
 */
export async function listDataImportEventDetails(
    tenantId: string,  
    companyId: string,
    dataImportEventId: string, 
    queryParams: any,
    domainName: string,
    path: string): Promise<PaginatedResult> {
    console.info('employeeImport.service.listDataImportEventDetails');
    
    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {

        let query = new ParameterizedQuery('listDataImportEventDetail', Queries.listDataImportEventDetail);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);
        }

        query.setParameter('@CompanyId', companyId);

        query.setParameter('@DataImportEventId', dataImportEventId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordsets[1].length === 0) {
            return undefined;
        }

        const totalCount = result.recordsets[0][0].totalCount;

        const results: IDataImportEventDetail[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                dataImportEventId: record.DataImportEventID,
                csvRowStatus: record.CSVRowStatus,
                csvRowNumber: record.CSVRowNumber,
                csvRowNotes: record.CSVRowNotes,
                csvRowData: record.CSVRowData,
                lastUserId: record.LastUserID,
                lastProgramEvent: record.LastProgramEvent,
                creationDate: record.CreationDate,
                lastUpdatedDate: record.LastUpdatedDate,
            };
        });

        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

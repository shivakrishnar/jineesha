import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as configService from '../../../config.service';

import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { IDataImportType, IDataImportEventDetail, IDataImport } from './DataImport';
import * as mime from 'mime-types';

/**
 * Returns a listing of data importing type for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @returns {Promise<DataImportTypes>}: Promise of an array of DataImportType
 */
export async function listDataImportTypes(tenantId: string): Promise<IDataImportType[]> {
    console.info('EmployeeImport.Service.ListDataImportTypes');

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
                lastProgramEvent: record.LastProgramEvent,
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
    path: string,
): Promise<PaginatedResult> {
    console.info('EmployeeImport.Service.ListDataImports');

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
    path: string,
): Promise<PaginatedResult> {
    console.info('employeeImport.service.listDataImportEventDetails');

    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('listDataImportEventDetail', Queries.listDataImportEventDetail);

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

/**
 * This method will generate a signed URL that will give you access to download the template under a tenant
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} dataImportTypeId: The unique identifer for the DataImportType
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function getTemplate(tenantId: string, dataImportTypeId: string): Promise<any> {
    console.info('EmployeeImport.Service.getTemplate');

    try {
        const query = new ParameterizedQuery('getDataImportTypeById', Queries.getDataImportTypeById);
        query.setParameter('@dataImportTypeId', dataImportTypeId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length || !result.recordset[0].S3TemplatePath) {
            return undefined;
        }

        const bucketName = configService.getEmployeeImportBucketName();
        const key = result.recordset[0].S3TemplatePath;

        const params = {
            Bucket: bucketName,
            Key: key,
        };

        const url = await utilService.getSignedUrlSync('getObject', params);
        const fileName = key.split('/').reverse()[0];
        const mimeType = mime.contentType(fileName);

        return { data: url, mimeType: `.${mimeType}` };
    } catch (error) {
        if (error.message) {
            if (error.message.includes('Not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
            }
        }

        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This method will generate a signed URL that will give you access to upload a file
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} fileName: File name with extension
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function uploadUrl(tenantId: string, companyId: string, fileName: string): Promise<any> {
    console.info('EmployeeImport.Service.uploadUrl');

    try {
        const bucketName = configService.getEmployeeImportBucketName();

        const uploadS3Filename = fileName.replace(/[^a-zA-Z0-9.]/g, '');

        let key = `imports/${tenantId}/${companyId}/${uploadS3Filename}`;
        key = utilService.sanitizeForS3(key);

        const mimeType = 'text/csv';

        const params = {
            Bucket: bucketName,
            Key: key,
            ACL: 'bucket-owner-full-control',
            ContentType: mimeType,
            ContentEncoding: 'base64',
        };

        const url = await utilService.getSignedUrlSync('putObject', params);

        return { url, mimeType };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

/**
 * This method will get the CSV file from S3 and import into the database
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} fileName: File name with extension
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function dataImports(tenantId: string, companyId: string, dataImportTypeId: string, fileName: string): Promise<any> {
    console.info('EmployeeImport.Service.dataImports');

    try {
        const bucketName = configService.getEmployeeImportBucketName();
        let key = `imports/${tenantId}/${companyId}/${fileName}`;
        key = utilService.sanitizeForS3(key);
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        const signedUrl = await utilService.getSignedUrlSync('getObject', params);
        const response = await fetch(signedUrl);
        const encodedData = await response.text();
        const decodedData = Buffer.from(encodedData, 'base64');
        const csvData = decodedData.toString('utf-8');
        const csvLines = csvData.split('\n');
        csvLines.shift();

        if (!csvLines.length) {
            console.error('===> csvLines have no data');
            return undefined;
        }

        const dataEventQuery = new ParameterizedQuery('insertDataImportEvent', Queries.insertDataImportEvent);
        dataEventQuery.setParameter('@CompanyID', companyId);
        dataEventQuery.setParameter('@DataImportTypeID', dataImportTypeId);
        const insertDataImportEventDetailSqlTemplate = Queries.insertDataImportEventDetail;

        let counter = 0;
        for (const line of csvLines) {
            if (line) {
                counter++;
                const dataEventDetailQuery = new ParameterizedQuery('insertDataImportEventDetail', insertDataImportEventDetailSqlTemplate);
                dataEventDetailQuery.setParameter('@CSVRowNumber', counter);
                dataEventDetailQuery.setStringParameter('@CSVRowData', line.trim());
                dataEventQuery.combineQueries(dataEventDetailQuery, false);
            }
        }
        const getDataEventIdQuery = new ParameterizedQuery('dataEventIdQuery', 'select @DataImportEventID as DataImportEventID');
        dataEventQuery.combineQueries(getDataEventIdQuery, false);

        const payload = {
            tenantId,
            queryName: dataEventQuery.name,
            query: dataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        if (!result || !result.recordset.length || !result.recordset[0].DataImportEventID) {
            console.error('===> DataImportEventID was not returned from the database');
            return undefined;
        }
        const dataImportEventId: number = result.recordset[0].DataImportEventID;
        const relativePath: string = `/${key}`;

        return { tenantId, companyId, dataImportTypeId, fileName, dataImportEventId, rowsCount: counter, relativePath };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

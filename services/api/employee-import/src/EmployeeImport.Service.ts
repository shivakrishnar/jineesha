import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as configService from '../../../config.service';

import { IEmployeeImportEvent, NotificationEventType } from './../../../internal-api/notification/events';

import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';
import { InvocationType } from '../../../util.service';
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

/**
 * This method will update the DataImportEvent table with the error returned by AWS occured on the Step Funciton execution
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportEventId: The unique identifer for the Employee Import event
 * @param {string} errorMessage: Error message returned by AWS
 */
export async function setFailedDataImportEvent(tenantId: string, dataImportEventId: string, errorMessage: string): Promise<any> {
    console.info('EmployeeImport.Service.setFailedDataImportEvent');

    try {
        if (!tenantId || !dataImportEventId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to tenantId and dataImportEventId not met.');
        }

        const updateDataImportEventFailedQuery = new ParameterizedQuery('updateDataImportEventFailed', Queries.updateDataImportEventFailed);
        updateDataImportEventFailedQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventFailedQuery.setParameter('@ErrorMessage', JSON.stringify(errorMessage));

        const updateDataImportEventFailedPayload = {
            tenantId,
            queryName: updateDataImportEventFailedQuery.name,
            query: updateDataImportEventFailedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        console.log(updateDataImportEventFailedPayload);

        await utilService.invokeInternalService('queryExecutor', updateDataImportEventFailedPayload, InvocationType.RequestResponse);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This method will update the DataImportEvent table with the Processing status
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportEventId: The unique identifer for the Employee Import event
 * @param {string} status: Global import status to be saved in DataImportEvent table
 */
export async function setDataImportEventStatusGlobal(tenantId: string, dataImportEventId: string, status: string): Promise<any> {
    console.info('EmployeeImport.Service.setDataImportEventStatusGlobal');

    try {
        if (!tenantId || !dataImportEventId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to tenantId and dataImportEventId not met.');
        }

        const updateDataImportEventStatusQuery = new ParameterizedQuery('updateDataImportEventStatus', Queries.updateDataImportEventStatus);
        updateDataImportEventStatusQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventStatusQuery.setParameter('@Status', status);

        const updateDataImportEventStatusPayload = {
            tenantId,
            queryName: updateDataImportEventStatusQuery.name,
            query: updateDataImportEventStatusQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        console.log(updateDataImportEventStatusPayload);

        await utilService.invokeInternalService('queryExecutor', updateDataImportEventStatusPayload, InvocationType.RequestResponse);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This method will update the DataImportEvent table with the Processing status
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportEventId: The unique identifer for the Employee Import event
 */
export async function processFinalStatusAndNotify(tenantId: string, dataImportEventId: string): Promise<any> {
    console.info('EmployeeImport.Service.processFinalStatusAndNotify');

    console.log(tenantId);
    console.log(dataImportEventId);

    try {
        if (!tenantId || !dataImportEventId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to tenantId and dataImportEventId not met.');
        }

        const getImportSummaryQuery = new ParameterizedQuery('getDataImportEventDetailSummary', Queries.getDataImportEventDetailSummary);
        getImportSummaryQuery.setParameter('@dataImportEventId', dataImportEventId);

        const payload = {
            tenantId,
            queryName: getImportSummaryQuery.name,
            query: getImportSummaryQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        console.log(payload);

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        console.log(result);

        if (result.recordsets[0].length === 0) {
            return undefined;
        }

        let finalStatusGlobal = 'Processed';

        if (result.recordset.length == 1) {
            if (result.recordset[0].CSVRowStatus != 'Processed') {
                finalStatusGlobal = 'Failed';
            }
        } else if (result.recordset.length > 1) {
            if (result.recordset.filter((a) => a.CSVRowStatus == 'Processed').length > 0) {
                finalStatusGlobal = 'Partially Processed';
            } else {
                finalStatusGlobal = 'Failed';
            }
        }

        console.log(finalStatusGlobal);

        setDataImportEventStatusGlobal(tenantId, dataImportEventId, finalStatusGlobal);

        console.log('Status updated');

        const getUserInfoQuery = new ParameterizedQuery('getUserFromDataImportEventID', Queries.getUserFromDataImportEventID);
        getUserInfoQuery.setParameter('@dataImportEventId', dataImportEventId);

        const payloadUser = {
            tenantId,
            queryName: getUserInfoQuery.name,
            query: getUserInfoQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        console.log(payload);

        const resultUserInfo: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadUser,
            utilService.InvocationType.RequestResponse,
        );
        console.log(resultUserInfo);

        if (resultUserInfo.recordsets[0].length > 0 && resultUserInfo.recordset[0].Email) {
            const creationDate = new Date(resultUserInfo.recordset[0].CreationDate);

            console.log('Send email to user');

            // send email
            utilService.sendEventNotification({
                urlParameters: {},
                invokerEmail: '',
                type: NotificationEventType.EmployeeImport,
                recipient: resultUserInfo.recordset[0].Email || '',
                status: finalStatusGlobal,
                creationDate: creationDate.toLocaleString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}),
                additionalMessage:
                    finalStatusGlobal == 'Partially Processed'
                        ? result.recordset
                              .map((a) => a.CSVRowStatus + ': ' + a.total)
                              .toString()
                              .replaceAll(',', '<br />')
                        : '',
            } as IEmployeeImportEvent); // Async call to invoke notification lambda - DO NOT AWAIT!!

            console.log('Email sent to user');
        }

        console.info(`successful executions`);
        
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

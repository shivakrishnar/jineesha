import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as helpers from './helpers';
import * as paginationService from '../../../pagination/pagination.service';
import * as configService from '../../../config.service';
import * as payrollService from '../../../remote-services/payroll.service';

import { IEmployeeImportEvent, NotificationEventType } from './../../../internal-api/notification/events';

import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';
import { InvocationType } from '../../../util.service';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import {
    IDataImportType,
    IDataImportEventDetail,
    IDataImport,
    EmployeeUpdateCsvRowType,
    CompensationUpdateCsvRowType,
    AlternateRateUpdateCsvRowType,
} from './DataImport';
import { IWage, IPatchOperation, IEvoPatch } from './Compensation';
import * as mime from 'mime-types';
import { IEvolutionKey } from '../../models/IEvolutionKey';
import * as ssoService from '../../../remote-services/sso.service';
import * as webSocketNotification from '../../ws-notification/src/ws-notification.Service';
import * as request from 'superagent';

const employeeImportPageSize = '6';

/**
 * Returns a listing of data importing type for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @param {string} importProcess: The type of importation process (optional).
 * @returns {Promise<DataImportTypes>}: Promise of an array of DataImportType
 */
export async function listDataImportTypes(tenantId: string, importProcess: string): Promise<IDataImportType[]> {
    console.info('EmployeeImport.Service.ListDataImportTypes');

    try {
        const query = new ParameterizedQuery('listDataImportTypes', Queries.listDataImportTypes);

        if (importProcess) {
            query.setStringParameter('@ImportProcess', importProcess);
        }
        else {
            query.setStringParameter('@ImportProcess', '%');
        }

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

    const validQueryStringParameters = ['pageToken', 'search', 'status', 'active', 'importProcess'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query = new ParameterizedQuery('listDataImportByCompany', Queries.listDataImportByCompany);

        if (dataImportTypeId) {
            query = new ParameterizedQuery('listDataImportByCompanyAndDataImportType', Queries.listDataImportByCompanyAndDataImportType);
            query.setParameter('@dataImportTypeId', dataImportTypeId);
        }

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            if (queryParams['search']) {
                query = new ParameterizedQuery('listDataImportByCompanyWithSearch', Queries.listDataImportByCompanyWithSearch);
                query.setStringParameter('@searchFilter1', '%' + queryParams['search'] + '%');
                query.setStringParameter('@searchFilter2', '%' + queryParams['search'] + '%');
            }

            if (queryParams['importProcess']) {
                if (!queryParams['search']) {
                    query = new ParameterizedQuery('listDataImportByCompanyWithSearch', Queries.listDataImportByCompanyWithSearch);
                    query.setStringParameter('@searchFilter1', '%');
                    query.setStringParameter('@searchFilter2', '%');
                }

                query.setStringParameter('@importProcess', queryParams['importProcess']);
            } else {
                query.setStringParameter('@importProcess', '%');
            }

            if (queryParams['status']) {
                query.setStringParameter('@status', queryParams['status']);
            } else {
                query.setStringParameter('@status', '%');
            }

            if (queryParams['active']) {
                query.setStringParameter('@active', queryParams['active']);
            } else {
                query.setStringParameter('@active', '%');
            }
        } else {
            query.setStringParameter('@status', '%');
            query.setStringParameter('@active', '%');
        }

        query.setParameter('@companyId', companyId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page, true, parseInt(employeeImportPageSize));

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length) {
            return undefined;
        }

        const totalCount = result.recordsets[0][0].totalCount;

        const results: IDataImport[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                companyId: record.CompanyID,
                dataImportTypeId: record.DataImportTypeID,
                dataImportTypeName: record.DataImportTypeName,
                status: record.Status,
                lastUserId: record.LastUserID,
                lastProgramEvent: record.LastProgramEvent,
                creationDate: record.CreationDate,
                lastUpdatedDate: record.LastUpdatedDate,
                userName: record.Username,
            };
        });

        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page, employeeImportPageSize);
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
 * @returns {Promise<DataImportTypes>}: Promise of an array of DataImportType
 */
export async function listAllDataImports(
    tenantId: string,
    dataImportTypeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('EmployeeImport.Service.ListAllDataImports');

    const validQueryStringParameters = ['pageToken', 'search', 'status', 'active', 'importProcess'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query = new ParameterizedQuery('listDataImport', Queries.listDataImport);

        if (dataImportTypeId) {
            query = new ParameterizedQuery('listDataImportByType', Queries.listDataImportByType);
            query.setParameter('@dataImportTypeId', dataImportTypeId);
        }

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            if (queryParams['search']) {
                query = new ParameterizedQuery('listDataImportWithSearch', Queries.listDataImportWithSearch);
                query.setStringParameter('@searchFilter1', '%' + queryParams['search'] + '%');
                query.setStringParameter('@searchFilter2', '%' + queryParams['search'] + '%');
            }

            if (queryParams['importProcess']) {
                if (!queryParams['search']) {
                    query = new ParameterizedQuery('listDataImportWithSearch', Queries.listDataImportWithSearch);
                    query.setStringParameter('@searchFilter1', '%');
                    query.setStringParameter('@searchFilter2', '%');
                }

                query.setStringParameter('@importProcess', queryParams['importProcess']);
            } else {
                query.setStringParameter('@importProcess', '%');
            }
            
            if (queryParams['status']) {
                query.setStringParameter('@status', queryParams['status']);
            } else {
                query.setStringParameter('@status', '%');
            }

            if (queryParams['active']) {
                query.setStringParameter('@active', queryParams['active']);
            } else {
                query.setStringParameter('@active', '%');
            }
        } else {
            query.setStringParameter('@status', '%');
            query.setStringParameter('@active', '%');
        }

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page, true, parseInt(employeeImportPageSize));

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length) {
            return undefined;
        }

        const totalCount = result.recordsets[0][0].totalCount;

        const results: IDataImport[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                companyId: record.CompanyID,
                dataImportTypeId: record.DataImportTypeID,
                dataImportTypeName: record.DataImportTypeName,
                status: record.Status,
                lastUserId: record.LastUserID,
                lastProgramEvent: record.LastProgramEvent,
                creationDate: record.CreationDate,
                lastUpdatedDate: record.LastUpdatedDate,
                userName: record.Username,
            };
        });

        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page, employeeImportPageSize);
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

        query.setParameter('@DataImportEventId', dataImportEventId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length) {
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
        if (!url || url === '') {
            throw new Error(`File not found`);
        }

        const fileName = key.split('/').reverse()[0];
        const mimeType = mime.contentType(fileName);

        return { data: url, mimeType: `.${mimeType}` };
    } catch (error) {
        if (error.message) {
            if (error.message.includes('File not found')) {
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
        if (!fileName || fileName.length === 0) {
            throw new Error(`The parameter fileName is required`);
        }

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
        if (!url || url === '') {
            throw new Error(`URL pre-signed not found.`);
        }

        return { url, mimeType };
    } catch (e) {
        if (e.message) {
            if (e.message.includes('pre-signed not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(e.message);
            }
        }

        if (e instanceof ErrorMessage) {
            throw e;
        }

        console.error(JSON.stringify(e));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This method will generate a signed URL that will give you access to upload a file
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} fileName: File name with extension
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function uploadUrlInBulk(tenantId: string, fileName: string): Promise<any> {
    console.info('EmployeeImport.Service.uploadUrlInBulk');

    try {
        if (!fileName || fileName.length === 0) {
            throw new Error(`The parameter fileName is required`);
        }

        const bucketName = configService.getEmployeeImportBucketName();

        const uploadS3Filename = fileName.replace(/[^a-zA-Z0-9.]/g, '');

        let key = `imports/${tenantId}/NoCompany/${uploadS3Filename}`;       
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
        if (!url || url === '') {
            throw new Error(`URL pre-signed not found.`);
        }

        return { url, mimeType };
    } catch (e) {
        if (e.message) {
            if (e.message.includes('pre-signed not found')) {
                throw errorService.getErrorResponse(50).setDeveloperMessage(e.message);
            }
        }

        if (e instanceof ErrorMessage) {
            throw e;
        }

        console.error(JSON.stringify(e));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This method will get the CSV file from S3 and import into the database
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} dataImportTypeId: The unique identifier for the data import type
 * @param {string} fileName: File name with extension
 * @param {number} userId: The unique identifer for the user
 * @param {string} hrAccessToken: The access token from AHR
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function dataImports(
    tenantId: string,
    companyId: string,
    dataImportTypeId: string,
    fileName: string,
    userId: number,
    hrAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.dataImports');

    try {
        //
        // Getting the csv file from S3 bucket...
        //
        const bucketName = configService.getEmployeeImportBucketName();
        let key = `imports/${tenantId}/${companyId}/${fileName}`;
        key = utilService.sanitizeForS3(key);
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        const signedUrl = await utilService.getSignedUrlSync('getObject', params);
        const csvData = await helpers.getFileFromPreSignedURL(signedUrl);
        const csvLines = csvData.split('\n');
        csvLines.shift();

        if (!csvLines.length) {
            console.error('===> csvLines have no data');
            return undefined;
        }

        //
        // Putting the file contents into the database...
        //
        const dataEventQuery = new ParameterizedQuery('insertDataImportEvent', Queries.insertDataImportEvent);
        dataEventQuery.setParameter('@CompanyID', companyId);
        dataEventQuery.setParameter('@DataImportTypeID', dataImportTypeId);
        dataEventQuery.setParameter('@UserID', userId);
        dataEventQuery.setStringParameter('@FileName', fileName);

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

        // Calling the step function to do the validation and update for each row of the csv file...
        // I've leave the line below as a example for local test, please DO NOT remove this line.
        //const stepFunctionArnName = 'arn:aws:states:us-east-1:317299412255:stateMachine:HrEmployeeImportStateMachine-development';
        const stepFunctionArnName = configService.getHrEmployeeImportStateMachineArn();
        const stepFunctionInputs = {
            tenantId,
            companyId,
            dataImportTypeId,
            fileName,
            dataImportEventId,
            csvRelativePath: key,
            userId,
            hrAccessToken,
        };

        await utilService.StartStateMachineExecution(stepFunctionArnName, stepFunctionInputs);

        return stepFunctionInputs;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * This method will get the CSV file from S3 and import into the database
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportTypeId: The unique identifier for the data import type
 * @param {string} fileName: File name with extension
 * @param {number} userId: The unique identifer for the user
 * @param {string} hrAccessToken: The access token from AHR
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function dataImportsInBulk(
    tenantId: string,
    dataImportTypeId: string,
    fileName: string,
    userId: number,
    hrAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.dataImportsInBulk');

    try {
        //
        // Getting the csv file from S3 bucket...
        //
        const bucketName = configService.getEmployeeImportBucketName();
        let key = `imports/${tenantId}/NoCompany/${fileName}`;
        key = utilService.sanitizeForS3(key);
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        const signedUrl = await utilService.getSignedUrlSync('getObject', params);
        const csvData = await helpers.getFileFromPreSignedURL(signedUrl);
        const csvLines = csvData.split('\n');
        csvLines.shift();

        if (!csvLines.length) {
            console.error('===> csvLines have no data');
            return undefined;
        }

        //
        // Putting the file contents into the database...
        //
        const dataEventQuery = new ParameterizedQuery('insertDataImportEvent', Queries.insertDataImportEvent);
        dataEventQuery.setValueOrNullParameter('@CompanyID', -1);
        dataEventQuery.setParameter('@DataImportTypeID', dataImportTypeId);
        dataEventQuery.setParameter('@UserID', userId);
        dataEventQuery.setStringParameter('@FileName', fileName);

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

        // Calling the step function to do the validation and update for each row of the csv file...
        // I've leave the line below as a example for local test, please DO NOT remove this line.
        //const stepFunctionArnName = 'arn:aws:states:us-east-1:317299412255:stateMachine:HrEmployeeImportStateMachine-development';
        const stepFunctionArnName = configService.getHrEmployeeImportInBulkStateMachineArn();
        const stepFunctionInputs = {
            tenantId,
            dataImportTypeId,
            fileName,
            dataImportEventId,
            csvRelativePath: key,
            userId,
            hrAccessToken,
        };

        await utilService.StartStateMachineExecution(stepFunctionArnName, stepFunctionInputs);

        return stepFunctionInputs;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

export function mapAHRExcelUpdateEmployee(jsonCsvRowReordered, ahrEmployee) {
    console.info('EmployeeImport.Service.mapAHRExcelUpdateEmployee');

    if ((!jsonCsvRowReordered['Birthdate'] || jsonCsvRowReordered['Birthdate'] == '') &&
        ahrEmployee.BirthDate && ahrEmployee.BirthDate != '') {
        jsonCsvRowReordered['Birthdate'] = ahrEmployee.BirthDate;
    }

    if ((!jsonCsvRowReordered['Time Clock Number'] || jsonCsvRowReordered['Time Clock Number'] == '') &&
        ahrEmployee.ClockNumber && ahrEmployee.ClockNumber != '') {
        jsonCsvRowReordered['Time Clock Number'] = ahrEmployee.ClockNumber;
    }

    if ((!jsonCsvRowReordered['Email'] || jsonCsvRowReordered['Email'] == '') &&
         ahrEmployee.Email && ahrEmployee.Email != '') {
        jsonCsvRowReordered['Email'] = ahrEmployee.Email;
    }

    if ((!jsonCsvRowReordered['Home Phone'] || jsonCsvRowReordered['Home Phone'] == '') &&
         ahrEmployee.PhoneHome && ahrEmployee.PhoneHome != '') {
        jsonCsvRowReordered['Home Phone'] = ahrEmployee.PhoneHome;
    }

    if ((!jsonCsvRowReordered['Work Phone'] || jsonCsvRowReordered['Work Phone'] == '') &&
         ahrEmployee.PhoneWork && ahrEmployee.PhoneWork != '') {
        jsonCsvRowReordered['Work Phone'] = ahrEmployee.PhoneWork;
    }

    if ((!jsonCsvRowReordered['Cell Phone'] || jsonCsvRowReordered['Cell Phone'] == '') &&
         ahrEmployee.PhoneCell && ahrEmployee.PhoneCell != '') {
        jsonCsvRowReordered['Cell Phone'] = ahrEmployee.PhoneCell;
    }

    if ((!jsonCsvRowReordered['Gender'] || jsonCsvRowReordered['Gender'] == '') &&
         ahrEmployee.Gender && ahrEmployee.Gender != '') {
        jsonCsvRowReordered['Gender'] = ahrEmployee.Gender;
    }

    if ((!jsonCsvRowReordered['Ethnicity'] || jsonCsvRowReordered['Ethnicity'] == '') &&
         ahrEmployee.Ethnicity && ahrEmployee.Ethnicity != '') {
        jsonCsvRowReordered['Ethnicity'] = ahrEmployee.Ethnicity;
    }

    if ((!jsonCsvRowReordered['Education Level'] || jsonCsvRowReordered['Education Level'] == '') &&
         ahrEmployee.Education && ahrEmployee.Education != '') {
        jsonCsvRowReordered['Education Level'] = ahrEmployee.Education;
    }

    if ((!jsonCsvRowReordered['Tobacco User'] || jsonCsvRowReordered['Tobacco User'] == '') &&
         ahrEmployee.TobaccoUser && ahrEmployee.TobaccoUser != '') {
        jsonCsvRowReordered['Tobacco User'] = ahrEmployee.TobaccoUser;
    }

    if ((!jsonCsvRowReordered['Disabled'] || jsonCsvRowReordered['Disabled'] == '') &&
         ahrEmployee.IsDisabled && ahrEmployee.IsDisabled != '') {
        jsonCsvRowReordered['Disabled'] = ahrEmployee.IsDisabled;
    }

    if ((!jsonCsvRowReordered['Military Reserve'] || jsonCsvRowReordered['Military Reserve'] == '') &&
         ahrEmployee.MilitaryReserve && ahrEmployee.MilitaryReserve != '') {
        jsonCsvRowReordered['Military Reserve'] = ahrEmployee.MilitaryReserve;
    }

    if ((!jsonCsvRowReordered['Veteran'] || jsonCsvRowReordered['Veteran'] == '') &&
         ahrEmployee.Veteran && ahrEmployee.Veteran != '') {
        jsonCsvRowReordered['Veteran'] = ahrEmployee.Veteran;
    }

    if ((!jsonCsvRowReordered['Memo 1'] || jsonCsvRowReordered['Memo 1'] == '') &&
         ahrEmployee.Memo1 && ahrEmployee.Memo1 != '') {
        jsonCsvRowReordered['Memo 1'] = ahrEmployee.Memo1;
    }

    if ((!jsonCsvRowReordered['Memo 2'] || jsonCsvRowReordered['Memo 2'] == '') &&
         ahrEmployee.Memo2 && ahrEmployee.Memo2 != '') {
        jsonCsvRowReordered['Memo 2'] = ahrEmployee.Memo2;
    }

    if ((!jsonCsvRowReordered['Memo 3'] || jsonCsvRowReordered['Memo 3'] == '') &&
         ahrEmployee.Memo3 && ahrEmployee.Memo3 != '') {
        jsonCsvRowReordered['Memo 3'] = ahrEmployee.Memo3;
    }

    if ((!jsonCsvRowReordered['Pay Frequency'] || jsonCsvRowReordered['Pay Frequency'] == '') &&
         ahrEmployee.PayFrequency && ahrEmployee.PayFrequency != '') {
        jsonCsvRowReordered['Pay Frequency'] = ahrEmployee.PayFrequency;
    }

    if ((!jsonCsvRowReordered['Standard Payroll Hours'] || jsonCsvRowReordered['Standard Payroll Hours'] == '') &&
         ahrEmployee.StandardPayrollHours && ahrEmployee.StandardPayrollHours != '') {
        jsonCsvRowReordered['Standard Payroll Hours'] = ahrEmployee.StandardPayrollHours;
    }

    if ((!jsonCsvRowReordered['FLSA Classification'] || jsonCsvRowReordered['FLSA Classification'] == '') &&
         ahrEmployee.FLSAClassification && ahrEmployee.FLSAClassification != '') {
        jsonCsvRowReordered['FLSA Classification'] = ahrEmployee.FLSAClassification;
    }

    if ((!jsonCsvRowReordered['Position'] || jsonCsvRowReordered['Position'] == '') &&
         ahrEmployee.Position && ahrEmployee.Position != '') {
        jsonCsvRowReordered['Position'] = ahrEmployee.Position;
    }

    if ((!jsonCsvRowReordered['Reports To 1'] || jsonCsvRowReordered['Reports To 1'] == '') &&
         ahrEmployee.ReportsTo1 && ahrEmployee.ReportsTo1 != '') {
        jsonCsvRowReordered['Reports To 1'] = ahrEmployee.ReportsTo1;
    }

    if ((!jsonCsvRowReordered['Reports To 2'] || jsonCsvRowReordered['Reports To 2'] == '') &&
         ahrEmployee.ReportsTo2 && ahrEmployee.ReportsTo2 != '') {
        jsonCsvRowReordered['Reports To 2'] = ahrEmployee.ReportsTo2;
    }

    if ((!jsonCsvRowReordered['Reports To 3'] || jsonCsvRowReordered['Reports To 3'] == '') &&
         ahrEmployee.ReportsTo3 && ahrEmployee.ReportsTo3 != '') {
        jsonCsvRowReordered['Reports To 3'] = ahrEmployee.ReportsTo3;
    }

    if ((!jsonCsvRowReordered['Supervisor (SC)'] || jsonCsvRowReordered['Supervisor (SC)'] == '') &&
         ahrEmployee.SupervisorSC && ahrEmployee.SupervisorSC != '') {
        jsonCsvRowReordered['Supervisor (SC)'] = ahrEmployee.SupervisorSC;
    }   

    if ((!jsonCsvRowReordered['Benefit Class/Eligibility Group'] || jsonCsvRowReordered['Benefit Class/Eligibility Group'] == '') &&
         ahrEmployee.BenefitClass && ahrEmployee.BenefitClass != '') {
        jsonCsvRowReordered['Benefit Class/Eligibility Group'] = ahrEmployee.BenefitClass;
    }

    if ((!jsonCsvRowReordered['EEO Category'] || jsonCsvRowReordered['EEO Category'] == '') &&
         ahrEmployee.EEOCategory && ahrEmployee.EEOCategory != '') {
        jsonCsvRowReordered['EEO Category'] = ahrEmployee.EEOCategory;
    }

    if ((!jsonCsvRowReordered['Worker Comp Code'] || jsonCsvRowReordered['Worker Comp Code'] == '') &&
         ahrEmployee.WorkerCompCode && ahrEmployee.WorkerCompCode != '') {
        jsonCsvRowReordered['Worker Comp Code'] = ahrEmployee.WorkerCompCode;
    }

    if ((!jsonCsvRowReordered['Change Reason'] || jsonCsvRowReordered['Change Reason'] == '') &&
         ahrEmployee.ChangeReason && ahrEmployee.ChangeReason != '') {
        jsonCsvRowReordered['Change Reason'] = ahrEmployee.ChangeReason;
    }

    if ((!jsonCsvRowReordered['Comment'] || jsonCsvRowReordered['Comment'] == '') &&
         ahrEmployee.Comment && ahrEmployee.Comment != '') {
        jsonCsvRowReordered['Comment'] = ahrEmployee.Comment;
    }

}

/**
 * @param {EmployeeUpdateCsvRowType} jsonCsvRow: The csv row with employee data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
 * @param {string} tenantName: The tenant name from EVO
 * @param {string} evoAccessToken: The access token from EVO
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function updateEmployee(
    jsonCsvRow: EmployeeUpdateCsvRowType,
    rowNumber: number,
    tenantId: string,
    companyId: string,
    dataImportTypeId: string,
    dataImportEventId: string,
    hrAccessToken: string,
    tenantName: string,
    evoAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.updateEmployee');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the employee on EVO');
            throw new Error(`Token not found`);
        }

        //
        // Handling the csv columns order
        //

        console.info('===> Handling the csv columns order');

        const queryCSVHeader = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        queryCSVHeader.setParameter('@ID', dataImportEventId);

        const payloadCSVHeader = {
            tenantId,
            queryName: queryCSVHeader.name,
            query: queryCSVHeader.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultCSVHeader: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadCSVHeader,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultCSVHeader);

        if (resultCSVHeader.recordsets[0].length === 0) {
            throw new Error(`The CSV header could not be found`);
        }

        const csvRowDesiredOrder = resultCSVHeader.recordset[0].CSVHeader.split(',');
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach((key) => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];
        });
        const stringCsvRow = '"' + Object.values(jsonCsvRowReordered).join('","') + '"';
        console.info(jsonCsvRowReordered);

        //
        // Validating employee details...
        //
        console.info('===> Validating employee details');

        let validateEmployeeDetailsDataEventQuery = new ParameterizedQuery('validateEmployeeDetails', Queries.validateEmployeeDetails);
        //If it has Employee Code in the header, it means it is a bulk import, in this case, use specific validation
        if (jsonCsvRow['Company Code']) {
            validateEmployeeDetailsDataEventQuery = new ParameterizedQuery('validateEmployeeDetailsInBulk', Queries.validateEmployeeDetailsInBulk);
        }

        validateEmployeeDetailsDataEventQuery.setStringParameter('@CsvRow', stringCsvRow);
        validateEmployeeDetailsDataEventQuery.setParameter('@RowNumber', rowNumber);
        validateEmployeeDetailsDataEventQuery.setStringParameter('@TenantId', tenantId);
        validateEmployeeDetailsDataEventQuery.setParameter('@CompanyId', companyId);
        validateEmployeeDetailsDataEventQuery.setParameter('@DataImportTypeId', dataImportTypeId);
        validateEmployeeDetailsDataEventQuery.setParameter('@DataImportEventId', dataImportEventId);

        const validateEmployeeDetailsPayload = {
            tenantId,
            queryName: validateEmployeeDetailsDataEventQuery.name,
            query: validateEmployeeDetailsDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const validateEmployeeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            validateEmployeeDetailsPayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !validateEmployeeResult ||
            !validateEmployeeResult.recordset.length ||
            validateEmployeeResult.recordset[0].StatusResult === undefined ||
            validateEmployeeResult.recordset[0].StatusResult === null
        ) {
            console.error('===> StatusResult was not returned from the validateEmployee script');
            throw new Error(`Status was not returned from the validateEmployee script`);
        }
        
        const validateEmployeeStatusResult: number = validateEmployeeResult.recordset[0].StatusResult;
        if (validateEmployeeStatusResult === 0) {
            console.info(
                `===> The employee row was not pass the validation: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`,
            );
            return { isSuccess: false, message: 'The data provided did not pass validation' };
        }

        //
        // Updating employee on EVO...
        //

        console.info('===> Getting EVO information from AHR');

        const getEmployeeByEmployeeCodeDataEventQuery = new ParameterizedQuery(
            'getEmployeeByEmployeeCode',
            Queries.getEmployeeByEmployeeCode,
        );
        getEmployeeByEmployeeCodeDataEventQuery.setParameter('@CompanyID', companyId);
        getEmployeeByEmployeeCodeDataEventQuery.setStringParameter('@EmployeeCode', jsonCsvRowReordered['Employee Identifier']);

        const getEmployeeByEmployeeCodePayload = {
            tenantId,
            queryName: getEmployeeByEmployeeCodeDataEventQuery.name,
            query: getEmployeeByEmployeeCodeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getEmployeeByEmployeeCodeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getEmployeeByEmployeeCodePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !getEmployeeByEmployeeCodeResult ||
            !getEmployeeByEmployeeCodeResult.recordset.length ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === undefined ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === null ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === undefined ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === null ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === undefined ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === null
        ) {
            console.error('===> getEmployeeByEmployeeCodeResult do not have what we need to update on EVO');
            throw new Error(`Do not have what we need to update on EVO`);
        }

        const hrEmployee: any = getEmployeeByEmployeeCodeResult.recordset[0];
        const evoKeys: IEvolutionKey = {
            clientId: hrEmployee.EvoClientId,
            companyId: hrEmployee.EvoCompanyId,
            employeeId: hrEmployee.EvoEmployeeId,
        };

        console.info('===> Getting for current employee data');

        const getAllFieldsForUpdateEmployeeQuery = new ParameterizedQuery(
            'getAllFieldsForUpdateEmployee',
            Queries.getAllFieldsForUpdateEmployee,
        );

        getAllFieldsForUpdateEmployeeQuery.setParameter('@CompanyID', companyId);
        getAllFieldsForUpdateEmployeeQuery.setStringParameter('@EmployeeCode', jsonCsvRowReordered['Employee Identifier']);

        const getAllFieldsForUpdateEmployeePayload = {
            tenantId,
            queryName: getAllFieldsForUpdateEmployeeQuery.name,
            query: getAllFieldsForUpdateEmployeeQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getAllFieldsForUpdateEmployeeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getAllFieldsForUpdateEmployeePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (!getAllFieldsForUpdateEmployeeResult ||!getAllFieldsForUpdateEmployeeResult.recordset.length) {
            console.error('===> getAllFieldsForUpdateEmployeeResult not found anything in AHR database');
            throw new Error(`Employee not found in AHR database`);
        }

        console.info('===> employee data result');
        console.info(getAllFieldsForUpdateEmployeeResult);

        console.info('===> Mapping between AHR and Excel data');
        mapAHRExcelUpdateEmployee(jsonCsvRowReordered, getAllFieldsForUpdateEmployeeResult.recordset[0])

        console.info('===> Configuring EVO object information before API call');

        const evoEmployee: any = await payrollService.getEmployeeFromEvo(tenantName, evoKeys, evoAccessToken);

        if (!evoEmployee) {
            console.error('===> evoEmployee does not exists in EVO');
            throw new Error(`Employee does not exists in EVO`);
        }

        console.info('===> Getting PositionType from AHR for EVO');

        const getPositionTypeEvoIdByCodeDataEventQuery = new ParameterizedQuery(
            'getPositionTypeEvoIdByCode',
            Queries.getPositionTypeEvoIdByCode,
        );
        getPositionTypeEvoIdByCodeDataEventQuery.setParameter('@CompanyID', companyId);
        getPositionTypeEvoIdByCodeDataEventQuery.setStringParameter('@Code', jsonCsvRowReordered['Position']);

        const getPositionTypeEvoIdByCodePayload = {
            tenantId,
            queryName: getPositionTypeEvoIdByCodeDataEventQuery.name,
            query: getPositionTypeEvoIdByCodeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getPositionTypeEvoIdByCodeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getPositionTypeEvoIdByCodePayload,
            utilService.InvocationType.RequestResponse,
        );
        if (getPositionTypeEvoIdByCodeResult && getPositionTypeEvoIdByCodeResult.recordset.length) {
            evoEmployee.positionId = getPositionTypeEvoIdByCodeResult.recordset[0].PositionTypeEvoId;
        }

        console.info('===> Getting WorkerCompType from AHR for EVO');

        const getWorkerCompTypeEvoIdByCodeDataEventQuery = new ParameterizedQuery(
            'getWorkerCompTypeEvoIdByCode',
            Queries.getWorkerCompTypeEvoIdByCode,
        );
        getWorkerCompTypeEvoIdByCodeDataEventQuery.setParameter('@CompanyID', companyId);

        const WCCode = jsonCsvRowReordered['Worker Comp Code'].substring(0, jsonCsvRowReordered['Worker Comp Code'].indexOf('('));
        const WCStateCode = jsonCsvRowReordered['Worker Comp Code'].substring(
            jsonCsvRowReordered['Worker Comp Code'].indexOf('(') + 1,
            jsonCsvRowReordered['Worker Comp Code'].indexOf(')'),
        );

        getWorkerCompTypeEvoIdByCodeDataEventQuery.setStringParameter('@Code', WCCode);
        getWorkerCompTypeEvoIdByCodeDataEventQuery.setStringParameter('@StateCode', WCStateCode);

        const getWorkerCompTypeEvoIdByCodePayload = {
            tenantId,
            queryName: getWorkerCompTypeEvoIdByCodeDataEventQuery.name,
            query: getWorkerCompTypeEvoIdByCodeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getWorkerCompTypeEvoIdByCodeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getWorkerCompTypeEvoIdByCodePayload,
            utilService.InvocationType.RequestResponse,
        );
        if (getWorkerCompTypeEvoIdByCodeResult && getWorkerCompTypeEvoIdByCodeResult.recordset.length) {
            evoEmployee.workersCompensationId = getWorkerCompTypeEvoIdByCodeResult.recordset[0].WorkerCompTypeEvoId;
        }

        console.info('===> Configuring the others fields of the EVO object');

        if (jsonCsvRowReordered['New Employee Identifier'] && jsonCsvRowReordered['New Employee Identifier'] != '') {

            //
            // Validates whether the new EmployeeCode already exists in AHR...
            //
            console.info('===> Validating whether the new EmployeeCode already exists in AHR');

            const checksNewEmployeeCodeIsInUseQuery = new ParameterizedQuery('checksNewEmployeeCodeIsInUse', Queries.checksNewEmployeeCodeIsInUse);
            checksNewEmployeeCodeIsInUseQuery.setStringParameter('@NewEmployeeCode', jsonCsvRowReordered['New Employee Identifier']);
            checksNewEmployeeCodeIsInUseQuery.setParameter('@CompanyId', companyId);

            const checksNewEmployeeCodeIsInUsePayload = {
                tenantId,
                queryName: checksNewEmployeeCodeIsInUseQuery.name,
                query: checksNewEmployeeCodeIsInUseQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const checksNewEmployeeCodeIsInUseResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                checksNewEmployeeCodeIsInUsePayload,
                utilService.InvocationType.RequestResponse,
            );

            if (
                !checksNewEmployeeCodeIsInUseResult ||
                !checksNewEmployeeCodeIsInUseResult.recordset.length ||
                checksNewEmployeeCodeIsInUseResult.recordset[0].Total === undefined ||
                checksNewEmployeeCodeIsInUseResult.recordset[0].Total === null
            ) {
                console.error('===> Total was not returned from the validation new employee code in AHR script');
                throw new Error(`Total was not returned from the validation new employee code in AHR script`);
            }

            if (Number(checksNewEmployeeCodeIsInUseResult.recordset[0].Total) > 0) {
                console.error('===> New employee identifier is already in use');
                throw new Error(`New employee identifier is already in use`);
            }

            //Validates whether the new EmployeeCode already exists in EVO
            //We do not need this extra validation, as "Employee Customer Code" (or Employee Number) is unique in the EVO database.

            evoEmployee.employeeNumber = jsonCsvRowReordered['New Employee Identifier'];
        }
        else {
            evoEmployee.employeeNumber = jsonCsvRowReordered['Employee Identifier'];
        }
        
        evoEmployee.email = jsonCsvRowReordered['Email'] || null;
        evoEmployee.standardHours = jsonCsvRowReordered['Standard Payroll Hours'] || null;
        evoEmployee.timeClockNumber = jsonCsvRowReordered['Time Clock Number'] || null;
        evoEmployee.payFrequency = jsonCsvRowReordered['Pay Frequency'] || null;
        evoEmployee.person.email = jsonCsvRowReordered['Email'] || null;
        evoEmployee.person.birthDate = jsonCsvRowReordered['Birthdate'] || null;

        if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '0') {
            evoEmployee.eeoCode = 'None';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '1.1') {
            evoEmployee.eeoCode = 'Executive';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '1.2') {
            evoEmployee.eeoCode = 'Manager';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '2') {
            evoEmployee.eeoCode = 'Professional';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '3') {
            evoEmployee.eeoCode = 'Technician';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '4') {
            evoEmployee.eeoCode = 'Sales';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '5') {
            evoEmployee.eeoCode = 'Administrative';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '6') {
            evoEmployee.eeoCode = 'Craft';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '7') {
            evoEmployee.eeoCode = 'Operative';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '8') {
            evoEmployee.eeoCode = 'Laborer';
        } else if (jsonCsvRowReordered['EEO Category'] && jsonCsvRowReordered['EEO Category'] === '9') {
            evoEmployee.eeoCode = 'Service';
        } else {
            evoEmployee.eeoCode = null;
        }

        if (jsonCsvRowReordered['FLSA Classification'] && jsonCsvRowReordered['FLSA Classification'].toUpperCase() === 'NA') {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = 'NA';
        } else if (jsonCsvRowReordered['FLSA Classification'] && jsonCsvRowReordered['FLSA Classification'].toUpperCase() === 'N') {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = 'NonExempt';
        } else if (jsonCsvRowReordered['FLSA Classification'] && jsonCsvRowReordered['FLSA Classification'].toUpperCase() === 'E') {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = 'Exempt';
        } else {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = null;
        }

        if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'] === '2') {
            evoEmployee.person.ethnicity = 'TwoOrMoreRaces';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'A') {
            evoEmployee.person.ethnicity = 'Asian';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'B') {
            evoEmployee.person.ethnicity = 'BlackOrAfricanAmerican';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'H') {
            evoEmployee.person.ethnicity = 'HispanicOrLatino';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'I') {
            evoEmployee.person.ethnicity = 'AmericanIndianOrAlaskaNative';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'NA') {
            evoEmployee.person.ethnicity = 'NotApplicable';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'O') {
            evoEmployee.person.ethnicity = 'Other';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'P') {
            evoEmployee.person.ethnicity = 'NativeHawaiianOrOtherPacificIslander';
        } else if (jsonCsvRowReordered['Ethnicity'] && jsonCsvRowReordered['Ethnicity'].toUpperCase() === 'W') {
            evoEmployee.person.ethnicity = 'White';
        } else {
            evoEmployee.person.ethnicity = null;
        }

        if (jsonCsvRowReordered['Gender'] && jsonCsvRowReordered['Gender'] === 'M') {
            evoEmployee.person.gender = 'M';
        } else if (jsonCsvRowReordered['Gender'] && jsonCsvRowReordered['Gender'] === 'F') {
            evoEmployee.person.gender = 'F';
        } else if (jsonCsvRowReordered['Gender'] && jsonCsvRowReordered['Gender'] === 'N/A') {
            evoEmployee.person.gender = 'NA';
        } else if (jsonCsvRowReordered['Gender'] && jsonCsvRowReordered['Gender'] === 'NB') {
            evoEmployee.person.gender = 'NonBinary';
        } else {
            evoEmployee.person.gender = null;
        }

        if (jsonCsvRowReordered['Veteran'] && jsonCsvRowReordered['Veteran'].toUpperCase() === 'YES') {
            evoEmployee.person.veteran = 'Y';
        } else if (jsonCsvRowReordered['Veteran'] && jsonCsvRowReordered['Veteran'].toUpperCase() === 'NO') {
            evoEmployee.person.veteran = 'N';
        } else if (jsonCsvRowReordered['Veteran'] && jsonCsvRowReordered['Veteran'].toUpperCase() === 'DECLINED TO DISCLOSE - N/A') {
            evoEmployee.person.veteran = 'Unknown';
        } else {
            evoEmployee.person.veteran = null;
        }

        if (jsonCsvRowReordered['Military Reserve'] && jsonCsvRowReordered['Military Reserve'].toUpperCase() === 'YES') {
            evoEmployee.person.militaryReserve = 'Y';
        } else if (jsonCsvRowReordered['Military Reserve'] && jsonCsvRowReordered['Military Reserve'].toUpperCase() === 'NO') {
            evoEmployee.person.militaryReserve = 'N';
        } else if (
            jsonCsvRowReordered['Military Reserve'] &&
            jsonCsvRowReordered['Military Reserve'].toUpperCase() === 'DECLINED TO DISCLOSE - N/A'
        ) {
            evoEmployee.person.militaryReserve = 'Unknown';
        } else {
            evoEmployee.person.militaryReserve = null;
        }

        const phoneList: Array<any> = [];
        phoneList.push({
            number: jsonCsvRowReordered['Cell Phone'] || null,
            extension: null,
            description: 'Primary',
        });
        phoneList.push({
            number: jsonCsvRowReordered['Home Phone'] || null,
            extension: null,
            description: 'Secondary',
        });
        phoneList.push({
            number: jsonCsvRowReordered['Work Phone'] || null,
            extension: null,
            description: 'Tertiary',
        });
        evoEmployee.person.phones = phoneList;

        console.info('===> Calling EVO API to update evoEmployee');
        console.info(evoEmployee);

        const updateEvoEmployeeStatusResult: any = await payrollService.updateEmployeeInEvo(
            tenantName,
            evoKeys,
            evoAccessToken,
            evoEmployee,
        );

        console.info('===> updateEvoEmployeeStatusResult');
        console.info(updateEvoEmployeeStatusResult);

        //
        // Updating employee on AHR...
        //

        console.info('===> Updating employee on AHR');

        let updateEmployeeDataEventQuery = new ParameterizedQuery('updateEmployee', Queries.updateEmployee);

        //If it has Employee Code in the header, it means it is a bulk import, in this case, use specific script to update
        if (jsonCsvRow['Company Code']) {
            updateEmployeeDataEventQuery = new ParameterizedQuery('updateEmployeeInBulk', Queries.updateEmployeeInBulk);
        }

        updateEmployeeDataEventQuery.setStringParameter('@CsvRow', stringCsvRow);
        updateEmployeeDataEventQuery.setParameter('@RowNumber', rowNumber);
        updateEmployeeDataEventQuery.setStringParameter('@TenantId', tenantId);
        updateEmployeeDataEventQuery.setParameter('@CompanyId', companyId);
        updateEmployeeDataEventQuery.setParameter('@DataImportTypeId', dataImportTypeId);
        updateEmployeeDataEventQuery.setParameter('@DataImportEventId', dataImportEventId);

        const updateEmployeePayload = {
            tenantId,
            queryName: updateEmployeeDataEventQuery.name,
            query: updateEmployeeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateEmployeeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateEmployeePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !updateEmployeeResult ||
            !updateEmployeeResult.recordset.length ||
            updateEmployeeResult.recordset[0].StatusResult === undefined ||
            updateEmployeeResult.recordset[0].StatusResult === null
        ) {
            console.error('===> StatusResult was not returned from the updateEmployee script');
            throw new Error(`Status was not returned from the update script`);
        }
        const updateEmployeeStatusResult: number = updateEmployeeResult.recordset[0].StatusResult;
        if (updateEmployeeStatusResult === 0) {
            console.error(
                `===> The employee row was not updated on AHR: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`,
            );
            return { isSuccess: false, message: 'The employee update script was not executed successfully' };
        }

        return { isSuccess: true, message: 'Employee was updated successfully' };
    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        const updateDataImportEventDetailErrorQuery = new ParameterizedQuery(
            'updateDataImportEventDetailError',
            Queries.updateDataImportEventDetailError,
        );
        updateDataImportEventDetailErrorQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailErrorQuery.setParameter('@CSVRowNumber', rowNumber + 1);
        
        if (msgError.length > 199) {
            updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError.substring(0, 199));
        }
        else {
            updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError);
        }

        const updateDataImportEventDetailErrorPayload = {
            tenantId,
            queryName: updateDataImportEventDetailErrorQuery.name,
            query: updateDataImportEventDetailErrorQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailErrorResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailErrorPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailErrorResult);
        
        return { isSuccess: false, message: msgError };

    }
}

/**
 * This method will update the DataImportEvent table with the error returned by AWS occured on the Step Funciton execution
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportEventId: The unique identifer for the Employee Import event
 * @param {string} errorMessage: Error message returned by AWS
 */
export async function setFailedDataImportEvent(
    tenantId: string,
    dataImportEventId: string,
    dataImportTypeId: string,
    errorMessage: string,
    accessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.setFailedDataImportEvent');

    try {
        if (!tenantId || !dataImportEventId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to tenantId and dataImportEventId not met.');
        }

        const updateDataImportEventFailedQuery = new ParameterizedQuery('updateDataImportEventError', Queries.updateDataImportEventError);
        updateDataImportEventFailedQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventFailedQuery.setParameter('@ErrorMessage', JSON.stringify(errorMessage));

        const updateDataImportEventFailedPayload = {
            tenantId,
            queryName: updateDataImportEventFailedQuery.name,
            query: updateDataImportEventFailedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', updateDataImportEventFailedPayload, InvocationType.RequestResponse);

        // looking for import type name for notification
        const query = new ParameterizedQuery('getDataImportTypeById', Queries.getDataImportTypeById);
        query.setParameter('@dataImportTypeId', dataImportTypeId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length || !result.recordset[0].Name) {
            console.error('Employee import type not found');
        } else {
            const dataImportTypeName = result.recordset[0].Name;

            const connections = await utilService.getConnectionsFromDynamoDBUsingAccessToken(accessToken);
            if (connections && connections.Items && connections.Items.length > 0) {
                const message: webSocketNotification.Message = {
                    data: `Employee import, type '${dataImportTypeName}' returned error`,
                    types: ['Global'],
                };

                const messages = connections.Items.map(async (connection) => {
                    return webSocketNotification.notifyClient(connection.ConnectionId, message);
                });
                await Promise.all(messages);
            } else {
                console.info('No active connections found');
            }
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
 * This method will update the DataImportEvent table with the Processing status
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportEventId: The unique identifer for the Employee Import event
 * @param {string} status: Global import status to be saved in DataImportEvent table
 */
export async function setDataImportEventStatusGlobal(
    tenantId: string,
    dataImportEventId: string,
    dataImportTypeId: string,
    status: string,
    active: number,
    accessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.setDataImportEventStatusGlobal');

    try {
        if (!tenantId || !dataImportEventId || !dataImportTypeId) {
            throw errorService
                .getErrorResponse(30)
                .setDeveloperMessage('Expected value to tenantId, dataImportEventId or dataImportTypeId not met.');
        }

        const updateDataImportEventStatusQuery = new ParameterizedQuery('updateDataImportEventStatus', Queries.updateDataImportEventStatus);
        updateDataImportEventStatusQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventStatusQuery.setParameter('@Status', status);
        updateDataImportEventStatusQuery.setParameter('@Active', active);

        const updateDataImportEventStatusPayload = {
            tenantId,
            queryName: updateDataImportEventStatusQuery.name,
            query: updateDataImportEventStatusQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        console.info(updateDataImportEventStatusPayload);

        await utilService.invokeInternalService('queryExecutor', updateDataImportEventStatusPayload, InvocationType.RequestResponse);

        // looking for import type name for notification
        const query = new ParameterizedQuery('getDataImportTypeById', Queries.getDataImportTypeById);
        query.setParameter('@dataImportTypeId', dataImportTypeId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length || !result.recordset[0].Name) {
            console.error('Employee import type not found');
        } else {
            try {
                const dataImportTypeName = result.recordset[0].Name;

                const connections = await utilService.getConnectionsFromDynamoDBUsingAccessToken(accessToken);
                if (connections && connections.Items && connections.Items.length > 0) {
                
                    const message: webSocketNotification.Message = {
                        data: `Employee import, type '${dataImportTypeName}' is ${status.toLowerCase()}`,
                        types: ['Global'],
                    };
    
                    const messages = connections.Items.map(async (connection) => {
                        return webSocketNotification.notifyClient(connection.ConnectionId, message);
                    });
                    return await Promise.all(messages);
                                       
                } else {
                    console.info('no active connections found');
                }  
            }
            catch {
                //We don't want to stop the importation if some errors happens in this step
                console.info('Error trying to send the notification through WebSocket protocol');
            }
        }

        return Promise.resolve();
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
export async function processFinalStatusAndNotify(
    tenantId: string,
    dataImportEventId: string,
    dataImportTypeId: string,
    accessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.processFinalStatusAndNotify');

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

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
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

        console.info(finalStatusGlobal);

        setDataImportEventStatusGlobal(tenantId, dataImportEventId, dataImportTypeId, finalStatusGlobal, 0, accessToken);

        console.info('Status updated');

        const getUserInfoQuery = new ParameterizedQuery('getUserFromDataImportEventID', Queries.getUserFromDataImportEventID);
        getUserInfoQuery.setParameter('@dataImportEventId', dataImportEventId);

        const payloadUser = {
            tenantId,
            queryName: getUserInfoQuery.name,
            query: getUserInfoQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultUserInfo: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadUser,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultUserInfo);

        if (resultUserInfo.recordsets[0].length > 0 && resultUserInfo.recordset[0].Email) {
            const creationDate = new Date(resultUserInfo.recordset[0].CreationDate);

            console.info('Send email to user');

            // send email
            utilService.sendEventNotification({
                urlParameters: {},
                invokerEmail: '',
                type: NotificationEventType.EmployeeImport,
                recipient: resultUserInfo.recordset[0].Email || '',
                status: finalStatusGlobal,
                creationDate: creationDate.toLocaleString('en-us', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                additionalMessage:
                    finalStatusGlobal == 'Partially Processed'
                        ? result.recordset
                              .map((a) => a.CSVRowStatus + ': ' + a.total)
                              .toString()
                              .replaceAll(',', '<br />')
                        : '',
            } as IEmployeeImportEvent); // Async call to invoke notification lambda - DO NOT AWAIT!!

            console.info('Email sent to user');
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

/**
 * Returns a CSV file with the row from database from DataImportEventId
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company
 * @param {string} dataImportId: The unique identifier for a import event
 * @param {string[]} queryParams: Used for status parameter
 * @returns {Promise<any>}: Promise of any.
 */
export async function downloadImportData(
    tenantId: string,
    companyId: string,
    dataImportId: string,
    queryParams: any,
): Promise<any> {
    console.info('EmployeeImport.Service.downloadImportData');

    try {
        const validQueryStringParameters = ['status'];

        let query = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        query.setParameter('@ID', dataImportId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordsets[0].length === 0) {
            throw new Error(`Import type not found`);
        }

        if (queryParams && queryParams['status']) {
            console.info('downloading lines with status ' + queryParams['status']);

            const csvHeader = result.recordset[0].CSVHeader;

            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            query = new ParameterizedQuery('getCSVRowsByStatus', Queries.getCSVRowsByStatus);
            query.setParameter('@DataImportEventId', dataImportId);
            query.setStringParameter('@Status', queryParams['status']);

            const payloadDetails = {
                tenantId: tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const resultDetails: any = await utilService.invokeInternalService(
                'queryExecutor',
                payloadDetails,
                utilService.InvocationType.RequestResponse,
            );

            if (resultDetails.recordsets[0].length === 0) {
                return undefined;
            }

            let csvOut =
                '"' +
                Object.values(csvHeader.split(',')).join('","') +
                '"' +
                `,"Error (correct error indicated, remove this column and save the file as XSLX extension before re-uploading the file)"\r\n`;
            resultDetails.recordsets[0].forEach((row) => {
                csvOut += `${row.CSVRowData},"${row.CSVRowNotes}"\r\n`;
            });

            return { data: encodeURIComponent(csvOut), mimeType: `.text/csv; charset=utf-8` };
        } else {
            console.info('downloading the original file');

            const fileName = result.recordset[0].FileName;

            const bucketName = configService.getEmployeeImportBucketName();
            const key = `imports/${tenantId}/${companyId}/${fileName}`;

            const params = {
                Bucket: bucketName,
                Key: key,
            };

            const url = await utilService.getSignedUrlSync('getObject', params);
            const mimeType = mime.contentType(fileName);

            return { data: url, mimeType: `.${mimeType}` };
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
        }
        console.error(error);
        throw errorService.getErrorResponse(50).setDeveloperMessage(error.message);
    }
}

function InsertEvoWage(evoKeys: IEvolutionKey, tenantName, evoAccessToken): IWage {
    console.info('EmployeeImport.service.InsertEvoWage');

    const myEvoWage: IWage = {
        employeeId: Number(evoKeys.employeeId),
        rate: {
            id: 1,
            isDefault: true,
            amount: 0,
        },
    };

    const postEvoWageResult: any = payrollService.postWageInEvo(tenantName, evoKeys, evoAccessToken, myEvoWage);
    console.info('===> postEvoWageResult');
    console.info(postEvoWageResult);

    return postEvoWageResult;
}

function LoadToPatchEmp(myPatch: IEvoPatch, empComp, wageId: number): IEvoPatch {
    console.info('EmployeeImport.service.LoadToPatchEmp');

    const patchOperation: IPatchOperation = {
        type: 'Replace',
        effectiveDate: empComp.EffectiveDate,
        pathGroup: [
            {
                path: '/salary',
                value: empComp.Rate,
            },
        ],
    };

    if (myPatch && myPatch.patchOperations) {
        myPatch.patchOperations.push(patchOperation);
    } else {
        myPatch = {
            id: wageId,
            patchOperations: [patchOperation],
        };
    }

    return myPatch;
}

function LoadToPatchWage(myPatch: IEvoPatch, empComp, wageId: number): IEvoPatch {
    console.info('EmployeeImport.service.LoadToPatchWage');

    const patchOperation: IPatchOperation = {
        type: 'Replace',
        effectiveDate: empComp.EffectiveDate,
        pathGroup: [
            {
                path: '/rate/id',
                value: 1,
            },
            {
                path: '/rate/amount',
                value: empComp.Rate,
            },
            {
                path: '/rate/isDefault',
                value: true,
            },
            {
                path: '/jobId',
                value: empComp.jobId,
            },
            {
                path: '/workerCompId',
                value: empComp.workerCompensationId,
            },
            {
                path: '/divisionId',
                value: empComp.org1Id,
            },
            {
                path: '/branchId',
                value: empComp.org2Id,
            },
            {
                path: '/departmentId',
                value: empComp.org3Id,
            },
            {
                path: '/teamId',
                value: empComp.org4Id,
            },
        ],
    };

    if (myPatch && myPatch.patchOperations) {
        myPatch.patchOperations.push(patchOperation);
    } else {
        myPatch = {
            id: wageId,
            patchOperations: [patchOperation],
        };
    }

    return myPatch;
}

function CreateDefaultPatchOperation(myPatch: IEvoPatch, wageId: number, effectiveDate: string, amount: any): IEvoPatch {
    console.info('EmployeeImport.service.CreateDefaultPatchOperation');

    const patchOperation: IPatchOperation = {
        type: 'Replace',
        effectiveDate: effectiveDate,
        pathGroup: [
            {
                path: '/rate/id',
                value: 1,
            },
            {
                path: '/rate/amount',
                value: amount,
            },
            {
                path: '/rate/isDefault',
                value: true,
            },
            {
                path: '/rate/isDefault',
                value: true,
            },
        ],
    };

    if (myPatch && myPatch.patchOperations) {
        myPatch.patchOperations.push(patchOperation);
    } else {
        myPatch = {
            id: wageId,
            patchOperations: [patchOperation],
        };
    }

    return myPatch;
}

async function UpdateEvoWage(myEvoWage: IWage, empComp, evoWageKeys: IEvolutionKey, tenantName, evoAccessToken) {
    console.info('EmployeeImport.Service.UpdateEvoWage');

    myEvoWage.employeeId = Number(evoWageKeys.employeeId);
    myEvoWage.divisionId = empComp.org1Id;
    myEvoWage.branchId = empComp.org2Id;
    myEvoWage.departmentId = empComp.org3Id;
    myEvoWage.teamId = empComp.org4Id;
    myEvoWage.jobId = empComp.jobId;

    myEvoWage.workersCompensation.id = empComp.workerCompensationId;
    myEvoWage.workersCompensation.description = empComp.workerCompDesc;
    myEvoWage.workersCompensation.state.id = empComp.stateId;

    const evoUpdateWageResult: any = await payrollService.updateWageInEvo(tenantName, evoWageKeys, evoAccessToken, myEvoWage);
    console.info('===> evoUpdateWageResult');
    console.info(evoUpdateWageResult);
}

/**
 * @param {CompensationUpdateCsvRowType} jsonCsvRow: The csv row with compensation data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
 * @param {string} tenantName: The tenant name from EVO
 * @param {string} evoAccessToken: The access token from EVO
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function updateCompensation(
    jsonCsvRow: CompensationUpdateCsvRowType,
    rowNumber: number,
    tenantId: string,
    companyId: string,
    dataImportTypeId: string,
    dataImportEventId: string,
    hrAccessToken: string,
    tenantName: string,
    evoAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.updateCompensation');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the compensation');
            throw new Error(`Token not found`);
        }

        //
        // Handling the csv columns order
        //

        console.info('===> Handling the csv columns order');

        const queryCSVHeader = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        queryCSVHeader.setParameter('@ID', dataImportEventId);

        const payloadCSVHeader = {
            tenantId,
            queryName: queryCSVHeader.name,
            query: queryCSVHeader.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultCSVHeader: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadCSVHeader,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultCSVHeader);

        if (resultCSVHeader.recordsets[0].length === 0) {
            throw new Error(`The CSV header could not be found`);
        }

        const csvRowDesiredOrder = resultCSVHeader.recordset[0].CSVHeader.split(',');
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach((key) => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];
        });
        const stringCsvRow = '"' + Object.values(jsonCsvRowReordered).join('","') + '"';

        //
        // Validating compensation details...
        //

        console.info('===> Validating compensation details');

        let validateCompensationDataEventQuery = new ParameterizedQuery('validateCompensation', Queries.validateCompensation);
        //If it has Employee Code in the header, it means it is a bulk import, in this case, use specific validation
        if (jsonCsvRow['Company Code']) {
            validateCompensationDataEventQuery = new ParameterizedQuery('validateCompensationInBulk', Queries.validateCompensationInBulk);
        }

        validateCompensationDataEventQuery.setStringParameter('@CsvRow', stringCsvRow);
        validateCompensationDataEventQuery.setParameter('@RowNumber', rowNumber);
        validateCompensationDataEventQuery.setStringParameter('@TenantId', tenantId);
        validateCompensationDataEventQuery.setParameter('@CompanyId', companyId);
        validateCompensationDataEventQuery.setParameter('@DataImportEventId', dataImportEventId);

        const validateCompensationPayload = {
            tenantId,
            queryName: validateCompensationDataEventQuery.name,
            query: validateCompensationDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const validateCompensationResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            validateCompensationPayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !validateCompensationResult ||
            !validateCompensationResult.recordset.length ||
            validateCompensationResult.recordset[0].StatusResult === undefined ||
            validateCompensationResult.recordset[0].StatusResult === null
        ) {
            console.error('===> StatusResult was not returned from the validateCompensation script');
            throw new Error(`Status was not returned from the validateCompensation script`);
        }

        const validateCompensationStatusResult: number = validateCompensationResult.recordset[0].StatusResult;
        if (validateCompensationStatusResult === 0) {
            console.info(
                `===> The compensation row was not pass the validation: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`,
            );
            return { isSuccess: false, message: 'The data provided did not pass validation' };
        }

        //
        // Updating compensation on AHR...
        //

        console.info('===> Updating compensation on AHR');

        let insertCompensationDataEventQuery = new ParameterizedQuery('insertCompensation', Queries.insertCompensation);
        //If it has Employee Code in the header, it means it is a bulk import, in this case, use specific script
        if (jsonCsvRow['Company Code']) {
            insertCompensationDataEventQuery = new ParameterizedQuery('insertCompensationInBulk', Queries.insertCompensationInBulk);
        }

        insertCompensationDataEventQuery.setStringParameter('@CsvRow', stringCsvRow);
        insertCompensationDataEventQuery.setParameter('@RowNumber', rowNumber);
        insertCompensationDataEventQuery.setStringParameter('@TenantId', tenantId);
        insertCompensationDataEventQuery.setParameter('@CompanyId', companyId);
        insertCompensationDataEventQuery.setParameter('@DataImportTypeId', dataImportTypeId);
        insertCompensationDataEventQuery.setParameter('@DataImportEventId', dataImportEventId);

        const insertCompensationPayload = {
            tenantId,
            queryName: insertCompensationDataEventQuery.name,
            query: insertCompensationDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const insertCompensationResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            insertCompensationPayload,
            utilService.InvocationType.RequestResponse,
        );
        if (
            !insertCompensationResult ||
            !insertCompensationResult.recordset.length ||
            insertCompensationResult.recordset[0].StatusResult === undefined ||
            insertCompensationResult.recordset[0].StatusResult === null
        ) {
            console.error('===> StatusResult was not returned from the insertCompensation script');
            throw new Error(`StatusResult was not returned from the insertCompensation script`);
        }

        const insertCompensationStatusResult: number = insertCompensationResult.recordset[0].StatusResult;
        if (insertCompensationStatusResult === 0) {
            console.info(
                `===> The compensation row was not inserted on AHR: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`,
            );
            throw new Error(`The compensation row was not inserted on AHR`);
        }

        //
        // Updating compensation on EVO...
        //

        const compensationId = insertCompensationResult.recordset[0].CompensationIdResult;

        try {
            console.info('===> Getting EVO information from AHR');

            const getEmployeeByEmployeeCodeDataEventQuery = new ParameterizedQuery(
                'getEmployeeByEmployeeCode',
                Queries.getEmployeeByEmployeeCode,
            );
            getEmployeeByEmployeeCodeDataEventQuery.setParameter('@CompanyID', companyId);
            getEmployeeByEmployeeCodeDataEventQuery.setStringParameter('@EmployeeCode', jsonCsvRowReordered['Employee Identifier']);

            const getEmployeeByEmployeeCodePayload = {
                tenantId,
                queryName: getEmployeeByEmployeeCodeDataEventQuery.name,
                query: getEmployeeByEmployeeCodeDataEventQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const getEmployeeByEmployeeCodeResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                getEmployeeByEmployeeCodePayload,
                utilService.InvocationType.RequestResponse,
            );

            if (
                !getEmployeeByEmployeeCodeResult ||
                !getEmployeeByEmployeeCodeResult.recordset.length ||
                getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === undefined ||
                getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === null ||
                getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === undefined ||
                getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === null ||
                getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === undefined ||
                getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === null
            ) {
                console.error('===> getEmployeeByEmployeeCodeResult do not have what we need to update on EVO');
                throw new Error(`Do not have what we need to update on EVO`);
            }

            const hrEmployee: any = getEmployeeByEmployeeCodeResult.recordset[0];
            const evoKeys: IEvolutionKey = {
                clientId: hrEmployee.EvoClientId,
                companyId: hrEmployee.EvoCompanyId,
                employeeId: hrEmployee.EvoEmployeeId,
            };

            if (evoKeys.clientId && evoKeys.companyId) {
                console.info('===> Getting EVO Wage information');

                const evoEmployeeWagesResult: any = await payrollService.getWagesFromEvoEmployee(tenantName, evoKeys, evoAccessToken);
                if (evoEmployeeWagesResult && evoEmployeeWagesResult.results) {
                    let myEvoWage: IWage;
                    let myEmpPatch: IEvoPatch;
                    let myWagePatch: IEvoPatch;

                    if (
                        evoEmployeeWagesResult.results.length == 0 ||
                        evoEmployeeWagesResult.results.filter((a) => a.rate.id == 1).length == 0
                    ) {
                        myEvoWage = InsertEvoWage(evoKeys, tenantName, evoAccessToken);
                    } else {
                        myEvoWage = evoEmployeeWagesResult.results.filter((a) => a.rate.id == 1)[0];
                    }

                    //Get all compensation from AHR by EmployeeID
                    const getEmployeeCompensationsQuery = new ParameterizedQuery(
                        'getEmployeeCompensationByEmployeeID',
                        Queries.getEmployeeCompensationByEmployeeID,
                    );
                    getEmployeeCompensationsQuery.setParameter('@EmployeeID', hrEmployee.ID);

                    const getEmployeeCompensationsPayload = {
                        tenantId,
                        queryName: getEmployeeCompensationsQuery.name,
                        query: getEmployeeCompensationsQuery.value,
                        queryType: QueryType.Simple,
                    } as DatabaseEvent;

                    const getEmployeeCompensationsResult: any = await utilService.invokeInternalService(
                        'queryExecutor',
                        getEmployeeCompensationsPayload,
                        utilService.InvocationType.RequestResponse,
                    );
                    if (!getEmployeeCompensationsResult || !getEmployeeCompensationsResult.recordset.length) {
                        console.error('===> No Compensation found in AHR database');
                        throw new Error(`No Compensation found in AHR database`);
                    } else {
                        const evoWageKeys: IEvolutionKey = {
                            clientId: hrEmployee.EvoClientId,
                            companyId: hrEmployee.EvoCompanyId,
                            employeeId: hrEmployee.EvoEmployeeId,
                            wageId: `${myEvoWage.id}`,
                        };

                        let executedUpdate = false;
                        getEmployeeCompensationsResult.recordset.forEach((empComp) => {
                            if (empComp.payTypeCode && empComp.payTypeCode === 'H') {
                                if (!executedUpdate && new Date(empComp.EffectiveDate) <= new Date()) {
                                    myWagePatch = CreateDefaultPatchOperation(myWagePatch, myEvoWage.id, empComp.EffectiveDate, empComp.Rate);
                                    UpdateEvoWage(myEvoWage, empComp, evoWageKeys, tenantName, evoAccessToken);
                                    executedUpdate = true;
                                } else {
                                    myWagePatch = LoadToPatchWage(myWagePatch, empComp, myEvoWage.id);
                                }

                                const myOldRate = empComp.Rate;
                                empComp.Rate = 0;
                                myEmpPatch = LoadToPatchEmp(myEmpPatch, empComp, myEvoWage.id);
                                empComp = myOldRate;
                            } else {
                                myEmpPatch = LoadToPatchEmp(myEmpPatch, empComp, myEvoWage.id);
                                myWagePatch = CreateDefaultPatchOperation(myWagePatch, myEvoWage.id, empComp.EffectiveDate, 0);

                                UpdateEvoWage(myEvoWage, empComp, evoWageKeys, tenantName, evoAccessToken);
                            }
                        });

                        if (myWagePatch.patchOperations) {
                            myWagePatch.id = myEvoWage.id;
                            const evoPatchWageResult: any = await payrollService.patchWageInEvo(
                                tenantName,
                                evoWageKeys,
                                evoAccessToken,
                                myWagePatch,
                            );
                            console.info('===> evoPatchWageResult');
                            console.info(evoPatchWageResult);
                        }

                        if (myEmpPatch.patchOperations) {
                            myEmpPatch.id = Number(evoKeys.employeeId);
                            const evoPatchEmployeeResult: any = await payrollService.patchEmployeeInEvo(
                                tenantName,
                                evoKeys,
                                evoAccessToken,
                                myEmpPatch,
                            );
                            console.info('===> evoPatchEmployeeResult');
                            console.info(evoPatchEmployeeResult);
                        }

                        // Update PR_Integration_PK column of the last compensation inserted above in the AHR
                        const updateCompensationWageIdQuery = new ParameterizedQuery('updateCompensation', Queries.updateCompensation);
                        updateCompensationWageIdQuery.setParameter('@evoWageId', myEvoWage.id);
                        updateCompensationWageIdQuery.setParameter('@employeeCompensationId', compensationId);

                        const updateCompensationPayload = {
                            tenantId,
                            queryName: updateCompensationWageIdQuery.name,
                            query: updateCompensationWageIdQuery.value,
                            queryType: QueryType.Simple,
                        } as DatabaseEvent;

                        const updateCompensationResult: any = await utilService.invokeInternalService(
                            'queryExecutor',
                            updateCompensationPayload,
                            utilService.InvocationType.RequestResponse,
                        );
                        if (!updateCompensationResult) {
                            console.error('===> The column responsible for integrating Evo and AHR was not updated');
                            throw new Error(`The column responsible for integrating Evo and AHR was not updated`);
                        }
                    }
                } else {
                    console.info('===> Path not mapped');
                }
            }

        } catch (err) {
            console.info(err);

            //Rollback implemented in case Evo fail
            const deleteCompensationQuery = new ParameterizedQuery('deleteCompensation', Queries.deleteCompensation);
            deleteCompensationQuery.setParameter('@id', compensationId);

            const deleteCompensationPayload = {
                tenantId,
                queryName: deleteCompensationQuery.name,
                query: deleteCompensationQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            console.info(deleteCompensationPayload);

            const deleteCompensationResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                deleteCompensationPayload,
                utilService.InvocationType.RequestResponse,
            );

            console.info(deleteCompensationResult);

            throw err;
        }

        const updateDataImportEventDetailProcessed = new ParameterizedQuery(
            'updateDataImportEventDetailProcessed',
            Queries.updateDataImportEventDetailProcessed,
        );
        updateDataImportEventDetailProcessed.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailProcessed.setParameter('@CSVRowNumber', rowNumber + 1);

        const updateDataImportEventDetailProcessedPayload = {
            tenantId,
            queryName: updateDataImportEventDetailProcessed.name,
            query: updateDataImportEventDetailProcessed.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailProcessedResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailProcessedPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailProcessedResult);

        return { isSuccess: true, message: 'Compensation was inserted successfully' };
    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        const updateDataImportEventDetailErrorQuery = new ParameterizedQuery(
            'updateDataImportEventDetailError',
            Queries.updateDataImportEventDetailError,
        );
        updateDataImportEventDetailErrorQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailErrorQuery.setParameter('@CSVRowNumber', rowNumber + 1);
        if (msgError.length > 199) {
            updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError.substring(0, 199));
        }
        else {
            updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError);
        }        

        const updateDataImportEventDetailErrorPayload = {
            tenantId,
            queryName: updateDataImportEventDetailErrorQuery.name,
            query: updateDataImportEventDetailErrorQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailErrorResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailErrorPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailErrorResult);

        return { isSuccess: false, message: msgError };
    }
}

async function GetAlternateRatesByEmployee(tenantId, employeeID, myRateNumber) {
    const getAlternateRatesByEmployeeQuery = new ParameterizedQuery('getAlternateRatesByEmployee', Queries.getAlternateRatesByEmployee);
    getAlternateRatesByEmployeeQuery.setParameter('@EmployeeID', employeeID);
    getAlternateRatesByEmployeeQuery.setParameter('@RateNumber_EVO', myRateNumber);

    const getAlternateRatesByEmployeePayload = {
        tenantId,
        queryName: getAlternateRatesByEmployeeQuery.name,
        query: getAlternateRatesByEmployeeQuery.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;

    const getAlternateRatesByEmployeeResult: any = await utilService.invokeInternalService(
        'queryExecutor',
        getAlternateRatesByEmployeePayload,
        utilService.InvocationType.RequestResponse,
    );
    return getAlternateRatesByEmployeeResult.recordset;
}

function LoadToPatchWageAlternateRate(myPatch: IEvoPatch, altRate, wageId: number): IEvoPatch {
    console.info('EmployeeImport.service.LoadToPatchWage');

    const patchOperation: IPatchOperation = {
        type: 'Replace',
        effectiveDate: altRate.StartDate,
        pathGroup: [
            {
                path: '/rate/id',
                value: altRate.RateNumber_EVO,
            },
            {
                path: '/rate/amount',
                value: altRate.HourlyRate,
            },
            {
                path: '/rate/isDefault',
                value: false,
            },
            {
                path: '/jobId',
                value: null,
            },
            {
                path: '/workersCompensation/id',
                value: altRate.workerCompensationId,
            },
            {
                path: '/divisionId',
                value: altRate.org1Id,
            },
            {
                path: '/branchId',
                value: altRate.org2Id,
            },
            {
                path: '/departmentId',
                value: altRate.org3Id,
            },
            {
                path: '/teamId',
                value: altRate.org4Id,
            },
        ],
    };

    if (myPatch && myPatch.patchOperations) {
        myPatch.patchOperations.push(patchOperation);
    } else {
        myPatch = {
            id: wageId,
            patchOperations: [patchOperation],
        };
    }

    return myPatch;
}

async function UpdateAltRate(tenantName, evoWageKeys: IEvolutionKey, evoAccessToken, myEvoWage: IWage, myPatch: IEvoPatch) {
    console.info('EmployeeImport.service.UpdateAltRate');

    evoWageKeys.wageId = myPatch.id.toString();

    if (!myEvoWage) {
        myEvoWage = {
            id: myPatch.id,
        };
    }

    myEvoWage.employeeId = Number(evoWageKeys.employeeId);

    const evoUpdateWageResult: any = await payrollService.updateWageInEvo(tenantName, evoWageKeys, evoAccessToken, myEvoWage);
    console.info('===> evoUpdateWageResult');
    console.info(evoUpdateWageResult);

    const evoPatchWageResult: any = await payrollService.patchWageInEvo(tenantName, evoWageKeys, evoAccessToken, myPatch);
    console.info('===> evoPatchWageResult');
    console.info(evoPatchWageResult);

    return evoPatchWageResult;
}

/**
 * @param {AlternateRateUpdateCsvRowType} jsonCsvRow: The csv row with altenate rate data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
 * @param {string} tenantName: The tenant name from EVO
 * @param {string} evoAccessToken: The access token from EVO
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function updateAlternateRate(
    jsonCsvRow: AlternateRateUpdateCsvRowType,
    rowNumber: number,
    tenantId: string,
    companyId: string,
    dataImportTypeId: string,
    dataImportEventId: string,
    hrAccessToken: string,
    tenantName: string,
    evoAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.updateAlternateRate');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the alternate rate');
            throw new Error(`Token not found`);
        }

        //
        // Handling the csv columns order
        //

        console.info('===> Handling the csv columns order');

        const queryCSVHeader = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        queryCSVHeader.setParameter('@ID', dataImportEventId);

        const payloadCSVHeader = {
            tenantId,
            queryName: queryCSVHeader.name,
            query: queryCSVHeader.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultCSVHeader: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadCSVHeader,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultCSVHeader);

        if (resultCSVHeader.recordsets[0].length === 0) {
            throw new Error(`The CSV header could not be found`);
        }

        const csvRowDesiredOrder = resultCSVHeader.recordset[0].CSVHeader.split(',');
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach((key) => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];
        });
        const stringCsvRow = '"' + Object.values(jsonCsvRowReordered).join('","') + '"';

        //
        // Validating alternate rate...
        //

        console.info('===> Validating alternate rate');

        let validateAlternateRateDataEventQuery = new ParameterizedQuery('validateAlternateRate', Queries.validateAlternateRate);
        //If it has Employee Code in the header, it means it is a bulk import, in this case, use specific validation
        if (jsonCsvRow['Company Code']) {
            validateAlternateRateDataEventQuery = new ParameterizedQuery('validateAlternateRateInBulk', Queries.validateAlternateRateInBulk);
        }

        validateAlternateRateDataEventQuery.setStringParameter('@CsvRow', stringCsvRow);
        validateAlternateRateDataEventQuery.setParameter('@RowNumber', rowNumber);
        validateAlternateRateDataEventQuery.setStringParameter('@TenantId', tenantId);
        validateAlternateRateDataEventQuery.setParameter('@CompanyId', companyId);
        validateAlternateRateDataEventQuery.setParameter('@DataImportEventId', dataImportEventId);

        const validateAlternateRatePayload = {
            tenantId,
            queryName: validateAlternateRateDataEventQuery.name,
            query: validateAlternateRateDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const validateAlternateRateResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            validateAlternateRatePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !validateAlternateRateResult ||
            !validateAlternateRateResult.recordset.length ||
            validateAlternateRateResult.recordset[0].StatusResult === undefined ||
            validateAlternateRateResult.recordset[0].StatusResult === null
        ) {
            console.error('===> StatusResult was not returned from the validateAlternateRate script');
            throw new Error(`Status was not returned from the validateAlternateRate script`);
        }

        const validateCompensationStatusResult: number = validateAlternateRateResult.recordset[0].StatusResult;
        if (validateCompensationStatusResult === 0) {
            console.info(
                `===> The alternate rate row was not pass the validation: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`,
            );
            return { isSuccess: false, message: 'The data provided did not pass validation' };
        }

        //
        // Inserting alternate rate on AHR...
        //

        console.info('===> Inserting alternate rate on AHR');

        const insertAlternateRateDataEventQuery = new ParameterizedQuery('insertAlternateRate', Queries.insertAlternateRate);
        insertAlternateRateDataEventQuery.setStringParameter('@CsvRow', stringCsvRow);
        insertAlternateRateDataEventQuery.setParameter('@RowNumber', rowNumber);
        insertAlternateRateDataEventQuery.setStringParameter('@TenantId', tenantId);
        insertAlternateRateDataEventQuery.setParameter('@CompanyId', companyId);
        insertAlternateRateDataEventQuery.setParameter('@DataImportTypeId', dataImportTypeId);
        insertAlternateRateDataEventQuery.setParameter('@DataImportEventId', dataImportEventId);

        const insertAlternateRatePayload = {
            tenantId,
            queryName: insertAlternateRateDataEventQuery.name,
            query: insertAlternateRateDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const insertAlternateRateResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            insertAlternateRatePayload,
            utilService.InvocationType.RequestResponse,
        );
        if (
            !insertAlternateRateResult ||
            !insertAlternateRateResult.recordset.length ||
            insertAlternateRateResult.recordset[0].StatusResult === undefined ||
            insertAlternateRateResult.recordset[0].StatusResult === null
        ) {
            console.error('===> StatusResult was not returned from the insertAlternateRate script');
            throw new Error(`StatusResult was not returned from the insertAlternateRate script`);
        }

        const insertAlternateRateStatusResult: number = insertAlternateRateResult.recordset[0].StatusResult;
        if (insertAlternateRateStatusResult === 0) {
            console.info(
                `===> The alternate rate row was not inserted on AHR: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`,
            );
            throw new Error(`The alternate rate row was not inserted on AHR`);
        }

        const alternaterateId = insertAlternateRateResult.recordset[0].AlternateRateIdResult;

        try {

            // Checking if company has integration with EVO

            const isEVOIntegratedCompanyQuery = new ParameterizedQuery('isEVOIntegratedCompany', Queries.isEVOIntegratedCompany);
            isEVOIntegratedCompanyQuery.setParameter('@CompanyID', companyId);

            const isEVOIntegratedCompanyPayload = {
                tenantId,
                queryName: isEVOIntegratedCompanyQuery.name,
                query: isEVOIntegratedCompanyQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const isEVOIntegratedCompanyResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                isEVOIntegratedCompanyPayload,
                utilService.InvocationType.RequestResponse,
            );

            console.info('===> isEVOIntegratedCompanyResult');
            console.info(isEVOIntegratedCompanyResult);

            if (
                !isEVOIntegratedCompanyResult ||
                !isEVOIntegratedCompanyResult.recordset.length ||
                isEVOIntegratedCompanyResult.recordset[0].PRIntegration_ClientID === undefined ||
                isEVOIntegratedCompanyResult.recordset[0].PR_Integration_PK === null
            ) {
                console.info('===> Company not integrated with EVO');
            } else {

                //
                // Inserting alternate rate on EVO...
                //

                console.info('===> Getting EVO information from AHR');

                const getEmployeeByEmployeeCodeDataEventQuery = new ParameterizedQuery(
                    'getEmployeeByEmployeeCode',
                    Queries.getEmployeeByEmployeeCode,
                );
                getEmployeeByEmployeeCodeDataEventQuery.setParameter('@CompanyID', companyId);
                getEmployeeByEmployeeCodeDataEventQuery.setStringParameter('@EmployeeCode', jsonCsvRowReordered['Employee Identifier']);

                const getEmployeeByEmployeeCodePayload = {
                    tenantId,
                    queryName: getEmployeeByEmployeeCodeDataEventQuery.name,
                    query: getEmployeeByEmployeeCodeDataEventQuery.value,
                    queryType: QueryType.Simple,
                } as DatabaseEvent;

                const getEmployeeByEmployeeCodeResult: any = await utilService.invokeInternalService(
                    'queryExecutor',
                    getEmployeeByEmployeeCodePayload,
                    utilService.InvocationType.RequestResponse,
                );

                if (
                    !getEmployeeByEmployeeCodeResult ||
                    !getEmployeeByEmployeeCodeResult.recordset.length ||
                    getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === undefined ||
                    getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === null ||
                    getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === undefined ||
                    getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === null ||
                    getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === undefined ||
                    getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === null
                ) {
                    console.error('===> getEmployeeByEmployeeCodeResult do not have what we need to update on EVO');
                    throw new Error(`Do not have what we need to update on EVO`);
                }

                const hrEmployee: any = getEmployeeByEmployeeCodeResult.recordset[0];
                const evoKeys: IEvolutionKey = {
                    clientId: hrEmployee.EvoClientId,
                    companyId: hrEmployee.EvoCompanyId,
                    employeeId: hrEmployee.EvoEmployeeId,
                };

                if (evoKeys.clientId && evoKeys.companyId) {
                    console.info('===> Getting EVO Wage information');

                    const myRateNumber_PKList = {};
                    const evoEmployeeWagesResult: any = await payrollService.getWagesFromEvoEmployee(tenantName, evoKeys, evoAccessToken);
                    console.info('===> evoEmployeeWagesResult');
                    console.info(evoEmployeeWagesResult);

                    if (evoEmployeeWagesResult && evoEmployeeWagesResult.results) {
                        if (evoEmployeeWagesResult.results.length > 0) {
                            evoEmployeeWagesResult.results.forEach((wage) => {
                                if (wage.rate && wage.rate.id) {
                                    if (wage.rate.id in myRateNumber_PKList) {
                                        if (myRateNumber_PKList[wage.rate.id] !== wage.id) {
                                            console.info('==> bad data');
                                        }
                                    } else {
                                        myRateNumber_PKList[wage.rate.id] = wage.id;
                                    }
                                }
                            });
                        }

                        let isNewWage = false;
                        if (!myRateNumber_PKList[jsonCsvRowReordered['Rate Number']]) {
                            isNewWage = true;
                        }

                        let myPatch: IEvoPatch;
                        

                        let myEvoWage: IWage;

                        const lstRateNumberAlternateRates = await GetAlternateRatesByEmployee(
                            tenantId,
                            hrEmployee.ID,
                            jsonCsvRowReordered['Rate Number'],
                        );
                        if (lstRateNumberAlternateRates.length > 0) {
                            lstRateNumberAlternateRates.forEach((altRate) => {
                                myPatch = LoadToPatchWageAlternateRate(myPatch, altRate, 0);
                            });
                        }

                        if (myPatch && myPatch.patchOperations && myPatch.patchOperations.length > 0) {
                            let myEvoWageID;
                            if (isNewWage) {
                                myEvoWage = {
                                    employeeId: Number(evoKeys.employeeId),
                                    rate: {
                                        id: jsonCsvRowReordered['Rate Number'],
                                        isDefault: false,
                                        amount: jsonCsvRowReordered['Hourly Rate'],
                                    },
                                };

                                const postEvoWageResult: any = await payrollService.postWageInEvo(
                                    tenantName,
                                    evoKeys,
                                    evoAccessToken,
                                    myEvoWage,
                                );
                                console.info('===> postEvoWageResult');
                                console.info(postEvoWageResult);

                                myEvoWageID = postEvoWageResult.id;
                                myEvoWage.id = myEvoWageID;
                                myPatch.id = myEvoWageID;

                                lstRateNumberAlternateRates.forEach((altRate) => {
                                    if (Number(altRate.ID) === Number(alternaterateId)) {
                                        myEvoWage.divisionId = altRate.org1Id;
                                        myEvoWage.branchId = altRate.org2Id;
                                        myEvoWage.departmentId = altRate.org3Id;
                                        myEvoWage.teamId = altRate.org4Id;

                                        myEvoWage.jobId = altRate.jobId;
                                        myEvoWage.payGradeId = altRate.payGradeId;
                                        myEvoWage.positionId = altRate.positionId;

                                        myEvoWage.workersCompensation = {
                                            id: altRate.workerCompensationId,
                                            description: altRate.workerCompDesc,
                                            state: {
                                                id: altRate.stateId,
                                            },
                                        };
                                    }
                                });
                            } else {
                                myEvoWageID = myRateNumber_PKList[jsonCsvRowReordered['Rate Number']];
                                myPatch.id = myEvoWageID;

                                lstRateNumberAlternateRates.forEach((altRate) => {
                                    if (Number(altRate.ID) === Number(alternaterateId)) {
                                        myEvoWage = {
                                            divisionId: altRate.org1Id,
                                            branchId: altRate.org2Id,
                                            departmentId: altRate.org3Id,
                                            teamId: altRate.org4Id,
                                            employeeId: Number(evoKeys.employeeId),
                                            id: altRate.altRateId,
                                            jobId: altRate.jobId,
                                            rate: {
                                                id: jsonCsvRowReordered['Rate Number'],
                                                isDefault: false,
                                                amount: jsonCsvRowReordered['Hourly Rate'],
                                            },
                                            payGradeId: altRate.payGradeId,
                                            positionId: altRate.positionId,
                                            workersCompensation: {
                                                id: altRate.workerCompensationId,
                                                description: altRate.workerCompDesc,
                                                state: {
                                                    id: altRate.stateId,
                                                },
                                            },
                                        };
                                    }
                                });
                            }

                            // Run Patch
                            await UpdateAltRate(tenantName, evoKeys, evoAccessToken, myEvoWage, myPatch);

                            // Update PR_Integration_PK column of the last compensation inserted above in the AHR
                            const updateAlternateRateWageIdQuery = new ParameterizedQuery('updateAlternateRate', Queries.updateAlternateRate);
                            updateAlternateRateWageIdQuery.setParameter('@evoWageId', myEvoWageID);
                            updateAlternateRateWageIdQuery.setParameter('@employeeAlternateRateId', alternaterateId);

                            const pdateAlternateRatePayload = {
                                tenantId,
                                queryName: updateAlternateRateWageIdQuery.name,
                                query: updateAlternateRateWageIdQuery.value,
                                queryType: QueryType.Simple,
                            } as DatabaseEvent;

                            const updateAlternateRateResult: any = await utilService.invokeInternalService(
                                'queryExecutor',
                                pdateAlternateRatePayload,
                                utilService.InvocationType.RequestResponse,
                            );
                            if (!updateAlternateRateResult) {
                                console.error('===> The column responsible for integrating Evo and AHR was not updated');
                                throw new Error(`The column responsible for integrating Evo and AHR was not updated`);
                            }
                        } else {
                            console.info('Rate Number does not exist in EVO, so there is nothing to update');
                            return undefined;
                        }
                    } else {
                        console.info('No alternate rates found on EVO');
                    }
                }
            }

        } catch(err) {
            console.error(err);

            //Rollback implemented in case Evo fail
            const deleteAlternateRateQuery = new ParameterizedQuery('deleteAlternateRate', Queries.deleteAlternateRate);
            deleteAlternateRateQuery.setParameter('@id', alternaterateId);

            const deleteAlternateRatePayload = {
                tenantId,
                queryName: deleteAlternateRateQuery.name,
                query: deleteAlternateRateQuery.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            console.info(deleteAlternateRatePayload);

            const deleteAlternateRateResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                deleteAlternateRatePayload,
                utilService.InvocationType.RequestResponse,
            );

            console.info(deleteAlternateRateResult);

            throw err;
        }        

        const updateDataImportEventDetailProcessed = new ParameterizedQuery(
            'updateDataImportEventDetailProcessed',
            Queries.updateDataImportEventDetailProcessed,
        );
        updateDataImportEventDetailProcessed.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailProcessed.setParameter('@CSVRowNumber', rowNumber + 1);

        const updateDataImportEventDetailProcessedPayload = {
            tenantId,
            queryName: updateDataImportEventDetailProcessed.name,
            query: updateDataImportEventDetailProcessed.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailProcessedResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailProcessedPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailProcessedResult);

        return { isSuccess: true, message: 'Alternate rate was inserted successfully' };
    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        const updateDataImportEventDetailErrorQuery = new ParameterizedQuery(
            'updateDataImportEventDetailError',
            Queries.updateDataImportEventDetailError,
        );
        updateDataImportEventDetailErrorQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailErrorQuery.setParameter('@CSVRowNumber', rowNumber + 1);

        if (msgError.length > 199) {
            updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError.substring(0, 199));
        }
        else {
            updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError);
        } 

        const updateDataImportEventDetailErrorPayload = {
            tenantId,
            queryName: updateDataImportEventDetailErrorQuery.name,
            query: updateDataImportEventDetailErrorQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailErrorResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailErrorPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailErrorResult);

        return { isSuccess: false, message: msgError };
    }
}

/**
 * @param {EmployeeUpdateCsvRowType} jsonCsvRow: The csv row with employee data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
 * @param {string} tenantName: The tenant name from EVO
 * @param {string} evoAccessToken: The access token from EVO
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function updateEmployeeInBulk(
    jsonCsvRow: EmployeeUpdateCsvRowType,
    rowNumber: number,
    tenantId: string,
    dataImportTypeId: string,
    dataImportEventId: string,
    hrAccessToken: string,
    tenantName: string,
    evoAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.updateEmployeeInBulk');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the employee on EVO');
            throw new Error(`Token not found`);
        }

        //
        // Handling the csv columns order
        //
        console.info('===> Handling the csv columns order');

        const queryCSVHeader = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        queryCSVHeader.setParameter('@ID', dataImportEventId);

        const payloadCSVHeader = {
            tenantId,
            queryName: queryCSVHeader.name,
            query: queryCSVHeader.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultCSVHeader: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadCSVHeader,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultCSVHeader);

        if (resultCSVHeader.recordsets[0].length === 0) {
            throw new Error(`The CSV header could not be found`);
        }

        const csvRowDesiredOrder = resultCSVHeader.recordset[0].CSVHeader.split(',');
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach((key) => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];
        });
        console.info(jsonCsvRowReordered);

        //
        // Getting companyId by Company Code...
        //
        console.info('===> Getting companyId by Company Code');

        const getCompanyIdByCompanyCodeQuery = new ParameterizedQuery('getCompanyIdByCompanyCode', Queries.getCompanyIdByCompanyCode);
        getCompanyIdByCompanyCodeQuery.setStringParameter('@CompanyCode', jsonCsvRowReordered['Company Code']);

        const getCompanyIdByCompanyCodePayload = {
            tenantId,
            queryName: getCompanyIdByCompanyCodeQuery.name,
            query: getCompanyIdByCompanyCodeQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getCompanyIdByCompanyCodeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getCompanyIdByCompanyCodePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !getCompanyIdByCompanyCodeResult ||
            !getCompanyIdByCompanyCodeResult.recordset.length ||
            getCompanyIdByCompanyCodeResult.recordset[0].id === undefined ||
            getCompanyIdByCompanyCodeResult.recordset[0].id === null
        ) {
            console.error('===> Company not found');
            throw new Error(`Company not found`);
        }
        
        const companyId = getCompanyIdByCompanyCodeResult.recordset[0].id;

        return await updateEmployee(jsonCsvRow, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken, tenantName, evoAccessToken);
    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        const updateDataImportEventDetailErrorQuery = new ParameterizedQuery(
            'updateDataImportEventDetailError',
            Queries.updateDataImportEventDetailError,
        );
        updateDataImportEventDetailErrorQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailErrorQuery.setParameter('@CSVRowNumber', rowNumber + 1);
        updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError);

        const updateDataImportEventDetailErrorPayload = {
            tenantId,
            queryName: updateDataImportEventDetailErrorQuery.name,
            query: updateDataImportEventDetailErrorQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailErrorResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailErrorPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailErrorResult);
        
        return { isSuccess: false, message: msgError };

    }
}

/**
 * @param {CompensationUpdateCsvRowType} jsonCsvRow: The csv row with compensation data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
 * @param {string} tenantName: The tenant name from EVO
 * @param {string} evoAccessToken: The access token from EVO
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function updateCompensationInBulk(
    jsonCsvRow: CompensationUpdateCsvRowType,
    rowNumber: number,
    tenantId: string,
    dataImportTypeId: string,
    dataImportEventId: string,
    hrAccessToken: string,
    tenantName: string,
    evoAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.updateCompensationInBulk');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the compensation');
            throw new Error(`Token not found`);
        }

        //
        // Handling the csv columns order
        //

        console.info('===> Handling the csv columns order');

        const queryCSVHeader = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        queryCSVHeader.setParameter('@ID', dataImportEventId);

        const payloadCSVHeader = {
            tenantId,
            queryName: queryCSVHeader.name,
            query: queryCSVHeader.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultCSVHeader: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadCSVHeader,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultCSVHeader);

        if (resultCSVHeader.recordsets[0].length === 0) {
            throw new Error(`The CSV header could not be found`);
        }

        const csvRowDesiredOrder = resultCSVHeader.recordset[0].CSVHeader.split(',');
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach((key) => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];
        });
        console.info(jsonCsvRowReordered);

        //
        // Getting companyId by Company Code...
        //
        console.info('===> Getting companyId by Company Code');

        const getCompanyIdByCompanyCodeQuery = new ParameterizedQuery('getCompanyIdByCompanyCode', Queries.getCompanyIdByCompanyCode);
        getCompanyIdByCompanyCodeQuery.setStringParameter('@CompanyCode', jsonCsvRowReordered['Company Code']);

        const getCompanyIdByCompanyCodePayload = {
            tenantId,
            queryName: getCompanyIdByCompanyCodeQuery.name,
            query: getCompanyIdByCompanyCodeQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getCompanyIdByCompanyCodeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getCompanyIdByCompanyCodePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !getCompanyIdByCompanyCodeResult ||
            !getCompanyIdByCompanyCodeResult.recordset.length ||
            getCompanyIdByCompanyCodeResult.recordset[0].id === undefined ||
            getCompanyIdByCompanyCodeResult.recordset[0].id === null
        ) {
            console.error('===> Company not found');
            throw new Error(`Company not found`);
        }
        
        const companyId = getCompanyIdByCompanyCodeResult.recordset[0].id;

        return await updateCompensation(jsonCsvRow, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken, tenantName, evoAccessToken);
    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        const updateDataImportEventDetailErrorQuery = new ParameterizedQuery(
            'updateDataImportEventDetailError',
            Queries.updateDataImportEventDetailError,
        );
        updateDataImportEventDetailErrorQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailErrorQuery.setParameter('@CSVRowNumber', rowNumber + 1);
        updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError);

        const updateDataImportEventDetailErrorPayload = {
            tenantId,
            queryName: updateDataImportEventDetailErrorQuery.name,
            query: updateDataImportEventDetailErrorQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailErrorResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailErrorPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailErrorResult);

        return { isSuccess: false, message: msgError };
    }
}

/**
 * @param {AlternateRateUpdateCsvRowType} jsonCsvRow: The csv row with altenate rate data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
 * @param {string} tenantName: The tenant name from EVO
 * @param {string} evoAccessToken: The access token from EVO
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function updateAlternateRateInBulk(
    jsonCsvRow: AlternateRateUpdateCsvRowType,
    rowNumber: number,
    tenantId: string,
    dataImportTypeId: string,
    dataImportEventId: string,
    hrAccessToken: string,
    tenantName: string,
    evoAccessToken: string,
): Promise<any> {
    console.info('EmployeeImport.Service.updateAlternateRateInBulk');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the alternate rate');
            throw new Error(`Token not found`);
        }

        //
        // Handling the csv columns order
        //

        console.info('===> Handling the csv columns order');

        const queryCSVHeader = new ParameterizedQuery(
            'getImportTypeAndImportedFilePathByImportEventID',
            Queries.getImportTypeAndImportedFilePathByImportEventID,
        );
        queryCSVHeader.setParameter('@ID', dataImportEventId);

        const payloadCSVHeader = {
            tenantId,
            queryName: queryCSVHeader.name,
            query: queryCSVHeader.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const resultCSVHeader: any = await utilService.invokeInternalService(
            'queryExecutor',
            payloadCSVHeader,
            utilService.InvocationType.RequestResponse,
        );
        console.info(resultCSVHeader);

        if (resultCSVHeader.recordsets[0].length === 0) {
            throw new Error(`The CSV header could not be found`);
        }

        const csvRowDesiredOrder = resultCSVHeader.recordset[0].CSVHeader.split(',');
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach((key) => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];
        });
        console.info(jsonCsvRowReordered);

        //
        // Getting companyId by Company Code...
        //
        console.info('===> Getting companyId by Company Code');

        const getCompanyIdByCompanyCodeQuery = new ParameterizedQuery('getCompanyIdByCompanyCode', Queries.getCompanyIdByCompanyCode);
        getCompanyIdByCompanyCodeQuery.setStringParameter('@CompanyCode', jsonCsvRowReordered['Company Code']);

        const getCompanyIdByCompanyCodePayload = {
            tenantId,
            queryName: getCompanyIdByCompanyCodeQuery.name,
            query: getCompanyIdByCompanyCodeQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getCompanyIdByCompanyCodeResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            getCompanyIdByCompanyCodePayload,
            utilService.InvocationType.RequestResponse,
        );

        if (
            !getCompanyIdByCompanyCodeResult ||
            !getCompanyIdByCompanyCodeResult.recordset.length ||
            getCompanyIdByCompanyCodeResult.recordset[0].id === undefined ||
            getCompanyIdByCompanyCodeResult.recordset[0].id === null
        ) {
            console.error('===> Company not found');
            throw new Error(`Company not found`);
        }
        
        const companyId = getCompanyIdByCompanyCodeResult.recordset[0].id;

        return await updateAlternateRate(jsonCsvRow, rowNumber, tenantId, companyId, dataImportTypeId, dataImportEventId, hrAccessToken, tenantName, evoAccessToken);
    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        const updateDataImportEventDetailErrorQuery = new ParameterizedQuery(
            'updateDataImportEventDetailError',
            Queries.updateDataImportEventDetailError,
        );
        updateDataImportEventDetailErrorQuery.setParameter('@DataImportEventId', dataImportEventId);
        updateDataImportEventDetailErrorQuery.setParameter('@CSVRowNumber', rowNumber + 1);
        updateDataImportEventDetailErrorQuery.setStringParameter('@CSVRowNotes', msgError);

        const updateDataImportEventDetailErrorPayload = {
            tenantId,
            queryName: updateDataImportEventDetailErrorQuery.name,
            query: updateDataImportEventDetailErrorQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const updateDataImportEventDetailErrorResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            updateDataImportEventDetailErrorPayload,
            utilService.InvocationType.RequestResponse,
        );
        console.info(updateDataImportEventDetailErrorResult);

        return { isSuccess: false, message: msgError };
    }
}

type TenantDetails = {
    accountName: string;
    applicationUrl: string;
    contact: {
        firstName: string;
        lastName: string;
        emailAddress: string;
    };
};

/**
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} hrAccessToken: The access token from AHR
 * @returns {Promise<any>}: A Promise of the result [true or false]
 */
export async function clearCache(tenantId: string, hrAccessToken: string): Promise<any> {
    console.info('EmployeeImport.Service.clearCache');

    try {
        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the alternate rate');
            throw new Error(`Token not found`);
        }

        const tenantInfo = new ParameterizedQuery('TenantInfo', Queries.tenantInfo,);
        const payload = {
            tenantId,
            queryName: tenantInfo.name,
            query: tenantInfo.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );

        console.info('==> result:');
        console.info(result);

        const tenant: TenantDetails[] = (result.recordset || []).map((entry) => {
            return {
                accountName: entry.AccountName,
                applicationUrl: `${(entry.TenantUrls as string).split(';')[0]}`,
                contact: {
                    firstName: entry.ContactFirstName,
                    lastName: entry.ContactLastName,
                    emailAddress: entry.PrimaryContactEmail,
                },
            };
        });

        if (tenant.length > 0) {        
            console.info(`Clear cache in ${tenant[0].applicationUrl}`);

            const clearCacheResult = await request
            .post(`https://${tenant[0].applicationUrl}/Classes/Service/hrnextDataService.asmx`)
            .set('Content-Type', 'application/soap+xml; charset=utf-8')
            .send(`<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
   <soap:Header/>
   <soap:Body>
      <tem:ClearCache>
         <tem:accessToken>${hrAccessToken}</tem:accessToken>
      </tem:ClearCache>
   </soap:Body>
</soap:Envelope>`);

            console.info(clearCacheResult);

            return { isSuccess: true, message: clearCacheResult };
        }

        return { isSuccess: false, message: 'No endpoint found to trigger cache clearing.' };

    } catch (error) {
        console.info(error);

        let msgError = '';
        if (error instanceof ErrorMessage) {
            msgError = error.message;
        } else if (error.error && error.error.developerMessage) {
            msgError = error.error.developerMessage;
        } else if (typeof error === 'object') {
            msgError = error.toString();
        } else {
            msgError = error;
        }

        console.info(msgError);

        return { isSuccess: false, message: msgError };
    }
}

/**
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} hrAccessToken: The access token from AHR
 * @returns {Promise<any>}: A Promise of the result json object with EVO token and tenant name
 */
export async function getEvoTokenAndTenantName(tenantId: string, hrAccessToken: string,): Promise<any> {
    console.info('EmployeeImport.Service.getEvoTokenAndTenantName');
    const evoAccessToken: string = await utilService.getEvoTokenWithHrToken(tenantId, hrAccessToken);
    
    console.info('==> evoAccessToken');
    console.info(evoAccessToken);
    const tenantObject = await ssoService.getTenantById(tenantId, evoAccessToken);
    
    console.info('==> tenantObject');
    console.info(tenantObject);
    const tenantName = tenantObject.subdomain;
    return {
        tenantName,
        evoAccessToken
    };
}

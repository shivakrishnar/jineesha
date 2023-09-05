import * as AWS from 'aws-sdk';
import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
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
import { IDataImportType, IDataImportEventDetail, IDataImport, EmployeeUpdateCsvRowType } from './DataImport';
import * as mime from 'mime-types';
import fetch from 'node-fetch';
import { IEvolutionKey } from '../../models/IEvolutionKey';
import * as ssoService from '../../../remote-services/sso.service';

const employeeImportPageSize = '6';

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

    const validQueryStringParameters = ['pageToken', 'search', 'status', 'active'];

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

            if (queryParams['status']) {
                query.setStringParameter('@status', queryParams['status']);
            }
            else {
                query.setStringParameter('@status', '%');
            }

            if (queryParams['active']) {
                query.setStringParameter('@active', queryParams['active']);
            }
            else {
                query.setStringParameter('@active', '%');
            }
        }
        else {
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

        if (result.recordsets[1].length === 0) {
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
                userName: record.Username
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
 * @param {string} dataImportTypeId: The unique identifier for the data import type
 * @param {string} fileName: File name with extension
 * @param {number} userId: The unique identifer for the user
 * @param {string} hrAccessToken: The access token from AHR
 * @returns {Promise<any>}: A Promise of a URL or file
 */
export async function dataImports(tenantId: string, companyId: string, dataImportTypeId: string, fileName: string, userId: number, hrAccessToken: string): Promise<any> {
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
        const response = await fetch(signedUrl);
        const csvData = await response.text();
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

        //
        // Calling the step function to do the validation and update for each row of the csv file...
        // I've leave the line below as a example for local test, please DO NOT remove this line.
        //const stepFunctionArnName = 'arn:aws:states:us-east-1:317299412255:stateMachine:HrEmployeeImportStateMachine-development';
        const stepFunctionArnName = configService.getHrEmployeeImportStateMachineArn();
        const stepFunctionInputs = { tenantId, companyId, dataImportTypeId, fileName, dataImportEventId, csvRelativePath: key, userId, hrAccessToken };
        const stepFunctions = new AWS.StepFunctions();     
        const stepFunctionsParams = {
            stateMachineArn: stepFunctionArnName,
            input: JSON.stringify(stepFunctionInputs),
        };

        await stepFunctions.startExecution(stepFunctionsParams).promise();

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
 * @param {EmployeeUpdateCsvRowType} jsonCsvRow: The csv row with employee data
 * @param {number} rowNumber: Current row number of the csv row
 * @param {string} tenantId: The unique identifer for the tenant
 * @param {string} companyId: The unique identifer for the company
 * @param {string} dataImportTypeId: The ID of DataImportType
 * @param {string} dataImportEventId: The ID of DataImportEvent
 * @param {string} hrAccessToken: The access token from AHR
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
): Promise<any> {
    console.info('EmployeeImport.Service.updateEmployee');

    try {
        //
        // Handling the csv columns order
        //

        console.info('===> Handling the csv columns order');

        const csvRowDesiredOrder = [
            "Employee Code", "Birthdate", "Time Clock Number", "Email", "Home Phone",
            "Work Phone", "Cell Phone", "Gender", "Ethnicity", "Education Level", 
            "Tobacco User", "Disabled", "Military Reserve", "Veteran", "Memo 1", 
            "Memo 2", "Memo 3", "Pay Frequency", "Standard Payroll Hours", 
            "FLSA Classification", "Position", "Reports To 1", "Reports To 2", 
            "Reports To 3", "Supervisor (SC)", "Benefit Class/Eligibility Group", 
            "EEO Category", "Worker Comp Code", "Change Reason", "Comment"
            ];
        const jsonCsvRowReordered = {};
        csvRowDesiredOrder.forEach(key => {
            jsonCsvRowReordered[key] = jsonCsvRow[key];            
        });
        const stringCsvRow = Object.values(jsonCsvRowReordered).join(",");

        //
        // Validating employee details...
        //

        console.info('===> Validating employee details');

        const validateEmployeeDetailsDataEventQuery = new ParameterizedQuery('validateEmployeeDetails', Queries.validateEmployeeDetails);
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

        const validateEmployeeResult: any = await utilService.invokeInternalService('queryExecutor', validateEmployeeDetailsPayload, utilService.InvocationType.RequestResponse);
        if (!validateEmployeeResult || !validateEmployeeResult.recordset.length || validateEmployeeResult.recordset[0].StatusResult === undefined || validateEmployeeResult.recordset[0].StatusResult === null) {
            console.error('===> StatusResult was not returned from the validateEmployee script');
            return undefined;
        }
        const validateEmployeeStatusResult: number = validateEmployeeResult.recordset[0].StatusResult;

        //
        // Updating employee on AHR...
        //

        console.info('===> Updating employee on AHR');

        if (validateEmployeeStatusResult === 0) {
            console.info(`===> The employee row was not pass the validation: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`);
            return undefined;
        }
        const updateEmployeeDataEventQuery = new ParameterizedQuery('updateEmployee', Queries.updateEmployee);
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

        const updateEmployeeResult: any = await utilService.invokeInternalService('queryExecutor', updateEmployeePayload, utilService.InvocationType.RequestResponse);

        if (!updateEmployeeResult || !updateEmployeeResult.recordset.length || updateEmployeeResult.recordset[0].StatusResult === undefined || updateEmployeeResult.recordset[0].StatusResult === null) {
            console.error('===> StatusResult was not returned from the updateEmployee script');
            return undefined;
        }
        const updateEmployeeStatusResult: number = updateEmployeeResult.recordset[0].StatusResult;

        //
        // Updating employee on EVO...
        //

		console.info('===> Starting the process to update an employee in EVO');

        if (updateEmployeeStatusResult === 0) {
            console.info(`===> The employee row was not updated on AHR: TenantId: ${tenantId} | CompanyId: ${companyId} | DataImportEventId: ${dataImportEventId} | CsvRowNumber: ${rowNumber}`);
            return undefined;
        }

        console.info('===> Getting EVO information from AHR');

        const getEmployeeByEmployeeCodeDataEventQuery = new ParameterizedQuery('getEmployeeByEmployeeCode', Queries.getEmployeeByEmployeeCode);
        getEmployeeByEmployeeCodeDataEventQuery.setParameter('@CompanyID', companyId);		
        getEmployeeByEmployeeCodeDataEventQuery.setStringParameter('@EmployeeCode', jsonCsvRowReordered["Employee Code"]);

        const getEmployeeByEmployeeCodePayload = {
            tenantId,
            queryName: getEmployeeByEmployeeCodeDataEventQuery.name,
            query: getEmployeeByEmployeeCodeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getEmployeeByEmployeeCodeResult: any = await utilService.invokeInternalService('queryExecutor', getEmployeeByEmployeeCodePayload, utilService.InvocationType.RequestResponse);

        if (!getEmployeeByEmployeeCodeResult || !getEmployeeByEmployeeCodeResult.recordset.length || 
            getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === undefined || getEmployeeByEmployeeCodeResult.recordset[0].EvoEmployeeId === null ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === undefined || getEmployeeByEmployeeCodeResult.recordset[0].EvoCompanyId === null ||
            getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === undefined || getEmployeeByEmployeeCodeResult.recordset[0].EvoClientId === null) {
            console.error('===> getEmployeeByEmployeeCodeResult do not have what we need to update on EVO');
            return undefined;
        }

        const hrEmployee: any = getEmployeeByEmployeeCodeResult.recordset[0];
        const evoKeys: IEvolutionKey = {
            clientId: hrEmployee.EvoClientId,
            companyId: hrEmployee.EvoCompanyId,
            employeeId: hrEmployee.EvoEmployeeId
        };

        console.info('===> Configuring EVO object information before API call');

        if (!hrAccessToken || !hrAccessToken.length) {
            console.info('===> hrAccessToken not found and we need him to update the employee on EVO');
            return undefined;
        }        
        const evoAccessToken: string = await utilService.getEvoTokenWithHrToken(tenantId, hrAccessToken);
        const tenantObject = await ssoService.getTenantById(tenantId, evoAccessToken);
        const tenantName = tenantObject.subdomain;
        const evoEmployee: any = await payrollService.getEmployeeFromEvo(tenantName, evoKeys, evoAccessToken);

        if (!evoEmployee) {
            console.error('===> evoEmployee does not exists in EVO');
            return undefined;
        }

        console.info('===> Getting PositionType from AHR for EVO');

        const getPositionTypeEvoIdByCodeDataEventQuery = new ParameterizedQuery('getPositionTypeEvoIdByCode', Queries.getPositionTypeEvoIdByCode);
        getPositionTypeEvoIdByCodeDataEventQuery.setParameter('@CompanyID', companyId);		
        getPositionTypeEvoIdByCodeDataEventQuery.setStringParameter('@Code', jsonCsvRowReordered["Position"]);

        const getPositionTypeEvoIdByCodePayload = {
            tenantId,
            queryName: getPositionTypeEvoIdByCodeDataEventQuery.name,
            query: getPositionTypeEvoIdByCodeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getPositionTypeEvoIdByCodeResult: any = await utilService.invokeInternalService('queryExecutor', getPositionTypeEvoIdByCodePayload, utilService.InvocationType.RequestResponse);

        if (getPositionTypeEvoIdByCodeResult || getPositionTypeEvoIdByCodeResult.recordset.length){
            evoEmployee.positionId = getPositionTypeEvoIdByCodeResult.recordset[0].PositionTypeEvoId;
        }

        console.info('===> Getting WorkerCompType from AHR for EVO');

        const getWorkerCompTypeEvoIdByCodeDataEventQuery = new ParameterizedQuery('getWorkerCompTypeEvoIdByCode', Queries.getWorkerCompTypeEvoIdByCode);
        getWorkerCompTypeEvoIdByCodeDataEventQuery.setParameter('@CompanyID', companyId);		
        getWorkerCompTypeEvoIdByCodeDataEventQuery.setStringParameter('@Code', jsonCsvRowReordered["Worker Comp Code"]);

        const getWorkerCompTypeEvoIdByCodePayload = {
            tenantId,
            queryName: getWorkerCompTypeEvoIdByCodeDataEventQuery.name,
            query: getWorkerCompTypeEvoIdByCodeDataEventQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const getWorkerCompTypeEvoIdByCodeResult: any = await utilService.invokeInternalService('queryExecutor', getWorkerCompTypeEvoIdByCodePayload, utilService.InvocationType.RequestResponse);

        if (getWorkerCompTypeEvoIdByCodeResult || getWorkerCompTypeEvoIdByCodeResult.recordset.length){
            evoEmployee.workersCompensationId = getWorkerCompTypeEvoIdByCodeResult.recordset[0].WorkerCompTypeEvoId;
        }

        console.info('===> Configuring the others fields of the EVO object');

        evoEmployee.employeeNumber = jsonCsvRowReordered["Employee Code"];
        evoEmployee.email = jsonCsvRowReordered["Email"] || null;
        evoEmployee.standardHours = jsonCsvRowReordered["Standard Payroll Hours"] || null;
        evoEmployee.timeClockNumber = jsonCsvRowReordered["Time Clock Number"] || null;
        evoEmployee.payFrequency = jsonCsvRowReordered["Pay Frequency"] || null;
        evoEmployee.person.email = jsonCsvRowReordered["Email"] || null;        
        evoEmployee.person.birthDate = jsonCsvRowReordered["Birthdate"] || null;

        if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "0") {
            evoEmployee.eeoCode = "None";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "1.1") {
            evoEmployee.eeoCode = "Executive";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "1.2") {
            evoEmployee.eeoCode = "Manager";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "2") {
            evoEmployee.eeoCode = "Professional";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "3") {
            evoEmployee.eeoCode = "Technician";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "4") {
            evoEmployee.eeoCode = "Sales";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "5") {
            evoEmployee.eeoCode = "Administrative";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "6") {
            evoEmployee.eeoCode = "Craft";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "7") {
            evoEmployee.eeoCode = "Operative";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "8") {
            evoEmployee.eeoCode = "Laborer";
        } else if (jsonCsvRowReordered["EEO Category"] && jsonCsvRowReordered["EEO Category"] === "9") {
            evoEmployee.eeoCode = "Service";
        } else {
            evoEmployee.eeoCode = null;
        }

        if (jsonCsvRowReordered["FLSA Classification"] && jsonCsvRowReordered["FLSA Classification"].toUpperCase() === "NA") {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = "NA";
        } else if (jsonCsvRowReordered["FLSA Classification"] && jsonCsvRowReordered["FLSA Classification"].toUpperCase() === "N") {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = "NonExempt";
        } else if (jsonCsvRowReordered["FLSA Classification"] && jsonCsvRowReordered["FLSA Classification"].toUpperCase() === "E") {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = "Exempt";
        } else {
            evoEmployee.federalTaxReporting.exemptions.flsaStatus = null;
        }

        if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"] === "2") {
            evoEmployee.person.ethnicity = "TwoOrMoreRaces";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "A") {
            evoEmployee.person.ethnicity = "Asian";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "B") {
            evoEmployee.person.ethnicity = "BlackOrAfricanAmerican";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "H") {
            evoEmployee.person.ethnicity = "HispanicOrLatino";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "I") {
            evoEmployee.person.ethnicity = "AmericanIndianOrAlaskaNative";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "NA") {
            evoEmployee.person.ethnicity = "NotApplicable";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "O") {
            evoEmployee.person.ethnicity = "Other";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "P") {
            evoEmployee.person.ethnicity = "NativeHawaiianOrOtherPacificIslander";
        } else if (jsonCsvRowReordered["Ethnicity"] && jsonCsvRowReordered["Ethnicity"].toUpperCase() === "W") {
            evoEmployee.person.ethnicity = "White";
        } else {
            evoEmployee.person.ethnicity = null;
        }

        if (jsonCsvRowReordered["Gender"] && jsonCsvRowReordered["Gender"] === "M") {
            evoEmployee.person.gender = "M";
        } else if (jsonCsvRowReordered["Gender"] && jsonCsvRowReordered["Gender"] === "F") {
            evoEmployee.person.gender = "F";
        } else if (jsonCsvRowReordered["Gender"] && jsonCsvRowReordered["Gender"] === "N/A") {
            evoEmployee.person.gender = "NA";
        } else if (jsonCsvRowReordered["Gender"] && jsonCsvRowReordered["Gender"] === "NB") {
            evoEmployee.person.gender = "NonBinary";
        } else {
            evoEmployee.person.gender = null;
        }

        if (jsonCsvRowReordered["Veteran"] && jsonCsvRowReordered["Veteran"].toUpperCase() === "YES") {
            evoEmployee.person.veteran = "Y";
        } else if (jsonCsvRowReordered["Veteran"] && jsonCsvRowReordered["Veteran"].toUpperCase() === "NO") {
            evoEmployee.person.veteran = "N";
        } else if (jsonCsvRowReordered["Veteran"] && jsonCsvRowReordered["Veteran"].toUpperCase() === "DECLINED TO DISCLOSE - N/A") {
            evoEmployee.person.veteran = "Unknown";
        } else {
            evoEmployee.person.veteran = null;
        }

        if (jsonCsvRowReordered["Military Reserve"] && jsonCsvRowReordered["Military Reserve"].toUpperCase() === "YES") {
            evoEmployee.person.militaryReserve = "Y";
        } else if (jsonCsvRowReordered["Military Reserve"] && jsonCsvRowReordered["Military Reserve"].toUpperCase() === "NO") {
            evoEmployee.person.militaryReserve = "N";
        } else if (jsonCsvRowReordered["Military Reserve"] && jsonCsvRowReordered["Military Reserve"].toUpperCase() === "DECLINED TO DISCLOSE - N/A") {
            evoEmployee.person.militaryReserve = "Unknown";
        } else {
            evoEmployee.person.militaryReserve = null;
        }

        const phoneList: Array<any> = [];
        phoneList.push({
            "number": jsonCsvRowReordered["Cell Phone"] || null,
            "extension": null,
            "description": "Primary"
        });
        phoneList.push({
            "number": jsonCsvRowReordered["Home Phone"] || null,
            "extension": null,
            "description": "Secondary"
        });
        phoneList.push({
            "number": jsonCsvRowReordered["Work Phone"] || null,
            "extension": null,
            "description": "Tertiary"
        });
        evoEmployee.person.phones = phoneList;

        console.info('===> Calling EVO API to update evoEmployee');
        console.info(evoEmployee);

        const updateEvoEmployeeStatusResult: any = await payrollService.updateEmployeeInEvo(tenantName, evoKeys, evoAccessToken, evoEmployee);

        console.info('===> updateEvoEmployeeStatusResult');
        console.info(updateEvoEmployeeStatusResult);

        return { isSuccess: true, message: 'Employee was updated successfully' };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
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
export async function setDataImportEventStatusGlobal(tenantId: string, dataImportEventId: string, status: string, active: number): Promise<any> {
    console.info('EmployeeImport.Service.setDataImportEventStatusGlobal');

    try {
        if (!tenantId || !dataImportEventId) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to tenantId and dataImportEventId not met.');
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

        setDataImportEventStatusGlobal(tenantId, dataImportEventId, finalStatusGlobal, 0);

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
                creationDate: creationDate.toLocaleString('en-us', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
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

/**
 * Returns a CSV file with the row from database from DataImportEventId
 * @param {string} tenantId: The unique identifier for  a tenant
 * @param {string} companyId: The unique identifier for a company
 * @param {string} dataImportId: The unique identifier for a import event
 * @param {string[]} queryParams: Used for status parameter 
 * @returns {Promise<any>}: Promise of any.
 */
export async function downloadImportData(tenantId: string, companyId: string, dataImportId: string, queryParams: any, domainName: string, path: string,): Promise<any> {
    console.info('EmployeeImport.Service.downloadImportData');
    
    try {
        const validQueryStringParameters = ['status'];

        let query = new ParameterizedQuery('getImportTypeAndImportedFilePathByImportEventID', Queries.getImportTypeAndImportedFilePathByImportEventID);
        query.setParameter('@ID', dataImportId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordsets[0].length === 0) {
            return undefined;
        }

        if (queryParams && queryParams['status']) {
            const dataImportTypeName = result.recordset[0].Name;

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
        
            const resultDetails: any = await utilService.invokeInternalService('queryExecutor', payloadDetails, utilService.InvocationType.RequestResponse);
        
            if (resultDetails.recordsets[0].length === 0) {
                return undefined;
            }
        
            let csvOut = '';
            
            if (dataImportTypeName === 'Update Employee Info') {
                csvOut = 'Employee Code,Birthdate,Time Clock Number,Email,Home Phone,Work Phone,Cell Phone,Gender,Ethnicity,Education Level,Tobacco User,Disabled,Military Reserve,Veteran,Memo 1,Memo 2,Memo 3,Pay Frequency,Standard Payroll Hours,FLSA Classification,Position,Reports To 1,Reports To 2,Reports To 3,Supervisor (SC),Benefit Class/Eligibility Group,EEO Category,Worker Comp Code,Change Reason,Comment,Error (correct the error indicated and remove this column before re-uploading your file)\r\n';
            }
            else if (dataImportTypeName === 'Update Compensation') {
                csvOut = "Employee Identifier,Effective Date,End Date,Pay Type,Rate,Jobs Number,Worker Comp Code,Change Reason,Comment,Error (correct the error indicated and remove this column before re-uploading your file)\r\n"
            }
            else if (dataImportTypeName === 'Update Alternate Rate') {
                csvOut = "Alternate Rate,Error (correct the error indicated and remove this column before re-uploading your file)\r\n"
            }
            else {
                return undefined;
            }
        
            resultDetails.recordsets[0].forEach((row) => {
                csvOut += `${row.CSVRowData},${row.CSVRowNotes}\r\n`;
            });

            return { data: csvOut, mimeType: 'text/csv' };
        }
        else {
            
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
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }  
}

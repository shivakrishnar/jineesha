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
 * Returns a list of ATQuestionBank by tenant.
 */
export async function getQuestionBanksByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('QuestionBank.Service.getQuestionBanksByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getQuestionBanksByTenant', Queries.getQuestionBanksByTenant);
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
        const results: atInterfaces.IQuestionBankGET[] = dbResults.recordsets[1];
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
 * Returns a list of ATQuestionBank by company.
 */
export async function getQuestionBanksByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('QuestionBank.Service.getQuestionBanksByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('getQuestionBanksByCompany', Queries.getQuestionBanksByCompany);
        query.setParameter('@companyId', companyId);
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
        const results: atInterfaces.IQuestionBankGET[] = dbResults.recordsets[1];
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
 * Returns a list of ATQuestionBank by id.
 */
export async function getQuestionBankById(
    tenantId: string,
    id: string
): Promise<atInterfaces.IQuestionBankGET> {
    console.info('QuestionBank.Service.getQuestionBankById');

    if (Number.isNaN(Number(id))) {
        const errorMessage = `${id} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('getQuestionBankById', Queries.getQuestionBankById);
        query.setParameter('@Id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IQuestionBankGET = dbResults.recordset[0];
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
 * Create ATQuestionBank.
 */
export async function createQuestionBank(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IQuestionBankPOST
): Promise<atInterfaces.IQuestionBankGET> {
    console.info('QuestionBank.Service.createQuestionBank');

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createQuestionBank', Queries.createQuestionBank);
        query.setParameter('@CompanyID', requestBody.companyId);
        query.setParameter('@ATQuestionTypeID', requestBody.atQuestionTypeId);
        query.setStringOrNullParameter('@QuestionTitle', requestBody.questionTitle);
        query.setStringOrNullParameter('@QuestionText', requestBody.questionText);
        query.setBooleanParameter('@Active', requestBody.active);
        query.setParameter('@Sequence', requestBody.sequence);
        query.setBooleanParameter('@IsRequired', requestBody.isRequired);

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
            const apiresult = await getQuestionBankById(tenantId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.questionTitle = utilService.sanitizeStringForSql(logResult.questionTitle);
            logResult.questionText = utilService.sanitizeStringForSql(logResult.questionText);
            delete logResult.companyName;

            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: requestBody.companyId.toString(),
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
 * Update ATQuestionBank.
 */
export async function updateQuestionBank(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IQuestionBankPUT
): Promise<Boolean> {
    console.info('QuestionBank.Service.updateQuestionBank');

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getQuestionBankById(tenantId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }

        if (oldValues.companyId != requestBody.companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateQuestionBank', Queries.updateQuestionBank);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@ATQuestionTypeID', requestBody.atQuestionTypeId);
        query.setStringOrNullParameter('@QuestionTitle', requestBody.questionTitle);
        query.setStringOrNullParameter('@QuestionText', requestBody.questionText);
        query.setBooleanParameter('@Active', requestBody.active);
        query.setParameter('@Sequence', requestBody.sequence);
        query.setBooleanParameter('@IsRequired', requestBody.isRequired);

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
        logResult.questionTitle = utilService.sanitizeStringForSql(logResult.questionTitle);
        logResult.questionText = utilService.sanitizeStringForSql(logResult.questionText);
        oldValues.questionTitle = utilService.sanitizeStringForSql(oldValues.questionTitle);
        oldValues.questionText = utilService.sanitizeStringForSql(oldValues.questionText);
        delete oldValues.companyName;

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            newFields: logResult,
            type: AuditActionType.Update,
            companyId: requestBody.companyId.toString(),
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

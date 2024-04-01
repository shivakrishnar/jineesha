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
import { getQuestionBankById } from './QuestionBank.Service';

/**
 * Returns a list of ATQuestionBankMultipleChoiceAnswers by id.
 */
export async function getQuestionBankMultipleChoiceAnswersById(
    tenantId: string,
    companyId: string,
    id: string
): Promise<atInterfaces.IQuestionBankMultipleChoiceAnswersGET> {
    console.info('QuestionBankMultipleChoiceAnswers.Service.getQuestionBankMultipleChoiceAnswersById');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    //
    // getting data
    //
    try {
        const query = new ParameterizedQuery('getQuestionBankMultipleChoiceAnswersById', Queries.getQuestionBankMultipleChoiceAnswersById);
        query.setParameter('@id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IQuestionBankMultipleChoiceAnswersGET = dbResults.recordset[0];

        if (result && result.companyId.toString() != companyId){
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

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
 * Returns a list of ATQuestionBankMultipleChoiceAnswers by tenant.
 */
export async function getQuestionBankMultipleChoiceAnswersByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('QuestionBankMultipleChoiceAnswers.Service.getQuestionBankMultipleChoiceAnswersByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getQuestionBankMultipleChoiceAnswersByTenant', Queries.getQuestionBankMultipleChoiceAnswersByTenant);
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
        const results: atInterfaces.IQuestionBankMultipleChoiceAnswersGET[] = dbResults.recordsets[1];
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
 * Returns a list of ATQuestionBankMultipleChoiceAnswers by company.
 */
export async function getQuestionBankMultipleChoiceAnswersByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('QuestionBankMultipleChoiceAnswers.Service.getQuestionBankMultipleChoiceAnswersByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('getQuestionBankMultipleChoiceAnswersByCompany', Queries.getQuestionBankMultipleChoiceAnswersByCompany);
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
        const results: atInterfaces.IQuestionBankMultipleChoiceAnswersGET[] = dbResults.recordsets[1];
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
 * Create ATQuestionBankMultipleChoiceAnswers.
 */
export async function createQuestionBankMultipleChoiceAnswers(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IQuestionBankMultipleChoiceAnswersPOST
): Promise<atInterfaces.IQuestionBankMultipleChoiceAnswersGET> {
    console.info('QuestionBankMultipleChoiceAnswers.Service.createQuestionBankMultipleChoiceAnswers');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    const questionBank = await getQuestionBankById(tenantId, companyId, requestBody.atQuestionBankId.toString());
    if (!questionBank || companyId != questionBank.companyId.toString()) {
        throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
    }

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createQuestionBankMultipleChoiceAnswers', Queries.createQuestionBankMultipleChoiceAnswers);
        query.setParameter('@ATQuestionBankID', requestBody.atQuestionBankId);
        query.setStringOrNullParameter('@Answer', requestBody.answer);

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
            const apiresult = await getQuestionBankMultipleChoiceAnswersById(tenantId, companyId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.answer = utilService.sanitizeStringForSql(logResult.answer);
            delete logResult.companyId;
            delete logResult.companyName;
            delete logResult.questionTitle;

            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: companyId,
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
 * Update ATQuestionBankMultipleChoiceAnswers.
 */
export async function updateQuestionBankMultipleChoiceAnswers(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IQuestionBankMultipleChoiceAnswersPUT
): Promise<Boolean> {
    console.info('QuestionBankMultipleChoiceAnswers.Service.updateQuestionBankMultipleChoiceAnswers');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    const questionBank = await getQuestionBankById(tenantId, companyId, requestBody.atQuestionBankId.toString());
    if (!questionBank || companyId != questionBank.companyId.toString()) {
        throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getQuestionBankMultipleChoiceAnswersById(tenantId, companyId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId != questionBank.companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateQuestionBankMultipleChoiceAnswers', Queries.updateQuestionBankMultipleChoiceAnswers);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@ATQuestionBankID', requestBody.atQuestionBankId);
        query.setStringOrNullParameter('@Answer', requestBody.answer);

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
        logResult.answer = utilService.sanitizeStringForSql(logResult.answer);
        oldValues.answer = utilService.sanitizeStringForSql(oldValues.answer);
        delete oldValues.companyId;
        delete oldValues.companyName;
        delete oldValues.questionTitle;

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            newFields: logResult,
            type: AuditActionType.Update,
            companyId: companyId,
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
 * Delete ATQuestionBankMultipleChoiceAnswers.
 */
export async function deleteQuestionBankMultipleChoiceAnswers(
    tenantId: string,
    companyId: string,
    userEmail: string,
    id: string
): Promise<boolean> {
    console.info('QuestionBankMultipleChoiceAnswers.Service.deleteQuestionBankMultipleChoiceAnswers');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getQuestionBankMultipleChoiceAnswersById(tenantId, companyId, id);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId.toString() != companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // deleting data
        //
        const query = new ParameterizedQuery('deleteQuestionBankMultipleChoiceAnswers', Queries.deleteQuestionBankMultipleChoiceAnswers);
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
        oldValues.answer = utilService.sanitizeStringForSql(oldValues.answer);
        delete oldValues.companyId;
        delete oldValues.companyName;
        delete oldValues.questionTitle;

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            type: AuditActionType.Delete,
            companyId: companyId,
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

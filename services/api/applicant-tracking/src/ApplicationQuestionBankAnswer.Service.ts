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
 * Returns a list of ATApplicationQuestionBankAnswer by id.
 */
export async function getApplicationQuestionBankAnswerById(
    tenantId: string,
    companyId: string,
    id: string
): Promise<atInterfaces.IApplicationQuestionBankAnswerGET> {
    console.info('ApplicationQuestionBankAnswer.Service.getApplicationQuestionBankAnswerById');

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
        const query = new ParameterizedQuery('getApplicationQuestionBankAnswerById', Queries.getApplicationQuestionBankAnswerById);
        query.setParameter('@id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IApplicationQuestionBankAnswerGET = dbResults.recordset[0];

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
 * Returns a list of ATApplicationQuestionBankAnswer by tenant.
 */
export async function getApplicationQuestionBankAnswerByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('ApplicationQuestionBankAnswer.Service.getApplicationQuestionBankAnswerByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getApplicationQuestionBankAnswerByTenant', Queries.getApplicationQuestionBankAnswerByTenant);
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
        const results: atInterfaces.IApplicationQuestionBankAnswerGET[] = dbResults.recordsets[1];
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
 * Returns a list of ATApplicationQuestionBankAnswer by company.
 */
export async function getApplicationQuestionBankAnswerByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('ApplicationQuestionBankAnswer.Service.getApplicationQuestionBankAnswerByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('getApplicationQuestionBankAnswerByCompany', Queries.getApplicationQuestionBankAnswerByCompany);
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
        const results: atInterfaces.IApplicationQuestionBankAnswerGET[] = dbResults.recordsets[1];
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
 * Create ATApplicationQuestionBankAnswer.
 */
export async function createApplicationQuestionBankAnswer(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationQuestionBankAnswerPOST
): Promise<atInterfaces.IApplicationQuestionBankAnswerGET> {
    console.info('ApplicationQuestionBankAnswer.Service.createApplicationQuestionBankAnswer');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (requestBody.answerDate && Number.isNaN(Date.parse(requestBody.answerDate.toString()))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${requestBody.answerDate} is not a valid date`);
    }

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createApplicationQuestionBankAnswer', Queries.createApplicationQuestionBankAnswer);
        query.setParameter('@OriginalATQuestionTypeID', requestBody.originalATQuestionTypeId);
        query.setIntegerOrNullParameter('@ATApplicationID', requestBody.atApplicationId);
        query.setStringParameter('@OriginalQuestionText', requestBody.originalQuestionText);
        query.setStringOrNullParameter('@AnswerDate', requestBody.answerDate?.toString());
        query.setBooleanParameter('@AnswerYesNo', requestBody.answerYesNo);
        query.setStringParameter('@AnswerFreeForm', requestBody.answerFreeForm);
        query.setStringParameter('@AnswerMultipleChoice', requestBody.answerMultipleChoice);

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
            const apiresult = await getApplicationQuestionBankAnswerById(tenantId, companyId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.originalQuestionText = utilService.sanitizeStringForSql(logResult.originalQuestionText);
            logResult.answerFreeForm = utilService.sanitizeStringForSql(logResult.answerFreeForm);
            logResult.answerMultipleChoice = utilService.sanitizeStringForSql(logResult.answerMultipleChoice);
            delete logResult.companyId;
            delete logResult.companyName;

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
 * Update ATApplicationQuestionBankAnswer.
 */
export async function updateApplicationQuestionBankAnswer(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationQuestionBankAnswerPUT
): Promise<Boolean> {
    console.info('ApplicationQuestionBankAnswer.Service.updateApplicationQuestionBankAnswer');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (requestBody.answerDate && Number.isNaN(Date.parse(requestBody.answerDate.toString()))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${requestBody.answerDate} is not a valid date`);
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getApplicationQuestionBankAnswerById(tenantId, companyId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId.toString() != companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateApplicationQuestionBankAnswer', Queries.updateApplicationQuestionBankAnswer);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@OriginalATQuestionTypeID', requestBody.originalATQuestionTypeId);
        query.setIntegerOrNullParameter('@ATApplicationID', requestBody.atApplicationId);
        query.setStringParameter('@OriginalQuestionText', requestBody.originalQuestionText);
        query.setStringOrNullParameter('@AnswerDate', requestBody.answerDate?.toString());
        query.setBooleanParameter('@AnswerYesNo', requestBody.answerYesNo);
        query.setStringParameter('@AnswerFreeForm', requestBody.answerFreeForm);
        query.setStringParameter('@AnswerMultipleChoice', requestBody.answerMultipleChoice);

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
        logResult.originalQuestionText = utilService.sanitizeStringForSql(logResult.originalQuestionText);
        logResult.answerFreeForm = utilService.sanitizeStringForSql(logResult.answerFreeForm);
        logResult.answerMultipleChoice = utilService.sanitizeStringForSql(logResult.answerMultipleChoice);
        oldValues.originalQuestionText = utilService.sanitizeStringForSql(oldValues.originalQuestionText);
        oldValues.answerFreeForm = utilService.sanitizeStringForSql(oldValues.answerFreeForm);
        oldValues.answerMultipleChoice = utilService.sanitizeStringForSql(oldValues.answerMultipleChoice);
        delete oldValues.companyId;
        delete oldValues.companyName;

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
 * Delete ATApplicationQuestionBankAnswer.
 */
export async function deleteApplicationQuestionBankAnswer(
    tenantId: string,
    companyId: string,
    userEmail: string,
    id: string
): Promise<boolean> {
    console.info('ApplicationQuestionBankAnswer.Service.deleteApplicationQuestionBankAnswer');

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
        const oldValues = await getApplicationQuestionBankAnswerById(tenantId, companyId, id);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId.toString() != companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // deleting data
        //
        const query = new ParameterizedQuery('deleteApplicationQuestionBankAnswer', Queries.deleteApplicationQuestionBankAnswer);
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
        oldValues.originalQuestionText = utilService.sanitizeStringForSql(oldValues.originalQuestionText);
        oldValues.answerFreeForm = utilService.sanitizeStringForSql(oldValues.answerFreeForm);
        oldValues.answerMultipleChoice = utilService.sanitizeStringForSql(oldValues.answerMultipleChoice);
        delete oldValues.companyId;
        delete oldValues.companyName;

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

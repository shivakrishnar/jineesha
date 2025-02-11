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
export async function getQuestionBankByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('QuestionBank.Service.getQuestionBankByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getQuestionBankByTenant', Queries.getQuestionBankByTenant);
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
export async function getQuestionBankByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('QuestionBank.Service.getQuestionBankByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    const companyIds = companyId.split("-");
    companyIds.forEach(id => {
        if (Number.isNaN(Number(id))) {
            const errorMessage = `${id} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });

    try {
        const query = new ParameterizedQuery('getQuestionBankByCompany', Queries.getQuestionBankByCompany);
        query.setStringParameter('@companyId', companyId);
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
    companyId: string,
    id: string
): Promise<atInterfaces.IQuestionBankGET> {
    console.info('QuestionBank.Service.getQuestionBankById');

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
        const query = new ParameterizedQuery('getQuestionBankById', Queries.getQuestionBankById);
        query.setParameter('@id', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IQuestionBankGET = dbResults.recordset[0];

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
 * Create ATQuestionBank.
 */
export async function createQuestionBank(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IQuestionBankPOST
): Promise<atInterfaces.IQuestionBankGET> {
    console.info('QuestionBank.Service.createQuestionBank');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (companyId != requestBody.companyId.toString()) {
        throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
    }

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createQuestionBank', Queries.createQuestionBank);
        query.setParameter('@CompanyID', requestBody.companyId);
        query.setIntegerOrNullParameter('@ATQuestionBankGroupID', requestBody.atQuestionBankGroupId);
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
            const apiresult = await getQuestionBankById(tenantId, companyId, id);

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
 * Update ATQuestionBank.
 */
export async function updateQuestionBank(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IQuestionBankPUT
): Promise<Boolean> {
    console.info('QuestionBank.Service.updateQuestionBank');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }
    if (companyId != requestBody.companyId.toString()) {
        throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getQuestionBankById(tenantId, companyId, requestBody.id.toString());     
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
        query.setIntegerOrNullParameter('@ATQuestionBankGroupID', requestBody.atQuestionBankGroupId);
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
 * Delete ATQuestionBank.
 */
export async function deleteQuestionBank(
    tenantId: string,
    companyId: string,
    userEmail: string,
    id: string
): Promise<boolean> {
    console.info('QuestionBank.Service.deleteQuestionBank');

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
        const oldValues = await getQuestionBankById(tenantId, companyId, id);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId.toString() != companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // deleting data
        //
        const query = new ParameterizedQuery('deleteQuestionBank', Queries.deleteQuestionBank);
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
        oldValues.questionTitle = utilService.sanitizeStringForSql(oldValues.questionTitle);
        oldValues.questionText = utilService.sanitizeStringForSql(oldValues.questionText);
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

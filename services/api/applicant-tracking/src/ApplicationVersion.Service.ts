import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { AuditActionType, AuditAreaOfChange, IAudit } from '../../../internal-api/audit/audit';

/**
 * Returns a list of ATApplicationVersion by tenant.
 */
export async function getApplicationVersionByTenant(
    tenantId: string,
    queryParams: any
): Promise<atInterfaces.IApplicationVersionGET[]> {
    console.info('ApplicationVersion.Service.getApplicationVersionByTenant');

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getApplicationVersionByTenant', Queries.getApplicationVersionByTenant);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.IApplicationVersionGET[] = dbResults.recordset;
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
 * Returns a list of ATApplicationVersion by company.
 */
export async function getApplicationVersionByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any
): Promise<atInterfaces.IApplicationVersionGET[]> {
    console.info('ApplicationVersion.Service.getApplicationVersionByCompany');

    //
    // validation
    //
    if (Number.isNaN(Number(companyId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${companyId} is not a valid number`);
    }

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getApplicationVersionByCompany', Queries.getApplicationVersionByCompany);
        query.setParameter('@CompanyID', companyId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.IApplicationVersionGET[] = dbResults.recordset;
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
 * Returns a list of ATApplicationVersion by id.
 */
export async function getApplicationVersionById(
    tenantId: string,
    companyId: string,
    id: string,
    queryParams: any
): Promise<atInterfaces.IApplicationVersionGET> {
    console.info('ApplicationVersion.Service.getApplicationVersionById');

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
        const query = new ParameterizedQuery('getApplicationVersionById', Queries.getApplicationVersionById);
        query.setParameter('@ID', id);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IApplicationVersionGET = dbResults.recordset[0];

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
 * Create ATApplicationVersion.
 */
export async function createApplicationVersion(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationVersionPOST
): Promise<atInterfaces.IApplicationVersionGET> {
    console.info('ApplicationVersion.Service.createApplicationVersion');

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
        const query = new ParameterizedQuery('createApplicationVersion', Queries.createApplicationVersion);
        query.setParameter('@CompanyID', requestBody.companyId);
        query.setStringOrNullParameter('@Title', requestBody.title);
        query.setStringOrNullParameter('@Description', requestBody.description);
        query.setStringOrNullParameter('@KeywordList', requestBody.keywordList);
        query.setStringOrNullParameter('@ATApplicationVersionDate', requestBody.aTApplicationVersionDate.toString());
        query.setBooleanParameter('@IsSectionOnEmploymentHistory', requestBody.isSectionOnEmploymentHistory);
        query.setBooleanParameter('@IsSectionOnEducationHistory', requestBody.isSectionOnEducationHistory);
        query.setBooleanParameter('@IsSectionOnWorkConditions', requestBody.isSectionOnWorkConditions);
        query.setBooleanParameter('@IsSectionOnKeywords', requestBody.isSectionOnKeywords);
        query.setBooleanParameter('@IsSectionOnDocuments', requestBody.isSectionOnDocuments);
        query.setBooleanParameter('@IsSectionOnCertification', requestBody.isSectionOnCertification);
        query.setBooleanParameter('@IsSectionOnPayHistory', requestBody.isSectionOnPayHistory);
        query.setParameter('@JazzHrPositionOpeningID', requestBody.jazzHrPositionOpeningID);

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
            const apiresult = await getApplicationVersionById(tenantId, companyId, id, undefined);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.title = utilService.sanitizeStringForSql(logResult.title);
            logResult.description = utilService.sanitizeStringForSql(logResult.description);
            logResult.keywordList = utilService.sanitizeStringForSql(logResult.keywordList);
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
 * Update ATApplicationVersion.
 */
export async function updateApplicationVersion(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationVersionPUT
): Promise<Boolean> {
    console.info('ApplicationVersion.Service.updateApplicationVersion');

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
        const oldValues = await getApplicationVersionById(tenantId, companyId, requestBody.id.toString(), undefined);     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId != requestBody.companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateApplicationVersion', Queries.updateApplicationVersion);
        query.setParameter('@ID', requestBody.id);
        query.setStringOrNullParameter('@Title', requestBody.title);
        query.setStringOrNullParameter('@Description', requestBody.description);
        query.setStringOrNullParameter('@KeywordList', requestBody.keywordList);
        query.setStringOrNullParameter('@ATApplicationVersionDate', requestBody.aTApplicationVersionDate.toString());
        query.setBooleanParameter('@IsSectionOnEmploymentHistory', requestBody.isSectionOnEmploymentHistory);
        query.setBooleanParameter('@IsSectionOnEducationHistory', requestBody.isSectionOnEducationHistory);
        query.setBooleanParameter('@IsSectionOnWorkConditions', requestBody.isSectionOnWorkConditions);
        query.setBooleanParameter('@IsSectionOnKeywords', requestBody.isSectionOnKeywords);    
        query.setBooleanParameter('@IsSectionOnDocuments', requestBody.isSectionOnDocuments);
        query.setBooleanParameter('@IsSectionOnCertification', requestBody.isSectionOnCertification);
        query.setBooleanParameter('@IsSectionOnPayHistory', requestBody.isSectionOnPayHistory);
        query.setParameter('@JazzHrPositionOpeningID', requestBody.jazzHrPositionOpeningID);

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
        logResult.title = utilService.sanitizeStringForSql(logResult.title);
        logResult.description = utilService.sanitizeStringForSql(logResult.description);
        oldValues.keywordList = utilService.sanitizeStringForSql(oldValues.keywordList);
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

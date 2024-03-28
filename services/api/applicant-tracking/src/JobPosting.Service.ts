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
 * Returns a list of ATJobPosting by tenant.
 */
export async function getJobPostingByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('JobPosting.Service.getJobPostingByTenant');

    const validQueryStringParameters = ['pageToken'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getJobPostingByTenant', Queries.getJobPostingByTenant);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        console.log('===> payload');
        console.log(payload);

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        console.log('===> dbResults');
        console.log(dbResults);

        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.IJobPostingGET[] = dbResults.recordsets[1];
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
 * Returns a list of ATJobPosting by company.
 */
export async function getJobPostingByCompany(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('JobPosting.Service.getJobPostingByCompany');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('getJobPostingByCompany', Queries.getJobPostingByCompany);
        query.setParameter('@CompanyID', companyId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.IJobPostingGET[] = dbResults.recordsets[1];
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
 * Returns a list of ATJobPosting by id.
 */
export async function getJobPostingById(
    tenantId: string,
    companyId: string,
    id: string
): Promise<atInterfaces.IJobPostingGET> {
    console.info('JobPosting.Service.getJobPostingById');

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
        const query = new ParameterizedQuery('getJobPostingById', Queries.getJobPostingById);
        query.setParameter('@ID', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IJobPostingGET = dbResults.recordset[0];

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
 * Create ATJobPosting.
 */
export async function createJobPosting(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IJobPostingPOST
): Promise<atInterfaces.IJobPostingGET> {
    console.info('JobPosting.Service.createJobPosting');

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
        const query = new ParameterizedQuery('createJobPosting', Queries.createJobPosting);
        query.setParameter('@CompanyID', requestBody.companyId);
        query.setParameter('@ATApplicationVersionID', requestBody.aTApplicationVersionId);
        query.setParameter('@PositionTypeID', requestBody.positionTypeId);
        query.setParameter('@OrganizationType1ID', requestBody.organizationType1Id);
        query.setParameter('@OrganizationType2ID', requestBody.organizationType2Id);
        query.setParameter('@OrganizationType3ID', requestBody.organizationType3Id);
        query.setParameter('@OrganizationType4ID', requestBody.organizationType4Id);
        query.setParameter('@WorkerCompTypeID', requestBody.workerCompTypeId);
        query.setStringParameter('@Title', requestBody.title);
        query.setStringParameter('@Description', requestBody.description);
        query.setStringParameter('@LinkKey', requestBody.linkKey);
        query.setBooleanParameter('@IsOpen', requestBody.isOpen);
        query.setParameter('@JazzHrPositionOpeningID', requestBody.jazzHrPositionOpeningId);
        
        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        console.log(payload);

        const queryResult: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const id: any = queryResult.recordset[0].ID;
        if (id) {
            //
            // getting data
            //
            const apiresult = await getJobPostingById(tenantId, companyId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.title = utilService.sanitizeStringForSql(logResult.title);
            logResult.description = utilService.sanitizeStringForSql(logResult.description);
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
 * Update ATJobPosting.
 */
export async function updateJobPosting(
    tenantId: string,
    companyId: string,
    userEmail: string,
    requestBody: atInterfaces.IJobPostingPUT
): Promise<Boolean> {
    console.info('JobPosting.Service.updateJobPosting');

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
        const oldValues = await getJobPostingById(tenantId, companyId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        if (oldValues.companyId != requestBody.companyId) {
            throw errorService.getErrorResponse(30).setMoreInfo('this record does not belong to this company');
        }

        //
        // updating data
        //
        const query = new ParameterizedQuery('updateJobPosting', Queries.updateJobPosting);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@CompanyID', requestBody.companyId);
        query.setParameter('@ATApplicationVersionID', requestBody.aTApplicationVersionId);
        query.setParameter('@PositionTypeID', requestBody.positionTypeId);
        query.setParameter('@OrganizationType1ID', requestBody.organizationType1Id);
        query.setParameter('@OrganizationType2ID', requestBody.organizationType2Id);
        query.setParameter('@OrganizationType3ID', requestBody.organizationType3Id);
        query.setParameter('@OrganizationType4ID', requestBody.organizationType4Id);
        query.setParameter('@OrganizationType5ID', requestBody.organizationType5Id);
        query.setParameter('@WorkerCompTypeID', requestBody.workerCompTypeId);
        query.setStringParameter('@Title', requestBody.title);
        query.setStringParameter('@Description', requestBody.description);
        query.setStringParameter('@LinkKey', requestBody.linkKey);
        query.setBooleanParameter('@IsOpen', requestBody.isOpen);
        query.setParameter('@JazzHrPositionOpeningID', requestBody.jazzHrPositionOpeningId);

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
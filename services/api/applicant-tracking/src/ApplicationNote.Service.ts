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
 * Returns a list of ATApplicationNote by applicationId.
 */
export async function getApplicationNoteByApplicationId(
    tenantId: string,
    applicationId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('ApplicationNote.Service.getApplicationNoteByApplicationId');

    const validQueryStringParameters = ['pageToken', 'searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    if (Number.isNaN(Number(applicationId))) {
        const errorMessage = `${applicationId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('getApplicationNoteByApplicationId', Queries.getApplicationNoteByApplicationId);
        query.setParameter('@ATApplicationID', applicationId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: atInterfaces.IApplicationNoteGET[] = dbResults.recordsets[1];
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
 * Returns an ATApplicationNote by id.
 */
export async function getApplicationNoteById(
    tenantId: string,
    id: string
): Promise<atInterfaces.IApplicationNoteGET> {
    console.info('ApplicationNote.Service.getApplicationNoteById');

    //
    // validation
    //
    if (Number.isNaN(Number(id))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid number`);
    }

    //
    // getting data
    //
    try {
        const query = new ParameterizedQuery('getApplicationNoteById', Queries.getApplicationNoteById);
        query.setParameter('@ID', id);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const result: atInterfaces.IApplicationNoteGET = dbResults.recordset[0];

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
 * Create ATApplicationNote.
 */
export async function createApplicationNote(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationNotePOST
): Promise<atInterfaces.IApplicationNoteGET> {
    console.info('ApplicationNote.Service.createApplicationNote');

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createApplicationNote', Queries.createApplicationNote);
        query.setParameter('@ATApplicationID', requestBody.atApplicationId);
        query.setDateOrNullParameter('@NoteEntryDate', requestBody.noteEntryDate);
        query.setStringOrNullParameter('@NoteEnteredByUserName', requestBody.noteEnteredByUsername);
        query.setStringOrNullParameter('@Note', requestBody.note);
        
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
            const apiresult = await getApplicationNoteById(tenantId, id);

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            logResult.noteEnteredByUsername = utilService.sanitizeStringForSql(logResult.noteEnteredByUsername);
            logResult.note = utilService.sanitizeStringForSql(logResult.note);

            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: '',
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
 * Update ATApplicationNote.
 */
export async function updateApplicationNote(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationNotePUT
): Promise<Boolean> {
    console.info('ApplicationNote.Service.updateJobPosting');

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getApplicationNoteById(tenantId, requestBody.id.toString());     
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }
        
        //
        // updating data
        //
        const query = new ParameterizedQuery('updateApplicationNote', Queries.updateApplicationNote);
        query.setParameter('@ID', requestBody.id);
        query.setParameter('@ATApplicationID', requestBody.atApplicationId);
        query.setDateOrNullParameter('@NoteEntryDate', requestBody.noteEntryDate);
        query.setStringOrNullParameter('@NoteEnteredByUsername', requestBody.noteEnteredByUsername);
        query.setStringOrNullParameter('@Note', requestBody.note);

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
        logResult.noteEnteredByUsername = utilService.sanitizeStringForSql(logResult.noteEnteredByUsername);
        logResult.note = utilService.sanitizeStringForSql(logResult.note);

        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            newFields: logResult,
            type: AuditActionType.Update,
            companyId: '',
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
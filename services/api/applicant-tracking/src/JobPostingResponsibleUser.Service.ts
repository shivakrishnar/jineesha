import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { AuditActionType, AuditAreaOfChange, IAudit } from '../../../internal-api/audit/audit';

/**
 * Get ATJobPostingResponsibleUser.
 */
export async function getJobPostingResponsibleUserByJobPostingAndUser(
    tenantId: string,
    atJobPostingId: string,
    hrNextUserId: string): 
Promise<atInterfaces.IJobPostingResponsibleUser> {
    console.info('jobPostingResponsibleUser.Service.getJobPostingResponsibleUserByJobPostingAndUser');

    //
    // validation
    //
    if (Number.isNaN(Number(atJobPostingId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${atJobPostingId} is not a valid number`);
    }
    if (Number.isNaN(Number(hrNextUserId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${hrNextUserId} is not a valid number`);
    }
    
    try {
        const query = new ParameterizedQuery('getJobPostingResponsibleUserByJobPostingAndUser', Queries.getJobPostingResponsibleUserByJobPostingAndUser);
        query.setParameter('@ATJobPostingID', atJobPostingId);
        query.setParameter('@HRnextUserID', hrNextUserId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );
        const result: atInterfaces.IJobPostingResponsibleUser = dbResults.recordset[0];

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
 * Create ATJobPostingResponsibleUser.
 */
export async function createJobPostingResponsibleUser(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IJobPostingResponsibleUser,
): Promise<atInterfaces.IJobPostingResponsibleUser> {
    console.info('jobPostingResponsibleUser.Service.createJobPostingResponsibleUser');

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createJobPostingResponsibleUser', Queries.createJobPostingResponsibleUser);
        query.setParameter('@ATJobPostingID', requestBody.atJobPostingId);
        query.setParameter('@HRnextUserID', requestBody.hrNextUserId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const queryResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );

        if (queryResult.rowsAffected && 
            queryResult.rowsAffected.length > 0 && 
            queryResult.rowsAffected[0] > 0) {
            //
            // getting data
            //
            const apiresult = await getJobPostingResponsibleUserByJobPostingAndUser(
                tenantId, requestBody.atJobPostingId.toString(), requestBody.hrNextUserId.toString());

            //
            // auditing log
            //
            const logResult = { ...apiresult };
            
            utilService.logToAuditTrail({
                userEmail,
                newFields: logResult,
                type: AuditActionType.Insert,
                companyId: null,
                areaOfChange: AuditAreaOfChange.ApplicantTracking,
                tenantId,
            } as IAudit);

            return apiresult;
        }
        else {
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
 * Delete ATJobPostingResponsibleUser.
 */
export async function deleteJobPostingResponsibleUser(
    tenantId: string,
    atJobPostingId: string,
    hrNextUserId: string,
    userEmail: string
): Promise<boolean> {
    console.info('jobPostingResponsibleUser.Service.deleteJobPostingResponsibleUser');

    //
    // validation
    //
    if (Number.isNaN(Number(atJobPostingId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${atJobPostingId} is not a valid number`);
    }
    if (Number.isNaN(Number(hrNextUserId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${hrNextUserId} is not a valid number`);
    }

    try {
        //
        // getting the old values for audit log
        //
        const oldValues = await getJobPostingResponsibleUserByJobPostingAndUser(tenantId, atJobPostingId, hrNextUserId);
        if (!oldValues) {
            throw errorService.getErrorResponse(50);
        }

        //
        // deleting data
        //
        const query = new ParameterizedQuery('deleteJobPostingResponsibleUser', Queries.deleteJobPostingResponsibleUser);
        query.setParameter('@ATJobPostingID', atJobPostingId);
        query.setParameter('@HRnextUserID', hrNextUserId);

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
        utilService.logToAuditTrail({
            userEmail,
            oldFields: oldValues,
            type: AuditActionType.Delete,
            companyId: null,
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

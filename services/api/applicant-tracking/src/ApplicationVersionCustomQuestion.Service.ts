import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { AuditActionType, AuditAreaOfChange, IAudit } from '../../../internal-api/audit/audit';

/**
 * Get ATApplicationVersionCustomQuestion.
 */
export async function getAppVersionCustomQuestionByAppVersionQuestionBank(
    tenantId: string,
    aTApplicationVersionId: string,
    aTQuestionBankId: string): 
Promise<atInterfaces.IApplicationVersionCustomQuestion> {
    console.info('ApplicationVersion.Service.getAppVersionCustomQuestionByAppVersionQuestionBank');

    //
    // validation
    //
    if (Number.isNaN(Number(aTApplicationVersionId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${aTApplicationVersionId} is not a valid number`);
    }
    if (Number.isNaN(Number(aTQuestionBankId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${aTQuestionBankId} is not a valid number`);
    }
    
    try {
        const query = new ParameterizedQuery('getAppVersionCustomQuestionByAppVersionQuestionBank', Queries.getAppVersionCustomQuestionByAppVersionQuestionBank);
        query.setParameter('@ATApplicationVersionID', aTApplicationVersionId);
        query.setParameter('@ATQuestionBankID', aTQuestionBankId);

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
        const result: atInterfaces.IApplicationVersionCustomQuestion = dbResults.recordset[0];

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
 * Create ATApplicationVersionCustomQuestion.
 */
export async function createApplicationVersionCustomQuestion(
    tenantId: string,
    userEmail: string,
    requestBody: atInterfaces.IApplicationVersionCustomQuestion,
): Promise<atInterfaces.IApplicationVersionCustomQuestion> {
    console.info('ApplicationVersion.Service.createApplicationVersionCustomQuestion');

    try {
        //
        // inserting data
        //
        const query = new ParameterizedQuery('createApplicationVersionCustomQuestion', Queries.createApplicationVersionCustomQuestion);
        query.setParameter('@ATApplicationVersionID', requestBody.aTApplicationVersionId);
        query.setParameter('@ATQuestionBankID', requestBody.aTQuestionBankId);

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
            const apiresult = await getAppVersionCustomQuestionByAppVersionQuestionBank(
                tenantId, requestBody.aTApplicationVersionId.toString(), requestBody.aTQuestionBankId.toString());

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

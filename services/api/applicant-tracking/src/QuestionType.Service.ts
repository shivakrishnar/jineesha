import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import { IQuestionType } from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';

/**
 * Returns a list of ATQuestionType by tenant.
 */
export async function getQuestionTypesByTenant(
    tenantId: string, 
    queryParams: any
): Promise<IQuestionType[]> {
    console.info('ATQuestionType.Service.getQuestionTypesByTenant');

    try {
        const query = new ParameterizedQuery('getQuestionTypesByTenant', Queries.getQuestionTypesByTenant);
        const searchBy: string = queryParams && queryParams.searchBy ? queryParams.searchBy : '';
        query.setStringParameter('@searchBy', searchBy);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);      
        const results: IQuestionType[] = dbResults.recordset;        
        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}
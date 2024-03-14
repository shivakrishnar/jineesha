import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
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
): Promise<atInterfaces.IQuestionType[]> {
    console.info('QuestionType.Service.getQuestionTypesByTenant');

    const validQueryStringParameters = ['searchBy'];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

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
        const results: atInterfaces.IQuestionType[] = dbResults.recordset;
        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

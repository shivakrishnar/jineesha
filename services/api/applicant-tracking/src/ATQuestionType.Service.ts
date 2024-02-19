import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import { IATQuestionType } from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';

/**
 * Returns a listing of ATQuestionType for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @returns {Promise<IATQuestionType[]>}: Promise of an array of ATQuestionType
 */
export async function getATQuestionTypes(tenantId: string): Promise<IATQuestionType[]> {
    console.info('ATQuestionType.Service.getATQuestionTypes');

    try {
        const query = new ParameterizedQuery('getATQuestionTypes', Queries.getATQuestionTypes);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset || !result.recordset.length) {
            return [];
        }

        const results: IATQuestionType[] = result.recordset.map((record) => {
            return {
                id: record.ID,
                code: record.Code,
                description: record.Description,
                priority: record.Priority,
                active: record.Active,
            };
        });

        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}
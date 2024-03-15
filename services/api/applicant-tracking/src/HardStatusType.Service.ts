import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as atInterfaces from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';

/**
 * Returns a list of ATHardStatusType by tenant.
 */
export async function getHardStatusTypesByTenant(
    tenantId: string,
    queryParams: any
): Promise<atInterfaces.IHardStatusType[]> {
    console.info('HardStatusType.Service.getHardStatusTypesByTenant');

    const validQueryStringParameters = [];
    utilService.validateQueryParams(queryParams, validQueryStringParameters);

    try {
        const query = new ParameterizedQuery('getHardStatusTypeByTenant', Queries.getHardStatusTypeByTenant);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const results: atInterfaces.IHardStatusType[] = dbResults.recordset;
        return results;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

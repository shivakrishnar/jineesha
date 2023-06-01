import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';

import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { IDataImportType } from './DataImport';

/**
 * Returns a listing of data importing type for a specific tenant
 * @param {string} tenantId: The unique identifier for the tenant the data importing type belongs to.
 * @returns {Promise<DataImportTypes>}: Promise of an array of DataImportType
 */
export async function listDataImportTypes(tenantId: string): Promise<IDataImportType[]> {
    console.info('tenantsService.listDataImportTypes');
    
    try {
        const query = new ParameterizedQuery('listDataImportTypes', Queries.listDataImportTypes);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        console.info('query', query);
    
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        // This endpoint should return an empty list (not 404) if tenant not found in AHR.
        // This makes it easier for the caller to handle.
        if (!result || !result.recordset.length) {
            return [];
        }

        return result.recordset;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            if (error.statusCode === 404) {
                return [];
            }
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

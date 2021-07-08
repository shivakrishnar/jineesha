import * as errorService from '../../../../errors/error.service';
import * as utilService from '../../../../util.service';
import * as paginationService from '../../../../pagination/pagination.service';
import { ErrorMessage } from '../../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../../internal-api/database/events';
import { PaginatedResult } from '../../../../pagination/paginatedResult';
import { Queries } from '../../../../queries/queries';
import { Query } from '../../../../queries/query';
import { SecResourceSubGroup } from '../models/SecResourceSubGroup';

/**
 * Returns all SecResourceSubGroups.
 * @param {string} tenantId: The unique identifier for the tenant the resource belongs to.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {any}: A Promise of all SecResourceSubGroups data.
 */
export async function listSecResourceSubGroups(tenantId: string, domainName: string, path: string, queryParams: any): Promise<PaginatedResult> {
    console.info('sec-resource.service.listSecResourceSubGroups');

    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new Query('listSecResourceSubGroups', Queries.listSecResourceSubGroups);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        
        const totalCount = result.recordsets[0][0].totalCount;

        const resourceSubGroups: SecResourceSubGroup[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                resourceGroupId: record.ResourceGroupID,
                name: record.Name,
                description: record.Description,
                mainTableName: record.MainTableName,
            } as SecResourceSubGroup;
        });

        return await paginationService.createPaginatedResult(resourceSubGroups, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}
import * as errorService from '../../../../errors/error.service';
import { ErrorMessage } from '../../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../../internal-api/database/events';
import { PaginatedResult } from '../../../../pagination/paginatedResult';
import { ParameterizedQuery } from '../../../../queries/parameterizedQuery';
import { Queries } from '../../../../queries/queries';
import * as utilService from '../../../../util.service';
import * as paginationService from '../../../../pagination/pagination.service';
import { SecResource } from '../models/SecResource';

/**
 * Returns SecResources related to the ResourceSubGroupID.
 * @param {string} tenantId: The unique identifier for the tenant the resource belongs to.
 * @param {string} subGroupId: The ID for the subGroup the resource belongs to.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {any}: A Promise of all SecResources data.
 */
 export async function listSecResourcesBySubGroupId( tenantId: string, subGroupId: string, domainName: string, path: string, queryParams: any): Promise<PaginatedResult> {
    console.info('sec-resource.service.listSecResourcesBySubGroupId');

    // subGroupId must be integral
    if (Number.isNaN(Number(subGroupId))) {
        throw errorService.getErrorResponse(30).setDeveloperMessage(`${subGroupId} is not a valid subGroupId.`);
    }

    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const checkSubGroupIdQuery = new ParameterizedQuery('getSecResourceSubGroupById', Queries.getSecResourceSubGroupById);
        checkSubGroupIdQuery.setParameter('@subGroupId', subGroupId);
        
        const checkSubGroupIdPayload = {
            tenantId,
            queryName: checkSubGroupIdQuery.name,
            query: checkSubGroupIdQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
    
        const checkSubGroupIdResult: any = await utilService.invokeInternalService('queryExecutor', checkSubGroupIdPayload, utilService.InvocationType.RequestResponse);

        if (checkSubGroupIdResult.recordset.length === 0) throw errorService.getErrorResponse(50).setDeveloperMessage(`ResourceSubGroup with subGroupId ${subGroupId} not found.`);
        
        const query = new ParameterizedQuery('listSecResourcesBySubGroupId', Queries.listSecResourcesBySubGroupId);
        query.setParameter('@subGroupId', subGroupId);
        
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        
        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;

        const resources: SecResource[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                resourceGroupId: record.ResourceGroupID,
                resourceSubGroupId: record.ResourceSubGroupID,
                name: record.Name,
                description: record.Description,
                cddId: record.CddID,
                tableColumn: record.TableColumn,
                requiredRoleLevel: record.RequiredRoleLevel,
                isLocked: record.IsLocked,
                resourceTypeId: record.ResourceTypeID,
                parentId: record.ParentID,
                position: record.Position,
                link: record.Link,
                requiredPermission: record.RequiredPermission,
                menuClass: record.MenuClass,
                isOwnWindow: record.IsOwnWindow,
                isVisible: record.IsVisible,
                isRequired: record.IsRequired,
            } as SecResource;
        });

        return await paginationService.createPaginatedResult(resources, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

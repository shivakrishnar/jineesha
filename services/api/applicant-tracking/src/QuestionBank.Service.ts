import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as paginationService from '../../../pagination/pagination.service';
import { IQuestionBankGET } from './ApplicantTracking.Interfaces';
import { ErrorMessage } from '../../../errors/errorMessage';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';


/**
 * Returns a list of ATQuestionBank by tenant.
 */
export async function getQuestionBanksByTenant(
    tenantId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('ATQuestionBank.Service.getQuestionBanksByTenant');

    const validQueryStringParameters = ['pageToken', 'searchBy'];

    if (queryParams) {
        // Check for unsupported query params
        if (!Object.keys(queryParams).every((param) => validQueryStringParameters.includes(param))) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(',')}. See documentation for usage.`);
            throw error;
        }
    }

    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('getQuestionBanksByTenant', Queries.getQuestionBanksByTenant);
        const searchBy: string = queryParams && queryParams.searchBy ? queryParams.searchBy : '';
        query.setStringParameter('@searchBy', searchBy);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        const payload = { 
            tenantId, 
            queryName: paginatedQuery.name, 
            query: paginatedQuery.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const totalCount = dbResults.recordsets[0][0].totalCount;
        const results: IQuestionBankGET[] = dbResults.recordsets[1];
        return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

// /**
//  * Returns a list of ATQuestionBank by company.
//  */
// export async function getQuestionBanksByCompany(
//     tenantId: string,
//     companyId: string,
//     queryParams: any,
//     domainName: string,
//     path: string,
// ): Promise<PaginatedResult> {
//     console.info('ATQuestionBank.Service.getQuestionBanksByCompany');

//     const validQueryStringParameters = ['pageToken', 'searchBy'];
//     const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

//     if (Number.isNaN(Number(companyId))) {
//         const errorMessage = `${companyId} is not a valid number`;
//         throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
//     }

//     try {
//         const query = new ParameterizedQuery('getQuestionBanksByCompany', Queries.getQuestionBanksByCompany);
//         query.setParameter('@companyId', companyId);
//         const searchBy: string = queryParams && queryParams.searchBy ? queryParams.searchBy : '';
//         query.setStringParameter('@searchBy', searchBy);

//         const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
//         const payload = { 
//             tenantId, 
//             queryName: paginatedQuery.name, 
//             query: paginatedQuery.value, 
//             queryType: QueryType.Simple 
//         } as DatabaseEvent;

//         const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
//         const totalCount = dbResults.recordsets[0][0].totalCount;
//         const results: IATQuestionBankGET[] = dbResults.recordsets[1];
//         return await paginationService.createPaginatedResult(results, baseUrl, totalCount, page);
//     } catch (error) {
//         if (error instanceof ErrorMessage) {
//             throw error;
//         }
//         console.error(JSON.stringify(error));
//         throw errorService.getErrorResponse(0);
//     }
// }

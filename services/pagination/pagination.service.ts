import * as configService from '../config.service';
import { Query } from '../queries/query';
import { PaginatedResult, PaginationData } from './paginatedResult';

/**
 * Creates a paginated result object.
 * @param {any} results: The collection of objects to be returned.
 * @param {string} baseUrl: The base URL that is used to construct pagination links.
 * @param {number} totalResults: The total number of records returned before pagination.
 * @param {number} currentPage: The page number the user requested.
 * @returns {Promise<PaginatedResult>}: Promise of a PaginatedResult
 */
export async function createPaginatedResult(
    results: any,
    baseUrl: string,
    totalResults: number,
    currentPage: number,
    pageSize?: string,
): Promise<PaginatedResult> {
    console.info('paginationService.createPaginatedResult');

    let limit = configService.getPageLimitDefault();
    if (pageSize) limit = pageSize === 'all' ? totalResults : parseInt(pageSize);
    const totalNumberOfPages = results.length <= limit ? Math.ceil(totalResults / limit) : 1;
    let nextPageToken = { pageNumber: currentPage + 1 };
    let previousPageToken = { pageNumber: currentPage - 1 };
    let firstPageToken = { pageNumber: 1 };
    let lastPageToken = { pageNumber: totalNumberOfPages };

    if (currentPage === 1) {
        previousPageToken = undefined;
        firstPageToken = undefined;
    }
    if (currentPage === totalNumberOfPages) {
        nextPageToken = undefined;
        lastPageToken = undefined;
    }

    return new PaginatedResult(limit, results, baseUrl, totalResults, previousPageToken, nextPageToken, firstPageToken, lastPageToken);
}

async function decodeKey(pageToken: any): Promise<string> {
    return new Buffer(pageToken, 'base64').toString('ascii');
}

/**
 * Retrieves and returns pagination data.
 * @param {string[]} validQueryStringParameters: A collection of valid query parameters
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters specified by the user.
 * @returns {Promise<PaginationData>}: Promise of PaginationData
 */
export async function retrievePaginationData(
    validQueryStringParameters: string[],
    domainName: string,
    path: string,
    queryParams?: any,
): Promise<PaginationData> {
    console.info('paginationService.retrievePaginationData');

    // Set pagination defaults
    let page = 1;
    let baseUrl = `https://${domainName}${path}`;

    if (queryParams) {
        if (queryParams.pageToken) {
            page = Number(await decodeKey(queryParams.pageToken));
        }

        // Set existing queryParams if supplied
        const existingQueryParams = Object.keys(queryParams)
            .filter((param) => validQueryStringParameters.includes(param) && param !== 'pageToken')
            .map((param) => `${param}=${queryParams[param]}`);
        baseUrl = existingQueryParams.length > 0 ? `${baseUrl}?${existingQueryParams.join('&')}` : baseUrl;
    }

    return { page, baseUrl } as PaginationData;
}

/**
 * Appends SQL filters used for pagination
 * @param {Query} query: The query to be appended with pagination filters.
 * @param {number} page: The page number specified by the user.
 * @param {boolean} useMaxLimit: Determines whether or not to use the maximum limit.
 * @param {number} pageSize: The number of rows returned per page
 * @returns {Promise<Query>}: Promise of a paginated query
 */
export async function appendPaginationFilter(query: Query, page = 1, useMaxLimit = false, pageSize?: Number): Promise<Query> {
    console.info('paginationService.appendPaginationFilter');
    let limit;
    if (pageSize) {
        limit = pageSize
     } else {
        limit = useMaxLimit ? configService.getPageLimitMax() : configService.getPageLimitDefault();
     }
    const offset = (page - 1) * limit;
    query.appendFilter(
        `
        offset ${offset} rows
        fetch next ${limit} rows only
    `,
        false,
    );
    return query;
}

import { Queries } from '../../../queries/queries';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Query } from '../../../queries/query';
import { Company } from './company';

import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import * as paginationService from '../../../pagination/pagination.service';
import * as utilService from '../../../util.service';

/**
 * Returns a listing of companies for a specific user within a tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address of the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<Companies>}: Promise of an array of companies
 */
export async function list(tenantId: string, email: string, domainName: string, path: string, queryParams: any): Promise<PaginatedResult> {
    console.info('companyService.list');

    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        // Get user info
        const userQuery = new ParameterizedQuery('GetUserById', Queries.getUserById);
        userQuery.setParameter('@username', email);
        const payload = {
            tenantId,
            queryName: userQuery.name,
            query: userQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const userResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );

        if (userResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Could not find user with email ${email}`);
        }

        const isGaOrSuperAdmin = userResult.recordset[0].IsGA === true || userResult.recordset[0].IsSuperAdmin === true;
        const userId = userResult.recordset[0].ID;

        const query = new Query('ListCompanies', Queries.listCompanies);

        if (!isGaOrSuperAdmin) {
            const userCompaniesQuery = new ParameterizedQuery('GetUserCompaniesById', Queries.getUserCompaniesById);
            userCompaniesQuery.setParameter('@userId', userId);
            payload.queryName = userCompaniesQuery.name;
            payload.query = userCompaniesQuery.value;
            const userCompaniesResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                payload,
                utilService.InvocationType.RequestResponse,
            );

            if (userCompaniesResult.recordset.length === 0) {
                return undefined;
            }

            const companyIds = userCompaniesResult.recordset.map(({ CompanyID }) => CompanyID).join(',');
            query.appendFilter(`where ID in (${companyIds})`, false);
        }

        query.appendFilter(' order by ID', false);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        payload.queryName = paginatedQuery.name;
        payload.query = paginatedQuery.value;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;
        const recordSet = result.recordsets[1];

        if (recordSet.length === 0) {
            return undefined;
        }

        const companies: Company[] = recordSet.map(({ ID: id, CompanyName: name }) => {
            return { id, name } as Company;
        });

        return await paginationService.createPaginatedResult(companies, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Retrieves a company logo document.
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} companyId: The unique (numeric) identifier for the company
 * @returns {Promise<any>}: A Promise of a document, or undefined if company not found or has no logo
 */
export async function getLogoDocument(tenantId: string, companyId: string): Promise<any> {
    console.info('companyService.getLogoDocument');

    try {
        // if companyId not an integer, it doesn't exist, so don't waste time executing a query
        if (!companyId || !String(companyId).match(/^\d+$/)) {
            return undefined;
        }

        const query = new ParameterizedQuery('GetCompanyLogo', Queries.getCompanyLogo);
        query.setParameter('@companyId', companyId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length) {
            return undefined;
        }

        const base64String = result.recordset[0].FSDocument;
        const extension = result.recordset[0].Extension;

        if (!base64String) {
            return undefined;
        }

        return { base64String, extension };

    } catch (error) {
        if (error instanceof ErrorMessage) {
            if (error.statusCode === 404) {
                return undefined;
            }
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

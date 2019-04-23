import { Queries } from '../../../queries/queries';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Query } from '../../../queries/query';
import { Companies, Company } from './company';

import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';

/**
 * Returns a listing of companies for a specific user within a tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address of the user.
 * @returns {Promise<Companies>}: Promise of an array of companies
 */
export async function list(tenantId: string, email: string): Promise<Companies> {
    console.info('companyService.list');

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

        let companies: Company[];
        if (isGaOrSuperAdmin) {
            const companyQuery = new Query('ListCompanies', Queries.listCompanies);
            payload.queryName = companyQuery.name;
            payload.query = companyQuery.value;
            const companyResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                payload,
                utilService.InvocationType.RequestResponse,
            );

            if (companyResult.recordset.length === 0) {
                return undefined;
            }

            companies = companyResult.recordset.map(({ ID: id, CompanyName: name }) => {
                return { id, name } as Company;
            });
        } else {
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

            const companiesQuery = new Query('ListCompanies', Queries.listCompanies);
            companiesQuery.appendFilter(`where ID in (${companyIds})`, false);
            payload.queryName = companiesQuery.name;
            payload.query = companiesQuery.value;
            const companiesResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                payload,
                utilService.InvocationType.RequestResponse,
            );

            if (companiesResult.recordset.length === 0) {
                return undefined;
            }

            companies = companiesResult.recordset.map(({ ID: id, CompanyName: name }) => {
                return { id, name } as Company;
            });
        }

        return { results: companies } as Companies;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

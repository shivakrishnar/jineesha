import { Queries } from '../../../queries/queries';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Query } from '../../../queries/query';
import { Role } from '../../models/Role';

import * as errorService from '../../../errors/error.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as utilService from '../../../util.service';

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    eeCode: string;
    companyName: string;
    isSalary: boolean;
    isActive: boolean;
};

/**
 * Returns a listing of employees for a specific user within a tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address of the user.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<PaginatedResult>}: Promise of a paginated array of employees
 */
export async function listByTenant(
    tenantId: string,
    email: string,
    roles: string[],
    domainName: string,
    path: string,
    queryParams: any,
): Promise<PaginatedResult> {
    console.info('employeeService.listByTenant');

    const validQueryStringParameters = ['pageToken', 'consolidated', 'search'];

    // Pagination validation
    const { page = 1, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let isGAOrSuperAdmin = false;
        for (const role of roles) {
            if (role === Role.globalAdmin || role === Role.superAdmin) {
                isGAOrSuperAdmin = true;
                break;
            }
        }

        let query: ParameterizedQuery;
        if (isGAOrSuperAdmin) {
            query = new ParameterizedQuery('ListEmployeesByTenant', Queries.listEmployeesByTenant);
        } else {
            query = new ParameterizedQuery('ListEmployeesForSbAdminByTenant', Queries.listEmployeesForSbAdminByTenant);
            query.setParameter('@username', email);
        }

        if (queryParams && queryParams.search) {
            const searchString = queryParams.search.replace(/[^a-zA-Z0-9]/g, '');
            query.setParameter('@search', `'${searchString}'`);
            return await getEmployees(tenantId, query, baseUrl, page);
        } else {
            query.setParameter('@search', '');
        }

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        return await getEmployees(tenantId, paginatedQuery, baseUrl, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a listing of employees for a specific user within a company
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} email: The email address of the user.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<PaginatedResult>}: Promise of a paginated array of employees
 */
export async function listByCompany(
    tenantId: string,
    companyId: string,
    email: string,
    roles: string[],
    domainName: string,
    path: string,
    queryParams: any,
): Promise<PaginatedResult> {
    console.info('employeeService.listByCompany');

    const validQueryStringParameters = ['pageToken', 'consolidated', 'search'];

    // Pagination validation
    const { page = 1, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        await utilService.validateCompany(tenantId, companyId);

        let query: ParameterizedQuery;
        if (roles.includes(Role.globalAdmin) || roles.includes(Role.superAdmin)) {
            query = new ParameterizedQuery('ListEmployeesByCompany', Queries.listEmployeesByCompany);
            query.setParameter('@companyId', companyId);
        } else if (roles.includes(Role.serviceBureauAdmin)) {
            query = new ParameterizedQuery('ListEmployeesForSbAdminByCompany', Queries.listEmployeesForSbAdminByCompany);
            query.setParameter('@companyId', companyId);
            query.setParameter('@username', email);
        } else if (roles.includes(Role.hrAdmin) || roles.includes(Role.hrRestrictedAdmin)) {
            query = new ParameterizedQuery('ListEmployeesForAdminByCompany', Queries.listEmployeesForAdminByCompany);
            query.setParameter('@companyId', companyId);
            query.setParameter('@username', email);
        } else if (roles.includes(Role.hrManager)) {
            query = new ParameterizedQuery('ListEmployeesForManagerByCompany', Queries.listEmployeesForManagerByCompany);
            query.setParameter('@companyId', companyId);
            query.setParameter('@username', email);
        }
        if (queryParams && queryParams.search) {
            const searchString = queryParams.search.replace(/[^a-zA-Z0-9]/g, '');
            query.setParameter('@search', `'${searchString}'`);
            return await getEmployees(tenantId, query, baseUrl, page);
        } else {
            query.setParameter('@search', '');
        }
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        return await getEmployees(tenantId, paginatedQuery, baseUrl, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns the details for the specified employee record.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the employee belongs to.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} email: The email address of the user.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 * @returns {Promise<Employee>}: Promise of an employee.
 */
export async function getById(tenantId: string, companyId: string, employeeId: string, email: string, roles: string[]): Promise<Employee> {
    console.info('employeeService.getById');

    try {
        let query: ParameterizedQuery;
        if (roles.includes(Role.globalAdmin) || roles.includes(Role.superAdmin)) {
            query = new ParameterizedQuery('GetEmployeeById', Queries.getEmployeeById);
            query.setParameter('@employeeId', employeeId);
        } else if (roles.includes(Role.serviceBureauAdmin)) {
            query = new ParameterizedQuery('GetEmployeeForSbAdminById', Queries.getEmployeeForSbAdminById);
            query.setParameter('@employeeId', employeeId);
            query.setParameter('@username', email);
        } else if (roles.includes(Role.hrAdmin) || roles.includes(Role.hrRestrictedAdmin)) {
            query = new ParameterizedQuery('GetEmployeeForAdminById', Queries.getEmployeeForAdminById);
            query.setParameter('@employeeId', employeeId);
            query.setParameter('@username', email);
        } else if (roles.includes(Role.hrManager)) {
            query = new ParameterizedQuery('GetEmployeeForManagerById', Queries.getEmployeeForManagerById);
            query.setParameter('@employeeId', employeeId);
            query.setParameter('@username', email);
        } else if (roles.includes(Role.baseUser)) {
            query = new ParameterizedQuery('GetEmployeeForEmployeeById', Queries.getEmployeeForEmployeeById);
            query.setParameter('@employeeId', employeeId);
            query.setParameter('@username', email);
        }

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            return undefined;
        }

        const record = result.recordset[0];

        return {
            id: record.ID,
            firstName: record.FirstName,
            lastName: record.LastName,
            eeCode: record.EmployeeCode,
            companyName: record.CompanyName,
            isSalary: record.IsSalary,
        } as Employee;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Retrieves a listing of employees.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {Query} query: The query to be executed to retrieve a listing of employees.
 * @param {string} baseUrl: The base URL of the request.
 * @param {number} page: The page number specified by the user.
 * @returns {Promise<PaginatedResult>}: Promise of a paginated array of employees
 */
async function getEmployees(tenantId: string, query: Query, baseUrl: string, page: number): Promise<PaginatedResult> {
    const payload = {
        tenantId,
        queryName: query.name,
        query: query.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

    const totalCount = result.recordsets[0][0].totalCount;
    const recordSet = result.recordsets[1];

    if (recordSet.length === 0) {
        return undefined;
    }

    const employees: Employee[] = recordSet.map((record) => {
        return {
            id: record.ID,
            firstName: record.FirstName,
            lastName: record.LastName,
            eeCode: record.EmployeeCode,
            companyName: record.CompanyName,
            isActive: record.IsActive,
        } as Employee;
    });

    return await paginationService.createPaginatedResult(employees, baseUrl, totalCount, page);
}

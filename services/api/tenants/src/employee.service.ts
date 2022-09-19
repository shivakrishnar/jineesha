import { Queries } from '../../../queries/queries';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Query } from '../../../queries/query';
import { Role } from '../../models/Role';
import { PlanCode } from '../../models/PlanCode';

import * as errorService from '../../../errors/error.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as utilService from '../../../util.service';
import * as payrollService from '../../../remote-services/payroll.service';
import * as ssoService from '../../../remote-services/sso.service';
import { EmployeeLicense } from './EmployeeLicense';
import { EmployeeCertificate } from './EmployeeCertificate';
import { EmployeeReview } from './EmployeeReview';
import { EmployeeClass } from './EmployeeClass';
import { IEvolutionKey } from '../../models/IEvolutionKey';
import { EmployeeAbsenceSummary, EmployeeAbsenceSummaryCategory } from './EmployeeAbsenceSummary';
import { EmployeeBenefit } from './EmployeeBenefit';

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    eeCode: string;
    companyName: string;
    isSalary: boolean;
    isActive: boolean;
    evoData: IEvolutionKey;
};

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
        await utilService.validateEmployee(tenantId, employeeId);

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
        } else if (roles.includes(Role.hrEmployee)) {
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
            evoData: {
                employeeId: record.evoEmployeeId,
                companyId: record.evoCompanyId,
                clientId: record.evoClientId,
            } as IEvolutionKey,
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
 * Lists all licenses for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee's licenses.
 */
export async function listLicensesByEmployeeId(
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('employeeService.listLicensesByEmployeeId');

    const validQueryStringParameters = ['pageToken', 'expiring'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query;
        query = new ParameterizedQuery('listLicensesByEmployeeId', Queries.listLicensesByEmployeeId);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            const expiring = utilService.parseQueryParamsBoolean(queryParams, 'expiring');

            if (expiring) {
                query = new ParameterizedQuery('listExpiringLicensesByEmployeeId', Queries.listExpiringLicensesByEmployeeId);
                query.setParameter('@companyId', companyId);
            }
        }

        query.setParameter('@employeeId', employeeId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;

        const expiringLicenses: EmployeeLicense[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                employeeId: record.EmployeeID,
                licenseTypeId: record.LicenseTypeID,
                licenseNumber: record.LicenseNumber,
                issuedBy: record.IssuedBy,
                issuedDate: record.IssuedDate,
                expirationDate: record.ExpirationDate,
                notes: record.Notes,
                emailAcknowledged: record.EmailAcknowledged,
                licenseTypeCompanyId: record.CompanyID,
                licenseTypeCode: record.Code,
                licenseTypeDescription: record.Description,
                licenseTypePriority: record.Priority,
                licenseTypeActive: record.Active,
            } as EmployeeLicense;
        });

        return await paginationService.createPaginatedResult(expiringLicenses, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Update a specific EmployeeLicense's record
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} id: The unique identifier for the license.
 * @param {any} request: The body that comes with the PATCH request.
 * @returns {any}: A Promise of the update response.
 */
export async function updateEmployeeLicenseById(
    tenantId: string,
    companyId: string,
    employeeId: string,
    id: string,
    request: any,
): Promise<any> {
    console.info('employeeService.updateEmployeeLicenseById');

    if (Number.isNaN(Number(id))) throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid id.`);

    try {
        const { emailAcknowledged } = request;

        const query = new ParameterizedQuery('updateEmployeeLicenseById', Queries.updateEmployeeLicenseById);
        query.setParameter('@emailAcknowledged', emailAcknowledged);
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@id', id);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) throw errorService.getErrorResponse(50).setDeveloperMessage(`License with ID ${id} not found.`);

        return {
            id: parseInt(id),
            oldEmailAcknowledged: result.recordsets[0][0].EmailAcknowledged === '1',
            newEmailAcknowledged: result.recordsets[1][0].EmailAcknowledged === '1',
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all the certificates for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee's certificates.
 */
export async function listCertificatesByEmployeeId(
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('employeeService.listCertificatesByEmployeeId');

    const validQueryStringParameters = ['pageToken', 'expiring'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query;
        query = new ParameterizedQuery('listCertificatesByEmployeeId', Queries.listCertificatesByEmployeeId);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            const expiring = utilService.parseQueryParamsBoolean(queryParams, 'expiring');

            if (expiring) {
                query = new ParameterizedQuery('listExpiringCertificatesByEmployeeId', Queries.listExpiringCertificatesByEmployeeId);
                query.setParameter('@companyId', companyId);
            }
        }

        query.setParameter('@employeeId', employeeId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;

        const certificates: EmployeeCertificate[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                employeeId: record.EmployeeID,
                certificateTypeId: record.CertificateTypeID,
                certificateNumber: record.CertificateNumber,
                issuedBy: record.IssuedBy,
                issuedDate: record.IssuedDate,
                expirationDate: record.ExpirationDate,
                notes: record.Notes,
                emailAcknowledged: record.EmailAcknowledged,
                certificateTypeCompanyId: record.CompanyID,
                certificateTypeCode: record.Code,
                certificateTypeDescription: record.Description,
                certificateTypePriority: record.Priority,
                certificateTypeActive: record.Active,
            } as EmployeeCertificate;
        });

        return await paginationService.createPaginatedResult(certificates, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Update a specific EmployeeCertificate's record
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} id: The unique identifier for the certificate.
 * @param {any} request: The body that comes with the PATCH request.
 * @returns {any}: A Promise of the update response.
 */
export async function updateEmployeeCertificateById(
    tenantId: string,
    companyId: string,
    employeeId: string,
    id: string,
    request: any,
): Promise<any> {
    console.info('employeeService.updateEmployeeCertificateById');

    if (Number.isNaN(Number(id))) throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid id.`);

    try {
        const { emailAcknowledged } = request;

        const query = new ParameterizedQuery('updateEmployeeCertificateById', Queries.updateEmployeeCertificateById);
        query.setParameter('@emailAcknowledged', emailAcknowledged);
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@id', id);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Certificate with ID ${id} not found.`);
        }

        return {
            id: parseInt(id),
            // Since booleans get returned as a stringified bit, these two lines check to see if the value returned is true,
            // then returns an actual boolean value instead of a '1'.
            oldEmailAcknowledged: result.recordsets[0][0].EmailAcknowledged === '1',
            newEmailAcknowledged: result.recordsets[1][0].EmailAcknowledged === '1',
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all reviews for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee's reviews.
 */
export async function listReviewsByEmployeeId(
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('employeeService.listReviewsByEmployeeId');

    const validQueryStringParameters = ['pageToken', 'upcoming'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query;
        query = new ParameterizedQuery('listReviewsByEmployeeId', Queries.listReviewsByEmployeeId);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            const upcoming = utilService.parseQueryParamsBoolean(queryParams, 'upcoming');

            if (upcoming) {
                query = new ParameterizedQuery('listUpcomingReviewsByEmployeeId', Queries.listUpcomingReviewsByEmployeeId);
                query.setParameter('@companyId', companyId);
            }
        }

        query.setParameter('@employeeId', employeeId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;

        const reviews: EmployeeReview[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                employeeId: record.EmployeeID,
                reviewTypeId: record.ReviewTypeID,
                scheduledDate: record.ScheduledDate,
                completedDate: record.CompletedDate,
                reviewByEmployeeId: record.ReviewByEmployeeID,
                notes: record.Notes,
                privateNotes: record.PrivateNotes,
                reviewTemplate: record.ReviewTemplate,
                emailAcknowledged: record.EmailAcknowledged,
                reviewTypeCompanyId: record.CompanyID,
                reviewTypeCode: record.Code,
                reviewTypeDescription: record.Description,
                reviewTypePriority: record.Priority,
                reviewTypeActive: record.Active,
            } as EmployeeReview;
        });

        return await paginationService.createPaginatedResult(reviews, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Update a specific EmployeeReview's record
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} id: The unique identifier for the review.
 * @param {any} request: The body that comes with the PATCH request.
 * @returns {any}: A Promise of the update response.
 */
export async function updateEmployeeReviewById(
    tenantId: string,
    companyId: string,
    employeeId: string,
    id: string,
    request: any,
): Promise<any> {
    console.info('employeeService.updateEmployeeReviewById');

    if (Number.isNaN(Number(id))) throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid id.`);

    try {
        const { emailAcknowledged } = request;

        const query = new ParameterizedQuery('updateEmployeeReviewById', Queries.updateEmployeeReviewById);
        query.setParameter('@emailAcknowledged', emailAcknowledged);
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@id', id);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Review with ID ${id} not found.`);
        }

        return {
            id: parseInt(id),
            // Since booleans get returned as a stringified bit, these two lines check to see if the value returned is true,
            // then returns an actual boolean value instead of a '1'.
            oldEmailAcknowledged: result.recordsets[0][0].EmailAcknowledged === '1',
            newEmailAcknowledged: result.recordsets[1][0].EmailAcknowledged === '1',
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists all the classes for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee's classes.
 */
export async function listClassesByEmployeeId(
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('employeeService.listClassesByEmployeeId');

    const validQueryStringParameters = ['pageToken', 'upcoming'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query;
        query = new ParameterizedQuery('listClassesByEmployeeId', Queries.listClassesByEmployeeId);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            const upcoming = utilService.parseQueryParamsBoolean(queryParams, 'upcoming');

            if (upcoming) {
                query = new ParameterizedQuery('listUpcomingClassesByEmployeeId', Queries.listUpcomingClassesByEmployeeId);
                query.setParameter('@companyId', companyId);
            }
        }

        query.setParameter('@employeeId', employeeId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;

        const classes: EmployeeClass[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                employeeId: record.EmployeeID,
                classId: record.ClassID,
                title: record.Title,
                description: record.Description,
                duration: record.Duration,
                instructor: record.Instructor,
                location: record.Location,
                credits: record.Credits,
                isOpen: record.IsOpen,
                classTime: record.ClassTime,
                completionDate: record.CompletionDate,
                expirationDate: record.ExpirationDate,
                gradeOrResult: record.GradeOrResult,
                notes: record.Notes,
                emailAcknowledged: record.EmailAcknowledged,
            } as EmployeeClass;
        });

        return await paginationService.createPaginatedResult(classes, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Update a specific Employee's class record
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier for the employee.
 * @param {string} id: The unique identifier for the review.
 * @param {any} request: The body that comes with the PATCH request.
 * @returns {any}: A Promise of the update response.
 */
export async function updateEmployeeClassById(
    tenantId: string,
    companyId: string,
    employeeId: string,
    id: string,
    request: any,
): Promise<any> {
    console.info('employeeService.updateEmployeeClassById');

    if (Number.isNaN(Number(id))) throw errorService.getErrorResponse(30).setDeveloperMessage(`${id} is not a valid id.`);

    try {
        const { emailAcknowledged } = request;

        const query = new ParameterizedQuery('updateEmployeeClassById', Queries.updateEmployeeClassById);
        query.setParameter('@emailAcknowledged', emailAcknowledged);
        query.setParameter('@employeeId', employeeId);
        query.setParameter('@id', id);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Class with ID ${id} not found.`);
        }

        return {
            id: parseInt(id),
            // Since booleans get returned as a stringified bit, these two lines check to see if the value returned is true,
            // then returns an actual boolean value instead of a '1'.
            oldEmailAcknowledged: result.recordsets[0][0].EmailAcknowledged === '1',
            newEmailAcknowledged: result.recordsets[1][0].EmailAcknowledged === '1',
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}
/**
 * Retrieves a periodEnd date on the most recent payroll.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {employeeEvoData} IEvolutionKey: Evo employee object.
 * @param {string} token: The evo accesstoken.
 * @returns {Promise<String>}: Promise of date string
 */
async function getLastPayrollPeriodEnd(tenantId: string, employeeEvoData: IEvolutionKey, token: string): Promise<String> {
    const payrolls = await payrollService.getPayrollsByCompanyId(tenantId, employeeEvoData, token);
    const lastPayroll = payrolls.filter((payroll) => payroll.Status === 'Processed').sort((a, b) => b.Id - a.Id)[0];
    const batches = await payrollService.getPayrollBatchesByPayrollId(tenantId, employeeEvoData, token, lastPayroll.Id);
    const lastBatch = batches ? batches.sort((a, b) => b.Id - a.Id)[0] : null;
    return lastBatch ? lastBatch.PeriodEnd : new Date(); 
}
/**
 * Get the absence summary for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {string} emailAddress: The email address of the user.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 * @param {string} accessToken: The access token of the user making the request.
 * @param {any} queryParams: Query parameters
 * @returns {EmployeeAbsenceSummary}: A Promise of an employee's absence summary.
 */
export async function getEmployeeAbsenceSummary(
    tenantId: string,
    companyId: string,
    employeeId: string,
    emailAddress: string,
    roles: string[],
    accessToken: string,
    queryParams: any,
): Promise<EmployeeAbsenceSummary> {
    console.info('employeeService.getEmployeeAbsenceSummary');

    const validQueryStringParameters = ['approved', 'upcoming'];
    try {
        const [employee, payrollApiAccessToken]: any[] = await Promise.all([
            getById(tenantId, companyId, employeeId, emailAddress, roles),
            utilService.getEvoTokenWithHrToken(tenantId, accessToken),
        ]);
        const tenantObject = await ssoService.getTenantById(tenantId, payrollApiAccessToken);
        const tenantName = tenantObject.subdomain;

        const query = new ParameterizedQuery('listEmployeeAbsenceByEmployeeId', Queries.listEmployeeAbsenceByEmployeeId);
        let approved = false;
        let upcoming = false;
        const currentDate = new Date();
        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);
            approved = queryParams.approved && utilService.parseQueryParamsBoolean(queryParams, 'approved');
            upcoming = queryParams.upcoming && utilService.parseQueryParamsBoolean(queryParams, 'upcoming');
        }

        query.setParameter('@employeeId', employeeId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [employeeTimeOffCategories, employeeTimeOffSummaries, companyTimeOffCategories, result]: any[] = await Promise.all([
            payrollService.getEvolutionTimeOffCategoriesByEmployeeId(tenantName, employee.evoData, payrollApiAccessToken),
            payrollService.getEvolutionTimeOffSummariesByEmployeeId(tenantName, employee.evoData, payrollApiAccessToken),
            payrollService.getEvolutionCompanyTimeOffCategoriesByCompanyId(tenantName, employee.evoData, payrollApiAccessToken),
            utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse),
        ]);

        if (
            !employeeTimeOffCategories ||
            employeeTimeOffSummaries.results.length === 0 ||
            !companyTimeOffCategories ||
            companyTimeOffCategories.length === 0
        ) {
            return undefined;
        }

        const getEmployeeTimeOffSummaryByCategoryId = (id) => {
            return employeeTimeOffSummaries.results.find((summary) => summary.timeOffCategoryId === id);
        };

        const filterAbsenceData = (timeOffCategoryId: number, lastAccrualDate) => {
            let scheduledApprovedHours = 0;
            let pendingApprovalHours = 0;
            const timeOffDates = [];           
            result.recordset.map((timeOffRequest) => {
                if (parseInt(timeOffRequest.EvoFK_TimeOffCategoryId) === timeOffCategoryId) {
                    if (timeOffRequest.Description === 'Pending' && new Date(timeOffRequest.StartDate) >= new Date(lastAccrualDate))
                        pendingApprovalHours += timeOffRequest.HoursTaken;
                    if (timeOffRequest.Description === 'Approved' && new Date(timeOffRequest.StartDate) > new Date(lastAccrualDate))
                        scheduledApprovedHours += timeOffRequest.HoursTaken;
                    if (
                        (approved &&
                            timeOffRequest.Description === 'Approved' &&
                            upcoming &&
                            new Date(timeOffRequest.StartDate) >= currentDate) ||
                        (approved && timeOffRequest.Description === 'Approved' && !upcoming) ||
                        (upcoming && new Date(timeOffRequest.StartDate) >= currentDate && !approved) ||
                        (!approved && !upcoming)
                    ) {
                        timeOffDates.push(timeOffRequest);
                    }
                }
            });
            return { scheduledApprovedHours, pendingApprovalHours, timeOffDates };
        };
        let unroundedTotalAvailableBalance: number = 0;
        const lastAccrualPeriodEndDate = await getLastPayrollPeriodEnd(tenantName, employee.evoData, payrollApiAccessToken)

        const categories: EmployeeAbsenceSummaryCategory[] = employeeTimeOffCategories.results.map((category) => {
            const companyCategory = companyTimeOffCategories.find((companyCat) => companyCat.Description === category.categoryDescription);
            // this should never happen, but if it does, console.error it and include it in the summary with a balance of 0
            if (!companyCategory) {
                console.error(
                    `No corresponding company category found for EE category ${category.categoryDescription} under ee ${employeeId}, company ${companyId}, tenant ${tenantId}`,
                );
            }
            const employeeSummary = companyCategory ? getEmployeeTimeOffSummaryByCategoryId(companyCategory.Id) : undefined;
            const { accruedHours = 0, usedHours = 0 } = employeeSummary || {};
            const { scheduledApprovedHours, pendingApprovalHours, timeOffDates } = filterAbsenceData(category.id, lastAccrualPeriodEndDate);
            const unroundedAvailableBalance = companyCategory.ShowEss == "Y" ? accruedHours - (scheduledApprovedHours + pendingApprovalHours + usedHours) : 0;
            const availableBalance = Math.round((unroundedAvailableBalance + Number.EPSILON) * 100) / 100; //using Number.EPSILON to ensure numbers like 1.005 is rounded correctly
            unroundedTotalAvailableBalance += unroundedAvailableBalance;

            return {
                category: category.categoryDescription,
                showInSelfService: companyCategory.ShowEss, //Evo toggler per each
                currentBalance: accruedHours - usedHours,
                scheduledHours: scheduledApprovedHours,
                pendingApprovalHours,
                availableBalance,
                timeOffDates,
            };
        });
        const totalAvailableBalance = Math.round((unroundedTotalAvailableBalance + Number.EPSILON) * 100) / 100;
        return {
            totalAvailableBalance,
            categories,
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Calculates voluntary life insurance rates per pay period for the various voluntary life insurance types
 * @param {string} tenantId 
 * @param {any} plan: Benefit plan object 
 * @param {number} dvlMultiplier: Optional param for dependent voluntary life multiplier
 * @param {date} birthDate: Optional param for birth date
 * @param {boolean} isSmoker: Whether the covered individual is a smoker or not
 * @returns {number} Voluntary Life Rate per pay period 
 */
async function calculateLifeRate(tenantId: string, plan: any, dvlMultiplier?: number, birthDate?: string, isSmoker?: boolean): Promise<number> {
    let lifeRate = 0;
    let addRate = 0;
    const yearlyPays = await utilService.getPaysPerYear(plan.PayFrequency, plan.DeductionFrequency)
    if (plan.ADDRate && !plan.ADDRequiresElection || (plan.ADDRequiresElection && plan.ADDIncluded)) {
        addRate = plan.ADDRate;
    }
    if (plan.CoverageAmount) {
        if (dvlMultiplier) {
            lifeRate = dvlMultiplier * plan.CoverageAmount / 1000;
        }
    
        if (birthDate) {
            const getAgeBandRate = new ParameterizedQuery('getAgeBandPremiumByAge', Queries.getAgeBandPremiumByAgeAndPlanId)
            const age = await utilService.getAgeOnBenefitPlanStartDate(birthDate, plan.StartDate);
            getAgeBandRate.setParameter('@age', age)
            getAgeBandRate.setParameter('@planId', plan.ID)

            const ageBandPayload = {
                tenantId,
                queryName: getAgeBandRate.name,
                query: getAgeBandRate.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const ageBandPremiumResult: any = await utilService.invokeInternalService('queryExecutor', ageBandPayload, utilService.InvocationType.RequestResponse)
            const ageBandPremium = ageBandPremiumResult.recordset[0];

            if (isSmoker) {
                lifeRate = ageBandPremium.SmokerPremium * plan.CoverageAmount / 1000;
            } else {
                lifeRate = ageBandPremium.Premium * plan.CoverageAmount / 1000;
            }
        }
        if (plan.IncludeADD && plan.EmployeeIncludedADD) {
            lifeRate += addRate * plan.CoverageAmount / 1000;
        }
    }
    return (((lifeRate * 12) / yearlyPays) * (plan.LifeEmployeeContributionPercent / 100)) || 0;
}

/**
 * Lists benefits for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of employee's benefits.
 */
export async function listBenefitsByEmployeeId( //we’ll want to separate BenefitPlan into its own endpoint and just add PlanID to the EmployeeBenefit record
    tenantId: string,
    companyId: string,
    employeeId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('employeeService.listBenefitsByEmployeeId');

    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        const query = new ParameterizedQuery('listBenefitsByEmployeeId', Queries.listBenefitsByEmployeeId);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);
        }
        query.setParameter('@companyId', companyId);
        query.setParameter('@employeeId', employeeId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;

        // Get covered dependents
        const coveredDependentsQuery = new ParameterizedQuery(
            'listCoveredDependentsByEmployeeId',
            Queries.listCoveredDependentsByEmployeeId,
        );

        coveredDependentsQuery.setParameter('@employeeId', employeeId);

        const coveredDependentsPayload = {
            tenantId,
            queryName: coveredDependentsQuery.name,
            query: coveredDependentsQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        // Get listed beneficiaries
        const beneficiariesQuery = new ParameterizedQuery(
            'listCoveredBeneficiariesByEmployeeId',
            Queries.listCoveredBeneficiariesByEmployeeId,
        );

        beneficiariesQuery.setParameter('@employeeId', employeeId);

        const coveredBeneficiariesPayload = {
            tenantId,
            queryName: beneficiariesQuery.name,
            query: beneficiariesQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const spouseBeneficiaryQuery = new ParameterizedQuery(
            'listEmployeeBeneficiariesByEmployeeIdAndRelationshipType',
            Queries.listEmployeeBeneficiariesByEmployeeIdAndRelationshipType
        )

        spouseBeneficiaryQuery.setParameter('@employeeId', employeeId);
        spouseBeneficiaryQuery.setParameter('@relationship', "Spouse");

        const spouseBeneficiaryPayload = {
            tenantId,
            queryName: spouseBeneficiaryQuery.name,
            query: spouseBeneficiaryQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [coveredDependentsResult, coveredBeneficiariesResult, spouseBeneficiaryResult] = await Promise.all<any>([
            utilService.invokeInternalService('queryExecutor', coveredDependentsPayload, utilService.InvocationType.RequestResponse),
            utilService.invokeInternalService('queryExecutor', coveredBeneficiariesPayload, utilService.InvocationType.RequestResponse),
            utilService.invokeInternalService('queryExecutor', spouseBeneficiaryPayload, utilService.InvocationType.RequestResponse)
        ]);

        const coveredDependentsArray = coveredDependentsResult.recordset.map((dependent) => {
            return {
                employeeBenefitId: dependent.EmployeeBenefitID,
                firstName: dependent.FirstName,
                lastName: dependent.LastName,
                relationship: dependent.RelationshipType,
            };
        });

        const beneficiariesArray = coveredBeneficiariesResult.recordset.map((beneficiary) => {
            return {
                employeeBenefitId: beneficiary.EmployeeBenefitID,
                firstName: beneficiary.FirstName,
                lastName: beneficiary.LastName,
                relationship: beneficiary.RelationshipType,
                birthDate: beneficiary.BirthDate,
                isPrimary: beneficiary.IsPrimary,
                isSmoker: beneficiary.IsSmoker
            }
        })

        async function planInfoTemplate(benefitObj: any) {


            const selfArray = [
                {
                    relationship: 'Self',
                },
            ];

            const filteredCoveredDependentArray = coveredDependentsArray.filter((dependent) => {
                return benefitObj.EmployeeBenefitID && parseInt(dependent.employeeBenefitId) === parseInt(benefitObj.EmployeeBenefitID);
            });
            const filteredBeneficiariesArray = beneficiariesArray.filter((beneficiary) => {
                return benefitObj.EmployeeBenefitID && parseInt(beneficiary.employeeBenefitId) === parseInt(benefitObj.EmployeeBenefitID);
            });

            const selfIncludedCoveredArray = [...selfArray, ...filteredCoveredDependentArray];

            let lifeCostPerPay = 0;
            const spouse = spouseBeneficiaryResult.recordset[0];

            if(benefitObj.PlanTypeCode === PlanCode.VoluntaryLife) {
                lifeCostPerPay = await calculateLifeRate(tenantId, benefitObj, null, benefitObj.BirthDate, benefitObj.IsSmoker)
            } else if (benefitObj.PlanTypeCode === PlanCode.SVL) {                
                lifeCostPerPay = await calculateLifeRate(tenantId, benefitObj, null, spouse?.BirthDate, spouse?.IsSmoker)
            } else if (benefitObj.PlanTypeCode === PlanCode.DVL) {
                lifeCostPerPay = await calculateLifeRate(tenantId, benefitObj, benefitObj.DependentVoluntaryLifeRate)
            }

            const planInfoArray = [];

            const planObj = {
                [PlanCode.Medical]: {
                    covered: selfIncludedCoveredArray,
                    premium: 'Premium',
                    term: 'DeductionFrequency',
                },
                [PlanCode.Dental]: {
                    covered: selfIncludedCoveredArray,
                    premium: 'Premium',
                    term: 'DeductionFrequency',
                },
                [PlanCode.Vision]: {
                    covered: selfIncludedCoveredArray,
                    premium: 'Premium',
                    term: 'DeductionFrequency',
                },
                [PlanCode.HSA]: {
                    contribution: 'EmployeeContribution',
                    annualLimitSingle: 'AnnualHSALimitSingle',
                    annualLimitFamily: 'AnnualHSALimitFamily',
                    annualEmployerContributionSingle: 'AnnualHSAEmployerContributionSingle',
                    annualEmployerContributionFamily: 'AnnualHSAEmployerContributionFamily',
                },
                [PlanCode.FSA]: {
                    contribution: 'EmployeeContribution',
                    annualLimit: 'AnnualFSALimit',
                },
                [PlanCode.DCA]: {
                    contribution: 'EmployeeContribution',
                    annualLimit: 'AnnualDCALimit',
                },
                [PlanCode.STD]: {
                    covered: selfArray,
                    cost: 'Premium',
                    benefitAmount: 'DisabilityPercent',
                    minBenefitAmount: 'BenefitMinimum',
                    maxBenefitAmount: 'BenefitMaximum',
                },
                [PlanCode.LTD]: {
                    covered: selfArray,
                    cost: 'Premium',
                    benefitAmount: 'DisabilityPercent',
                    minBenefitAmount: 'BenefitMinimum',
                    maxBenefitAmount: 'BenefitMaximum',
                },
                [PlanCode.BasicLife]: {
                    covered: selfArray,
                    coverageAmount: 'CoverageAmount',
                    guaranteedIssueAmount: 'LifeGuaranteedIssueAmount',
                    minBenefitAmount: 'BenefitMinimum',
                    beneficiaries: filteredBeneficiariesArray,
                },
                [PlanCode.VoluntaryLife]: {
                    covered: selfArray,
                    cost: lifeCostPerPay,
                    coverageAmount: 'CoverageAmount',
                    guaranteedIssueAmount: 'LifeGuaranteedIssueAmount',
                    minBenefitAmount: 'BenefitMinimum',
                    beneficiaries: filteredBeneficiariesArray,
                },
                [PlanCode.DVL]: {
                    covered: filteredCoveredDependentArray,
                    cost: lifeCostPerPay,
                    coverageAmount: 'CoverageAmount',
                    guaranteedIssueAmount: 'LifeGuaranteedIssueAmount',
                    minBenefitAmount: 'BenefitMinimum',
                },
                [PlanCode.SVL]: {
                    covered: filteredCoveredDependentArray,
                    cost: lifeCostPerPay,
                    coverageAmount: 'CoverageAmount',
                    guaranteedIssueAmount: 'LifeGuaranteedIssueAmount',
                    minBenefitAmount: 'BenefitMinimum',
                },
            };

            const plan = planObj[benefitObj.PlanTypeCode];

            for (const infoKey in plan) {
                let value = plan[infoKey];
                if (typeof value === 'string') {
                    value = benefitObj[value];
                }
                planInfoArray.push({ Key: infoKey, Value: value });
            }

            return planInfoArray;
        }


        const benefits: EmployeeBenefit[] = await Promise.all(result.recordsets[1].map(async (record) => {

            const planInfo: any = await planInfoTemplate(record);

            return {
                id: record.ID,
                companyId: record.CompanyID,
                code: record.Code,
                description: record.Description,
                policyNumber: record.PolicyNumber,
                startDate: record.StartDate,
                endDate: record.EndDate,
                planTypeId: record.PlanTypeID,
                planTypeCode: record.PlanTypeCode,
                planTypeDescription: record.PlanTypeDescription,
                carrierName: record.CarrierName,
                carrierUrl: record.CarrierUrl,
                elected: record.Elected,
                planInformation: planInfo,
            } as EmployeeBenefit;
        }));

        return await paginationService.createPaginatedResult(benefits, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

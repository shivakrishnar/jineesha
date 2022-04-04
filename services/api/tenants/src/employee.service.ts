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
        await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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

    await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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
        await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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

    await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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
        await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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

    await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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
        await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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

    await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

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
 * Get the absence summary for a specific employee
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {string} employeeId: The unique identifier employee.
 * @param {string} emailAddress: The email address of the user.
 * @param {string[]} roles: The roles memberships that are associated with the user.
 * @param {string} accessToken: The access token of the user making the request.
 * @returns {EmployeeAbsenceSummary}: A Promise of an employee's absence summary.
 */
export async function getEmployeeAbsenceSummary(
    tenantId: string,
    companyId: string,
    employeeId: string,
    emailAddress: string,
    roles: string[],
    accessToken: string,
): Promise<EmployeeAbsenceSummary> {
    console.info('employeeService.getEmployeeAbsenceSummary');

    try {
        const [employee, payrollApiAccessToken]: any[] = await Promise.all([
            getById(tenantId, companyId, employeeId, emailAddress, roles),
            utilService.getEvoTokenWithHrToken(tenantId, accessToken),
        ]);
        const tenantObject = await ssoService.getTenantById(tenantId, payrollApiAccessToken);
        const tenantName = tenantObject.subdomain;

        const query = new ParameterizedQuery('listEmployeeAbsenceByEmployeeId', Queries.listEmployeeAbsenceByEmployeeId);
        query.setParameter('@employeeId', employeeId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const [employeeTimeOffCategories, employeeTimeOffSummaries, result]: any[] = await Promise.all([
            payrollService.getEvolutionTimeOffCategoriesByEmployeeId(tenantName, employee.evoData, payrollApiAccessToken),
            payrollService.getEvolutionTimeOffSummariesByEmployeeId(tenantName, employee.evoData, payrollApiAccessToken),
            utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse),
        ]);

        if (!employeeTimeOffCategories || employeeTimeOffSummaries.results.length === 0 || result.recordset.length === 0) {
            return undefined;
        }

        const getEmployeeTimeOffSummaryByCategoryId = (id) => {
            return employeeTimeOffSummaries.results.find((summary) => summary.id === id);
        };

        const calculateCategoryPendingHours = (timeOffCategoryId: number) =>
            result.recordset
                .filter(
                    (timeOffRequest) =>
                        timeOffRequest.Description === 'Pending' && parseInt(timeOffRequest.EvoFK_TimeOffCategoryId) === timeOffCategoryId,
                )
                .reduce((accumulator, currentValue) => accumulator + currentValue.HoursTaken, 0);

        const absenceArray = result.recordset.map((absence) => {
            return {
                submitDate: absence.SubmitDate,
                startDate: absence.StartDate,
                returnDate: absence.ReturnDate,
                hoursTaken: absence.HoursTaken,
                requestStatus: absence.Description,
                evoTimeOffCategoryId: absence.EvoFK_TimeOffCategoryId,
            };
        });

        const filterAbsencesByCategory = (timeOffCategoryId: number) =>
            absenceArray.filter((timeOffRequest) => parseInt(timeOffRequest.evoTimeOffCategoryId) === timeOffCategoryId);

        let totalAvailableBalance: number = 0;

        const categories: EmployeeAbsenceSummaryCategory[] = employeeTimeOffCategories.results.map((category) => {
            const employeeSummary = getEmployeeTimeOffSummaryByCategoryId(category.id);
            const currentBalance = employeeSummary.accruedHours - employeeSummary.usedHours;
            const pendingApprovalHours = calculateCategoryPendingHours(category.id);
            const availableBalance = currentBalance - (employeeSummary.approvedHours + pendingApprovalHours);
            const timeOffDates = filterAbsencesByCategory(category.id);

            totalAvailableBalance += availableBalance;

            return {
                category: category.categoryDescription,
                currentBalance,
                scheduledHours: employeeSummary.approvedHours,
                pendingApprovalHours,
                availableBalance,
                timeOffDates,
            };
        });

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
        await utilService.validateEmployeeWithCompany(tenantId, companyId, employeeId);

        let query = new ParameterizedQuery('listBenefitsByEmployeeId', Queries.listBenefitsByEmployeeId);

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

        const benefits: EmployeeBenefit[] = result.recordsets[1].map((record) => {
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
                carrierURL: record.CarrierURL,
                premium: record.Premium,
                elected: record.Elected,
            } as EmployeeBenefit;
        });

        return await paginationService.createPaginatedResult(benefits, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.company-categories.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a list of company document categories', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listCompanyDocumentCategories(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((categories) => {
                expect(categories).toBeInstanceOf(PaginatedResult);
                expect(categories.results.length).toEqual(mockData.documentCategoriesResponse.length);
                expect(categories.results[0]).toEqual(mockData.documentCategoriesResponse[0]);
                expect(categories.results[1]).toEqual(mockData.documentCategoriesResponse[1]);
                expect(categories.results[2]).toEqual(mockData.documentCategoriesResponse[2]);
                expect(categories.results[3]).toEqual(mockData.documentCategoriesResponse[3]);
            });
    });

    test('returns a paginated count of zero if no categories are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listCompanyDocumentCategories(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((categories) => {
                expect(categories.count).toEqual(0);
            });
    });

    test('returns an error if one occurs', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            throw errorService.getErrorResponse(50).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listCompanyDocumentCategories(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });
});

describe('esignatureService.employee-categories.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a list of employee document categories by company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategoriesByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((categories) => {
                expect(categories).toBeInstanceOf(PaginatedResult);
                expect(categories.results.length).toBe(mockData.documentCategoriesResponse.length);
                expect(categories.results[0]).toEqual(mockData.documentCategoriesResponse[0]);
                expect(categories.results[1]).toEqual(mockData.documentCategoriesResponse[1]);
                expect(categories.results[2]).toEqual(mockData.documentCategoriesResponse[2]);
            });
    });

    test('returns a paginated count of zero if no employee document categories exist in company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            console.log('empty');
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategoriesByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((categories) => {
                expect(categories.count).toEqual(0);
            });
    });

    test('returns a list of employee document categories by company for a manager', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategoriesByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                true,
                mockData.userEmail,
            )
            .then((categories) => {
                expect(categories).toBeInstanceOf(PaginatedResult);
                expect(categories.results.length).toBe(mockData.documentCategoriesResponse.length);
                expect(categories.results[0]).toEqual(mockData.documentCategoriesResponse[0]);
                expect(categories.results[1]).toEqual(mockData.documentCategoriesResponse[1]);
                expect(categories.results[2]).toEqual(mockData.documentCategoriesResponse[2]);
            });
    });

    test('returns a paginated count of zero if no employee document categories exist for employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategories(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((categories) => {
                expect(categories.count).toEqual(0);
            });
    });

    test('returns a list of employee document categories by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategories(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((categories) => {
                expect(categories).toBeInstanceOf(PaginatedResult);
                expect(categories.results.length).toBe(mockData.documentCategoriesResponse.length);
                expect(categories.results[0]).toEqual(mockData.documentCategoriesResponse[0]);
                expect(categories.results[1]).toEqual(mockData.documentCategoriesResponse[1]);
                expect(categories.results[2]).toEqual(mockData.documentCategoriesResponse[2]);
            });
    });

    test('returns a 400 if employeeId is not integral while retrieving document categories by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategories(
                mockData.tenantId,
                mockData.companyId,
                'abc123',
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('returns a 404 if employee is not found while retrieving document categories by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategories(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`Employee with ID ${mockData.employeeId} not found`);
            });
    });

    test('returns a 404 if company is not found while retrieving document categories by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.documentCategoriesDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentCategories(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`The company id: ${mockData.companyId} not found`);
            });
    });

    test('throws an error if one occurs while retrieving document categories by company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listEmployeeDocumentCategoriesByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });

    test('throws an error if one occurs while retrieving document categories by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listEmployeeDocumentCategories(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });
});

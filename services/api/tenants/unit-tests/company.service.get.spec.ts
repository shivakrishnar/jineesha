import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as companyService from '../src/company.service';
import * as mockData from './mock-data';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('company.service.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a list of all companies as a Global or Super Admin user', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.getUserDBResponse());
            } else if (payload.queryName === 'ListCompanies') {
				return Promise.resolve(mockData.listCompaniesMockData.dbResponse())
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['global.admin', 'super.admin'], mockData.domainName, mockData.path, undefined)
            .then((response) => {
				expect(response).toBeInstanceOf(PaginatedResult);
                expect(response).toEqual(mockData.listCompaniesMockData.endpointResponse());
            });
    });

    test('returns a filtered list of companies as a Global or Super Admin user', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.getUserDBResponse());
            } else if (payload.queryName === 'ListCompanies') {
				return Promise.resolve(mockData.listCompaniesMockData.dbResponse(true))
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['global.admin', 'super.admin'], mockData.domainName, mockData.path, { search: 'test' })
            .then((response) => {
				expect(response).toBeInstanceOf(PaginatedResult);
                expect(response).toEqual(mockData.listCompaniesMockData.endpointResponse(true));
            });
    });
	   
    test('returns undefined if there are no companies as a global or super admin', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.getUserDBResponse());
            } else if (payload.queryName === 'ListCompanies') {
				return Promise.resolve(mockData.emptyPaginatedDBResponse);
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['global.admin', 'super.admin'], mockData.domainName, mockData.path, undefined)
            .then((response) => {
                expect(response).toEqual(undefined);
            });
    });
	   
    test('returns a list of all companies as an employee/manager/admin', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.getUserDBResponse(false));
            } else if (payload.queryName === 'ListCompanies') {
				return Promise.resolve(mockData.listCompaniesMockData.dbResponse())
			} else if (payload.queryName === 'GetUserCompaniesById') {
				return Promise.resolve(mockData.getUserCompaniesDBResponse);
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['hr.persona.user'], mockData.domainName, mockData.path, undefined)
            .then((response) => {
				expect(response).toBeInstanceOf(PaginatedResult);
                expect(response).toEqual(mockData.listCompaniesMockData.endpointResponse());
            });
    });
	   
    test('returns a filtered list of companies as an employee/manager/admin', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.getUserDBResponse(false));
            } else if (payload.queryName === 'ListCompanies') {
				return Promise.resolve(mockData.listCompaniesMockData.dbResponse(true))
			} else if (payload.queryName === 'GetUserCompaniesById') {
				return Promise.resolve(mockData.getUserCompaniesDBResponse);
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['hr.persona.user'], mockData.domainName, mockData.path, undefined)
            .then((response) => {
				expect(response).toBeInstanceOf(PaginatedResult);
                expect(response).toEqual(mockData.listCompaniesMockData.endpointResponse(true));
            });
    });
	   
    test('returns undefined if the employee/manager/admin user does not have access to any companies', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.getUserDBResponse(false));
            } else if (payload.queryName === 'ListCompanies') {
				return Promise.resolve(mockData.listCompaniesMockData.dbResponse(true))
			} else if (payload.queryName === 'GetUserCompaniesById') {
				return Promise.resolve(mockData.emptyDBResponse);
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['hr.persona.user'], mockData.domainName, mockData.path, undefined)
            .then((response) => {
                expect(response).toEqual(undefined);
            });
    });
	   
    test('returns a 404 error if the user does not exist', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetUserById') {
            	return Promise.resolve(mockData.emptyDBResponse);
			}
        });

        await companyService
            .list(mockData.tenantId, mockData.email, ['hr.persona.user'], mockData.domainName, mockData.path, undefined)
			.then(() => {
				done.fail(new Error('Test should throw an exception.'));
			})
            .catch((error) => {
				expect(error).toBeInstanceOf(ErrorMessage);
				expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`Could not find user with email ${mockData.email}`);
            });
		done();
    });
});

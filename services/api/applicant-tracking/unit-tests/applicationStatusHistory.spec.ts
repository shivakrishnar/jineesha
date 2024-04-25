import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as ApplicationStatusHistoryService from '../src/ApplicationStatusHistory.Service';
import * as mockData from './mock-data/applicationStatusHistory-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';


describe('getApplicationStatusHistoryById', () => {

    test('companyId must be an integer', () => {
        return ApplicationStatusHistoryService.getApplicationStatusHistoryById(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            mockData.ApplicationStatusHistoryToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('id must be an integer', () => {
        return ApplicationStatusHistoryService.getApplicationStatusHistoryById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.ApplicationStatusHistoryToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.ApplicationStatusHistoryToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationStatusHistoryById') {
                const result = await Promise.resolve(mockData.getApplicationStatusHistoryByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return ApplicationStatusHistoryService.getApplicationStatusHistoryById(
            sharedMockData.tenantId, 
            sharedMockData.anotherCompanyId,
            mockData.ApplicationStatusHistoryToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('returns a ApplicationStatusHistory', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationStatusHistoryById') {
                const result = await Promise.resolve(mockData.getApplicationStatusHistoryByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await ApplicationStatusHistoryService
            .getApplicationStatusHistoryById(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                mockData.ApplicationStatusHistoryToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getApplicationStatusHistoryByIdAPIResponse);
            });
    });
});

describe('getApplicationStatusHistoryByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return ApplicationStatusHistoryService.getApplicationStatusHistoryByTenant(
            sharedMockData.tenantId, 
            sharedMockData.unsupportedQueryParam, 
            sharedMockData.domainName, 
            sharedMockData.path
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationStatusHistoryByTenantDBResponse);
            return result;
        });

        const response = await ApplicationStatusHistoryService.getApplicationStatusHistoryByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getApplicationStatusHistoryByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationStatusHistoryByTenantDBResponseEmpty);
            return result;
        });

        const response = await ApplicationStatusHistoryService.getApplicationStatusHistoryByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response.results).toEqual([]);
        }
    });

});

describe('getApplicationStatusHistoryByCompany', () => {

    test('companyId must be an integer', () => {
        return ApplicationStatusHistoryService.getApplicationStatusHistoryByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return ApplicationStatusHistoryService.getApplicationStatusHistoryByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.unsupportedQueryParam, 
            sharedMockData.domainName, 
            sharedMockData.path
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationStatusHistoryByCompanyDBResponse);
            return result;
        });

        const response = await ApplicationStatusHistoryService.getApplicationStatusHistoryByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getApplicationStatusHistoryByCompanyAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationStatusHistoryByCompanyDBResponseEmpty);
            return result;
        });

        const response = await ApplicationStatusHistoryService.getApplicationStatusHistoryByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response.results).toEqual([]);
        }
    });

});

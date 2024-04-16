import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicationService from '../src/Application.Service';
import * as mockData from './mock-data/application-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getApplicationByCompany', () => {

    test('companyId must be an integer', () => {
        return applicationService.getApplicationByCompany(
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
        return applicationService.getApplicationByCompany(
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
            const result: any = Promise.resolve(mockData.getApplicationByCompanyDBResponse);
            return result;
        });

        const response = await applicationService.getApplicationByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getApplicationByCompanyAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationByCompanyDBResponseEmpty);
            return result;
        });

        const response = await applicationService.getApplicationByCompany(
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

describe('getApplicationById', () => {

    test('returns an Application', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationByKey') {
                const result = await Promise.resolve(mockData.getApplicationByKeyDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await applicationService
            .getApplicationByKey(
                sharedMockData.tenantId,
                mockData.applicationToGetByKey,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getApplicationByKeyAPIResponse);
            });
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationByKeyDBResponseEmpty);
            return result;
        });

        return await applicationService
            .getApplicationByKey(
                sharedMockData.tenantId,
                mockData.applicationToGetByKey,
            )
            .then((result) => {
                expect(result).toEqual([]);
            });
    });
});

describe('createApplication', () => {

    test('creates and returns a Application', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createApplication'){
                const result = await Promise.resolve(mockData.createApplicationDBResponse);
                return result;
            } else if (payload.queryName === 'getApplicationByKey') {
                const result = await Promise.resolve(mockData.getApplicationByKeyDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationService
            .createApplication(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createApplicationRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createApplicationAPIResponse);
            });
    });
});

describe('updateApplication', () => {

    test('updates Application', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'updateApplication'){
                return true;
            } else if (payload.queryName === 'getApplicationByKey') {
                const result = await Promise.resolve(mockData.getApplicationByKeyDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationService
            .updateApplication(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.updateApplicationRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateApplicationAPIResponse);
            });
    });
});
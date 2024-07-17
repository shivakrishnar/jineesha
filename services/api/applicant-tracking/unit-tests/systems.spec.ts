import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as SystemsService from '../src/Systems.Service';
import * as mockData from './mock-data/systems-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getSystemsByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return SystemsService.getSystemsByTenant(
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
            const result: any = Promise.resolve(mockData.getSystemsByTenantDBResponse);
            return result;
        });

        const response = await SystemsService.getSystemsByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getSystemsByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getSystemsByTenantDBResponseEmpty);
            return result;
        });

        const response = await SystemsService.getSystemsByTenant(
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

describe('getSystemsById', () => {

    test('id must be an integer', () => {
        return SystemsService.getSystemsById(
            sharedMockData.tenantId, 
            mockData.SystemsToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.SystemsToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a Systems', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getSystemsById') {
                const result = await Promise.resolve(mockData.getSystemsByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await SystemsService
            .getSystemsById(
                sharedMockData.tenantId,
                mockData.SystemsToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getSystemsByIdAPIResponse);
            });
    });
});

describe('createSystems', () => {

    test('creates and returns a Systems', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createSystems'){
                const result = await Promise.resolve(mockData.createSystemsDBResponse);
                return result;
            } else if (payload.queryName === 'getSystemsById') {
                const result = await Promise.resolve(mockData.getSystemsByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await SystemsService
            .createSystems(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createSystemsRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createSystemsAPIResponse);
            });
    });
});

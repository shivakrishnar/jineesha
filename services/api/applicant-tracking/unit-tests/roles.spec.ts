import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as RolesService from '../src/Roles.Service';
import * as mockData from './mock-data/roles-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getRolesByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return RolesService.getRolesByTenant(
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
            const result: any = Promise.resolve(mockData.getRolesByTenantDBResponse);
            return result;
        });

        const response = await RolesService.getRolesByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getRolesByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getRolesByTenantDBResponseEmpty);
            return result;
        });

        const response = await RolesService.getRolesByTenant(
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

describe('getRolesById', () => {

    test('id must be an integer', () => {
        return RolesService.getRolesById(
            sharedMockData.tenantId, 
            mockData.RolesToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.RolesToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a Roles', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getRolesById') {
                const result = await Promise.resolve(mockData.getRolesByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await RolesService
            .getRolesById(
                sharedMockData.tenantId,
                mockData.RolesToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getRolesByIdAPIResponse);
            });
    });
});

describe('createRoles', () => {

    test('creates and returns a Roles', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createRoles'){
                const result = await Promise.resolve(mockData.createRolesDBResponse);
                return result;
            } else if (payload.queryName === 'getRolesById') {
                const result = await Promise.resolve(mockData.getRolesByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await RolesService
            .createRoles(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createRolesRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createRolesAPIResponse);
            });
    });
});

describe('updateRoles', () => {

    test('updates Roles', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'updateRoles'){
                return true;
            } else if (payload.queryName === 'getRolesById') {
                const result = await Promise.resolve(mockData.getRolesByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await RolesService
            .updateRoles(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.updateRolesRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateRolesAPIResponse);
            });
    });
});

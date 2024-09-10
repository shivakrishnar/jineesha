import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as ClaimsService from '../src/Claims.Service';
import * as mockData from './mock-data/claims-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getClaimsByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return ClaimsService.getClaimsByTenant(
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
            const result: any = Promise.resolve(mockData.getClaimsByTenantDBResponse);
            return result;
        });

        const response = await ClaimsService.getClaimsByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getClaimsByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getClaimsByTenantDBResponseEmpty);
            return result;
        });

        const response = await ClaimsService.getClaimsByTenant(
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

describe('getClaimsById', () => {

    test('id must be an integer', () => {
        return ClaimsService.getClaimsById(
            sharedMockData.tenantId, 
            mockData.ClaimsToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.ClaimsToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a Claims', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getClaimsById') {
                const result = await Promise.resolve(mockData.getClaimsByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await ClaimsService
            .getClaimsById(
                sharedMockData.tenantId,
                mockData.ClaimsToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getClaimsByIdAPIResponse);
            });
    });
});
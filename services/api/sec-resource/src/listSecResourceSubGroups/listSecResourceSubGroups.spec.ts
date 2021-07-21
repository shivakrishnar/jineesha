/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../../util.service';
import * as mockData from '../mockData';
import * as service from './service.listSecResourceSubGroups';
import * as errorService from '../../../../errors/error.service';
import { setup } from '../../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../../pagination/paginatedResult';

const errorMessage = {
    statusCode: 500,
    code: 0,
    message: 'Unexpected error occurred.',
    developerMessage: 'Something happened on the server and we have no idea what. Blame the architect.',
    moreInfo: '',
};

describe('listSecResourceSubGroups Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns sub groups', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.subGroupsDBResponse);
        });

        return service.listSecResourceSubGroups(mockData.tenantId, mockData.domainName, mockData.path, undefined).then((subGroups) => {
            expect(subGroups).toBeInstanceOf(PaginatedResult);
            expect(subGroups.results.length).toBe(mockData.subGroupsDBResponse.recordsets[1].length);
            expect(subGroups.results[0]).toEqual(mockData.subGroupsResponse[0]);
            expect(subGroups.results[1]).toEqual(mockData.subGroupsResponse[1]);
            expect(subGroups.results[2]).toEqual(mockData.subGroupsResponse[2]);
        });
    });

    test('returns no sub groups', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyResourceDBResponse);
        });

        return service.listSecResourceSubGroups(mockData.tenantId, mockData.domainName, mockData.path, undefined).then((subGroups) => {
            expect(subGroups.results).toEqual([]);
        });
    });

    test('returns 500 with a non errorService response', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw 'test';
        });

        return service.listSecResourceSubGroups(mockData.tenantId, mockData.domainName, mockData.path, undefined).catch((error) => {
            expect(error).toEqual(errorMessage);
        });
    });

    test('returns 500 with errorService response', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw errorService.getErrorResponse(0);
        });

        return service.listSecResourceSubGroups(mockData.tenantId, mockData.domainName, mockData.path, undefined).catch((error) => {
            expect(error).toEqual(errorMessage);
        });
    });
});

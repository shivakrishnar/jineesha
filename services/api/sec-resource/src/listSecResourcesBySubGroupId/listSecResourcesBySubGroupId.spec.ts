/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../../util.service';
import * as mockData from '../mockData';
import * as service from './service.listSecResourcesBySubGroupId';
import { setup } from '../../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../../errors/errorMessage';

const errorMessage = {
    statusCode: 500,
    code: 0,
    message: 'Unexpected error occurred.',
    developerMessage: 'Something happened on the server and we have no idea what. Blame the architect.',
    moreInfo: '',
};

describe('listSecResourcesBySubGroupId Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns resources', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.resourcesDBResponse);
        });

        return service
            .listSecResourcesBySubGroupId(mockData.tenantId, mockData.subGroupId, mockData.domainName, mockData.path, undefined)
            .then((resources) => {
                expect(resources).toBeInstanceOf(PaginatedResult);
                expect(resources.results.length).toBe(mockData.resourcesDBResponse.recordsets[1].length);
                expect(resources.results[0]).toEqual(mockData.resourcesResponse[0]);
                expect(resources.results[1]).toEqual(mockData.resourcesResponse[1]);
                expect(resources.results[2]).toEqual(mockData.resourcesResponse[2]);
            });
    });

    test('returns ResourceSubGroup with subGroupId not found', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.nonExistentSubGroup);
        });

        return service
            .listSecResourcesBySubGroupId(mockData.tenantId, mockData.subGroupId, mockData.domainName, mockData.path, undefined)
            .catch((error) => {
                const errorTemplate = {
                    statusCode: 404,
                    code: 50,
                    message: 'The requested resource does not exist.',
                    developerMessage: `ResourceSubGroup with subGroupId ${mockData.subGroupId} not found.`,
                    moreInfo: '',
                };

                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error).toEqual(errorTemplate);
            });
    });

    test('returns 400 with invalid subGroupId error', () => {
        return service
            .listSecResourcesBySubGroupId(mockData.tenantId, mockData.invalidSubGroupId, mockData.domainName, mockData.path, undefined)
            .catch((error) => {
                const errorTemplate = {
                    statusCode: 400,
                    code: 30,
                    message: 'The provided request object was not valid for the requested operation.',
                    developerMessage: `${mockData.invalidSubGroupId} is not a valid subGroupId.`,
                    moreInfo: '',
                };

                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error).toEqual(errorTemplate);
            });
    });

    test('returns empty resources with an existing subGroupId', () => {
        (utilService as any).invokeInternalService = jest.fn((queryExecutor, payload) => {
            if (payload.queryName === 'getSecResourceSubGroupById') Promise.resolve(mockData.subGroupWithEmptyResourceResponse);
            return Promise.resolve(mockData.emptyResourceDBResponse);
        });

        return service
            .listSecResourcesBySubGroupId(mockData.tenantId, mockData.subGroupId, mockData.domainName, mockData.path, undefined)
            .then((resources) => {
                expect(resources.results).toEqual([]);
            });
    });

    test('returns 500 with a non errorService response', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw 'test';
        });

        return service
            .listSecResourcesBySubGroupId(mockData.tenantId, mockData.subGroupId, mockData.domainName, mockData.path, undefined)
            .catch((error) => {
                expect(error).toEqual(errorMessage);
            });
    });
});

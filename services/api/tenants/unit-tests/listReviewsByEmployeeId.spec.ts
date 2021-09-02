/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as errorService from '../../../errors/error.service';
import * as mockData from './mock-data';
import * as service from '../src/employee.service';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';

const errorMessage = {
    statusCode: 500,
    code: 0,
    message: 'Unexpected error occurred.',
    developerMessage: 'Something happened on the server and we have no idea what. Blame the architect.',
    moreInfo: '',
};

describe('listReviewsByEmployeeId Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns reviews', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.upcomingReviewsResult);
        });

        return service
            .listReviewsByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((reviews) => {
                expect(reviews).toBeInstanceOf(PaginatedResult);
                expect(reviews.results.length).toBe(mockData.upcomingReviewsResponse.length);
                expect(reviews.results[0]).toEqual(mockData.upcomingReviewsResponse[0]);
                expect(reviews.results[1]).toEqual(mockData.upcomingReviewsResponse[1]);
                expect(reviews.results[2]).toEqual(mockData.upcomingReviewsResponse[2]);
            });
    });

    test('returns empty resources', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyUpcomingReviewsResult);
        });

        return service
            .listReviewsByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((reviews) => {
                expect(reviews).toBeInstanceOf(PaginatedResult);
                expect(reviews.results.length).toBe(0);
                expect(reviews.results).toEqual([]);
            });
    });

    test('should return error', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            throw errorService.getErrorResponse(0);
        });

        return service
            .listReviewsByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .catch((error) => {
                expect(error).toEqual(errorMessage);
            });
    });
});

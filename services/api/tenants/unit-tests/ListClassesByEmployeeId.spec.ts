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

describe('listClassesByEmployeeId Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns Classes', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.upcomingClassesResult);
        });

        return service
            .listClassesByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((classes) => {
                console.log(mockData.upcomingClassesResponse[0]);
                console.log(classes.results[0]);
                expect(classes).toBeInstanceOf(PaginatedResult);
                expect(classes.results.length).toBe(mockData.upcomingClassesResponse.length);
                expect(classes.results[0]).toEqual(mockData.upcomingClassesResponse[0]);
                expect(classes.results[1]).toEqual(mockData.upcomingClassesResponse[1]);
                expect(classes.results[2]).toEqual(mockData.upcomingClassesResponse[2]);
                expect(classes.results[3]).toEqual(mockData.upcomingClassesResponse[3]);
            });
    });

    test('returns empty resources', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyUpcomingClassesResult);
        });

        return service
            .listClassesByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((Classes) => {
                expect(Classes).toBeInstanceOf(PaginatedResult);
                expect(Classes.results.length).toBe(0);
                expect(Classes.results).toEqual([]);
            });
    });

    test('should return error', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw errorService.getErrorResponse(0);
        });

        return service
            .listClassesByEmployeeId(
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

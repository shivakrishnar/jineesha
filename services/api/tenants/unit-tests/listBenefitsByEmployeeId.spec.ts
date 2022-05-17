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

describe('listBenefitsByEmployeeId Service', () => {
    beforeEach(() => {
        setup();
    })

    test('returns Benefits', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listBenefitsByEmployeeId') {
                return Promise.resolve(mockData.benefitsResult);
            } else if (payload.queryName === 'listCoveredDependentsByEmployeeId') {
                return Promise.resolve(mockData.coveredDependentsResult);
            } else if (payload.queryName === 'listCoveredBeneficiariesByEmployeeId') {
                return Promise.resolve(mockData.coveredBeneficiariesResult)
            }
        });

        return service
            .listBenefitsByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((benefits) => {
                expect(benefits).toBeInstanceOf(PaginatedResult);
                expect(benefits.results.length).toBe(mockData.benefitsResponse.length);
                expect(benefits.results[0]).toEqual(mockData.benefitsResponse[0]);
                expect(benefits.results[1]).toEqual(mockData.benefitsResponse[1]);
                expect(benefits.results[2]).toEqual(mockData.benefitsResponse[2]);
            });
    });

    test('returns empty resources', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyBenefitsResult);
        });

        return service
            .listBenefitsByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((benefits) => {
                expect(benefits).toBeInstanceOf(PaginatedResult);
                expect(benefits.results.length).toBe(0);
                expect(benefits.results).toEqual([]);
            });
    });

    test('should return error', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            throw errorService.getErrorResponse(0);
        });

        return service
            .listBenefitsByEmployeeId(
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

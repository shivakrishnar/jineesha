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

describe('listCertificatesByEmployeeId Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns resources', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.expiringCertificatesResult);
        });

        return service
            .listCertificatesByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((certificates) => {
                expect(certificates).toBeInstanceOf(PaginatedResult);
                expect(certificates.results.length).toBe(mockData.expiringCertificatesResponse.length);
                expect(certificates.results[0]).toEqual(mockData.expiringCertificatesResponse[0]);
                expect(certificates.results[1]).toEqual(mockData.expiringCertificatesResponse[1]);
                expect(certificates.results[2]).toEqual(mockData.expiringCertificatesResponse[2]);
            });
    });

    test('returns empty resources', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            return Promise.resolve();
        });

        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyExpiringCertificatesResult);
        });

        return service
            .listCertificatesByEmployeeId(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
            )
            .then((certificates) => {
                expect(certificates).toBeInstanceOf(PaginatedResult);
                expect(certificates.results.length).toBe(0);
                expect(certificates.results).toEqual([]);
            });
    });

    test('should return error', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn(() => {
            throw errorService.getErrorResponse(0);
        });

        return service
            .listCertificatesByEmployeeId(
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

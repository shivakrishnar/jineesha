/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as mockData from './mock-data';
import * as service from '../src/company.service';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';

describe('list Company benefits Open-Enrollments', () => {
    beforeEach(() => {
        setup();
    });

    test('returns resources', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.companyOpenEnrollments);
        });

        return service
            .listCompanyOpenEnrollments(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((openEnrollments) => {
                expect(openEnrollments).toBeInstanceOf(PaginatedResult);
                expect(openEnrollments.results.length).toBe(mockData.companyOpenEnrollments.recordsets[1].length);
                expect(openEnrollments.results).toEqual(mockData.companyOpenEnrollmentResponse.results);
            });
    });

    test('returns empty resources', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyResult);
        });

        return service
            .listCompanyOpenEnrollments(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((openEnrollments) => {
                expect(openEnrollments).toEqual(undefined);
            });
    });

    describe('queryParams', () => {
        test('should return resources with current param', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyOpenEnrollments);
            });

            return service
                .listCompanyOpenEnrollments(mockData.tenantId, mockData.companyId, { current: 'true' }, mockData.domainName, mockData.path)
                .then((openEnrollments) => {
                    expect(openEnrollments.results).toBeTruthy();
                });
        });

        test('should return error with unsupported parameters', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyOpenEnrollments);
            });

            return service
                .listCompanyOpenEnrollments(mockData.tenantId, mockData.companyId, { abc: 'true' }, mockData.domainName, mockData.path)
                .catch((error) => {
                    expect(error).toEqual({
                        statusCode: 400,
                        code: 60,
                        message: 'Invalid url parameter value',
                        developerMessage: "Unsupported query parameter(s) supplied",
                        moreInfo: 'Available query parameters: pageToken,current. See documentation for usage.',
                    });
                });
        });
    });
});

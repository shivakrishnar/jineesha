/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as mockData from './mock-data';
import * as service from '../src/company.service';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';

describe('listCompanyAnnouncements Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns resources', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.companyAnnouncements);
        });

        return service
            .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((announcements) => {
                expect(announcements).toBeInstanceOf(PaginatedResult);
                expect(announcements.results.length).toBe(mockData.companyAnnouncements.recordsets[1].length);
                expect(announcements.results).toEqual(mockData.companyAnnouncementsResponse.results);
            });
    });

    test('returns empty resources', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyResult);
        });

        return service
            .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((announcements) => {
                expect(announcements).toEqual(undefined);
            });
    });

    describe('queryParams', () => {
        test('should return resources with expiring param', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, { expiring: 'true' }, mockData.domainName, mockData.path)
                .then((announcements) => {
                    expect(announcements.results).toBeTruthy();
                });
        });

        test('should return resources with indefinite param', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, { indefinite: 'true' }, mockData.domainName, mockData.path)
                .then((announcements) => {
                    expect(announcements.results).toBeTruthy();
                });
        });

        test('should return error with unsupported parameters', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, { abc: 'true' }, mockData.domainName, mockData.path)
                .catch((error) => {
                    expect(error).toEqual({
                        statusCode: 400,
                        code: 60,
                        message: 'Invalid url parameter value',
                        developerMessage: "'abc' is not a valid query parameter.",
                        moreInfo: '',
                    });
                });
        });

        test('should return error when using non-boolean strings in the query params for expiring and indefinite', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, { expiring: 'abc' }, mockData.domainName, mockData.path)
                .catch((error) => {
                    expect(error).toEqual({
                        statusCode: 400,
                        code: 60,
                        message: 'Invalid url parameter value',
                        developerMessage: "'abc' is not a boolean value.",
                        moreInfo: '',
                    });
                });
        });
    });
});

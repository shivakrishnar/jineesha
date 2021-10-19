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

    test('should return a 404 if no announcements were found', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyResult);
        });

        return service
            .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .catch((error) => {
                expect(error).toEqual({
                    statusCode: 404,
                    code: 50,
                    message: 'The requested resource does not exist.',
                    developerMessage: `Announcements for company with the ID ${mockData.companyId} not found.`,
                    moreInfo: '',
                });
            });
    });

    describe('queryParams', () => {
        test('should return resources with active param', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, { active: 'true' }, mockData.domainName, mockData.path)
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

        test('should return error when using active and indefinite query params together', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(
                    mockData.tenantId,
                    mockData.companyId,
                    { active: 'true', indefinite: 'false' },
                    mockData.domainName,
                    mockData.path,
                )
                .catch((error) => {
                    expect(error).toEqual({
                        statusCode: 400,
                        code: 60,
                        message: 'Invalid url parameter value',
                        developerMessage: 'The query params active and indefinite cannot be used together',
                        moreInfo: '',
                    });
                });
        });

        test('should return error when using non-boolean strings in the query params for active and indefinite', () => {
            (utilService as any).invokeInternalService = jest.fn(() => {
                return Promise.resolve(mockData.companyAnnouncements);
            });

            return service
                .listCompanyAnnouncements(mockData.tenantId, mockData.companyId, { active: 'abc' }, mockData.domainName, mockData.path)
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

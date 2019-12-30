import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from './mock';

describe('esignatureService.categories.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a list of company document categories', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.companyDocumentCategoriesDBResponse);
        });

        return esignatureService
            .listCompanyDocumentCategories(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((categories) => {
                expect(categories).toBeInstanceOf(PaginatedResult);
                expect(categories.results.length).toEqual(mockData.companyDocumentCategoriesResponse.length);
                expect(categories.results[0]).toEqual(mockData.companyDocumentCategoriesResponse[0]);
                expect(categories.results[1]).toEqual(mockData.companyDocumentCategoriesResponse[1]);
                expect(categories.results[2]).toEqual(mockData.companyDocumentCategoriesResponse[2]);
                expect(categories.results[3]).toEqual(mockData.companyDocumentCategoriesResponse[3]);
            });
    });

    test('returns a paginated count of zero if no categories are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listCompanyDocumentCategories(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((categories) => {
                expect(categories.count).toEqual(0);
            });
    });

    test('returns an error if one occurs', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            throw errorService.getErrorResponse(50).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listCompanyDocumentCategories(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });
});

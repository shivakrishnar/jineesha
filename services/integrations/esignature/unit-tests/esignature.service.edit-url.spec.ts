import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.edit-url.create', () => {
    beforeEach(() => {
        setup();
    });

    test('creates and returns a edit url', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        return esignatureService.createEditUrl(mockData.tenantId, mockData.companyId, mockData.templateId).then((editUrl) => {
            expect(editUrl).toEqual(mockData.editUrlResponse);
        });
    });

    test('returns a 404 if company is not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return await esignatureService.createEditUrl(mockData.tenantId, mockData.companyId, mockData.templateId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual('The company id: 600013 not found');
        });
    });
});

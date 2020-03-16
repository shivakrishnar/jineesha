import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.template-metadata.create', () => {
    beforeEach(() => {
        setup();
    });

    test('creates and returns template metadata', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.userDBResponse);
        });

        return esignatureService
            .saveTemplateMetadata(
                mockData.tenantId,
                mockData.companyId,
                mockData.templateId,
                mockData.userEmail,
                mockData.templateMetadataRequestBody,
            )
            .then((metadata) => {
                const uploadDate = metadata.uploadDate;
                delete metadata.uploadDate;
                expect(metadata).toEqual(mockData.templateMetadataResponse);
                expect(uploadDate.split('T')[0]).toEqual(new Date().toISOString().split('T')[0]);
            });
    });

    test('returns a 400 if companyId is not integral', async () => {
        return await esignatureService
            .saveTemplateMetadata(
                mockData.tenantId,
                'abc123',
                mockData.templateId,
                mockData.userEmail,
                mockData.templateMetadataRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('throws an error if one occurs', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return await esignatureService
            .saveTemplateMetadata(
                mockData.tenantId,
                mockData.companyId,
                mockData.templateId,
                mockData.userEmail,
                mockData.templateMetadataRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });
});

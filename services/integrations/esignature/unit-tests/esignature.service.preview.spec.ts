import * as errorService from '../../../errors/error.service';
import * as hellosignService from '../../../remote-services/hellosign.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from './mock';

describe('esignatureService.preview.get', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a legacy document preview url', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            return Promise.resolve(mockData.documentDBResponse);
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.legacyDocumentEncodedId).then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.legacyDocumentPreviewUrlResponse);
        });
    });

    test('returns a HelloSign document preview url', () => {
        return esignatureService.getDocumentPreview(mockData.tenantId, '123').then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.hellosignDocumentPreviewUrlResponse);
        });
    });

    test('returns a non-legacy document preview url', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.s3DocumentEncodedId).then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.nonLegacyDocumentPreviewUrlResponse);
        });
    });

    test('returns a 404 if no legacy documents are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            return Promise.resolve(mockData.emptyDBResponse);
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.legacyDocumentEncodedId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual('The document id: 1 not found');
        });
    });

    test('returns a 404 if no non-legacy documents are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            return Promise.resolve(mockData.emptyDBResponse);
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.s3DocumentEncodedId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual('The document id: 1 not found');
        });
    });

    test('throws a HelloSign error if one occurs while getting a HelloSign document preview', () => {
        (hellosignService as any).getTemplateFilesById = jest.fn((params: any) => {
            throw { message: 'Template not found' };
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, '123').catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual('Template not found');
        });
    });

    test('throws a custom error if one occurs while getting a HelloSign document preview', () => {
        (hellosignService as any).getTemplateFilesById = jest.fn((params: any) => {
            throw errorService
                .getErrorResponse(40)
                .setDeveloperMessage('Force this error')
                .setMoreInfo('More info');
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, '123').catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(409);
            expect(error.code).toEqual(40);
            expect(error.message).toEqual('Conflict. The provided request object already exists.');
            expect(error.developerMessage).toEqual('Force this error');
            expect(error.moreInfo).toEqual('More info');
        });
    });
});

import 'reflect-metadata'; // required by asure.auth dependency

import * as errorService from '../../../errors/error.service';
import * as hellosignService from '../../../remote-services/hellosign.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.preview.get', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a legacy document preview url if S3 object exists', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetDocumentMetadataById') {
                return Promise.resolve(mockData.documentMetadataDBResponse);
            }
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.legacyDocumentEncodedId).then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.legacyDocumentPreviewUrlResponse);
        });
    });

    test('returns a legacy document preview url if S3 object does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'GetDocumentMetadataById') {
                const dbResponse = { ...(await Promise.resolve(mockData.documentMetadataDBResponse)) };
                dbResponse.recordset[0].Pointer = undefined;
                return dbResponse;
            } else if (payload.queryName === 'GetDocumentById') {
                return Promise.resolve(mockData.documentSavedToS3Response);
            }
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.legacyDocumentEncodedId).then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.legacyDocumentPreviewUrlResponse);
        });
    });

    test('returns a 500 if the document failed to upload to S3', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'GetDocumentMetadataById') {
                const dbResponse = { ...(await Promise.resolve(mockData.documentMetadataDBResponse)) };
                dbResponse.recordset[0].Pointer = undefined;
                return dbResponse;
            } else if (payload.queryName === 'GetDocumentById') {
                return {};
            }
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, mockData.legacyDocumentEncodedId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(500);
            expect(error.code).toEqual(0);
            expect(error.message).toEqual('Unexpected error occurred.');
            expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            expect(error.moreInfo).toEqual('The file could not be uploaded to S3.');
        });
    });

    test('returns a HelloSign document preview url', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });
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
    
    test('returns a simple sign preview url', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                const signedDocument = { ...mockData.documentFileMetadataByIdDBResponse };
                signedDocument.recordset[0].SignatureStatusID = 1;
                return Promise.resolve(signedDocument);
            }
        });

        return esignatureService.getDocumentPreview(mockData.tenantId, '123').then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.nonLegacyDocumentPreviewUrlResponse);
        });
    });
});

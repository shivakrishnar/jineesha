import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.onboarding-preview.get', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a no-sign document preview url', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getOnboardingByKey') {
                return Promise.resolve(mockData.onboardingDBResponse);
            } else if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse)
            }
        });

        return esignatureService.getOnboardingDocumentPreview(mockData.tenantId, mockData.noSignDocId, mockData.onboardingDocumentPreviewRequest).then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.nonLegacyDocumentPreviewUrlResponse);
        });
    });

    test('returns a 404 if the onboarding does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getOnboardingByKey') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService.getOnboardingDocumentPreview(mockData.tenantId, mockData.noSignDocId, mockData.onboardingDocumentPreviewRequest).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual(`No onboarding found with key ${mockData.obKey}`);
        });
    });

    test('returns a 422 if the company docs section is not active', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getOnboardingByKey') {
                return Promise.resolve(mockData.onboardingCompanyDocsSectionOffDBResponse);
            }
        });

        return esignatureService.getOnboardingDocumentPreview(mockData.tenantId, mockData.noSignDocId, mockData.onboardingDocumentPreviewRequest).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(422);
            expect(error.code).toEqual(70);
            expect(error.message).toEqual('The database contains bad data.');
            expect(error.developerMessage).toEqual('The Company Documents section is not active on this task list');
        });
    });

    test('returns a 404 if the specified document does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getOnboardingByKey') {
                return Promise.resolve(mockData.onboardingDBResponse);
            } else if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService.getOnboardingDocumentPreview(mockData.tenantId, mockData.noSignDocId, mockData.onboardingDocumentPreviewRequest).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual(`Document with id ${mockData.noSignDocId} not found`);
        });
    });

    test('returns a legacy document preview url', () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getOnboardingByKey') {
                return Promise.resolve(mockData.onboardingDBResponse);
            } else if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'GetDocumentMetadataById') {
                return Promise.resolve(mockData.documentMetadataDBResponse);
            }
        });

        return esignatureService.getOnboardingDocumentPreview(mockData.tenantId, mockData.legacyDocumentEncodedId, mockData.onboardingDocumentPreviewRequest).then((previewUrl) => {
            expect(previewUrl).toEqual(mockData.legacyDocumentPreviewUrlResponse);
        });
    });
});

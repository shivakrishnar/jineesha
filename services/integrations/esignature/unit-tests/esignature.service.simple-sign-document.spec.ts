import 'reflect-metadata'; // required by asure.auth dependency

import * as configService from '../../../config.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

jest.mock('shortid');

describe('esignatureService.simple-sign-document.create', () => {
    beforeEach(() => {
        setup();
    });

    test('creates a simple sign document with a PDF file', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
            } else if (payload.queryName === 'createFileMetadata') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            }
        });

        (utilService as any).validateCompany = jest.fn(() => {
            return mockData.companyInfo.recordset[0];
        });
        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        return esignatureService
            .createSimpleSignDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.createSimpleSignDocumentRequest,
                mockData.ipAddress,
                mockData.employeeId,
            )
            .then((document) => {
                // we are unable to mock the Date() function unless we pull in another library,
                // so we delete all date properties
                delete document.uploadDate;
                delete document.esignDate;
                expect(document).toEqual(mockData.createSimpleSignDocumentResponse);
            });
    });

    test('creates a simple sign document with a jpg file', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
            } else if (payload.queryName === 'createFileMetadata') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            }
        });

        (utilService as any).validateCompany = jest.fn(() => {
            return mockData.companyInfo.recordset[0];
        });
        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        (configService as any).getFileBucketName = jest.fn(() => {
            // we manipulate this function to control which file type gets
            // returned from the mocked aws sdk
            return 'jpg';
        });

        return esignatureService
            .createSimpleSignDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.createSimpleSignDocumentRequest,
                mockData.ipAddress,
                mockData.employeeId,
            )
            .then((document) => {
                // we are unable to mock the Date() function unless we pull in another library,
                // so we delete all date properties
                delete document.uploadDate;
                delete document.esignDate;
                expect(document).toEqual(mockData.createSimpleSignDocumentResponse);
            });
    });

    test('creates a simple sign document with a png file', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
            } else if (payload.queryName === 'createFileMetadata') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            }
        });

        (utilService as any).validateCompany = jest.fn(() => {
            return mockData.companyInfo.recordset[0];
        });
        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        (configService as any).getFileBucketName = jest.fn(() => {
            return 'png';
        });

        return esignatureService
            .createSimpleSignDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.createSimpleSignDocumentRequest,
                mockData.ipAddress,
                mockData.employeeId,
            )
            .then((document) => {
                // we are unable to mock the Date() function unless we pull in another library,
                // so we delete all date properties
                delete document.uploadDate;
                delete document.esignDate;
                expect(document).toEqual(mockData.createSimpleSignDocumentResponse);
            });
    });

    test('returns a 404 if signature request not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'createFileMetadata') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            }
        });

        (utilService as any).validateCompany = jest.fn(() => {
            return mockData.companyInfo.recordset[0];
        });
        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        return esignatureService
            .createSimpleSignDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.createSimpleSignDocumentRequest,
                mockData.ipAddress,
                mockData.employeeId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Signature request with id 42dcb821-d91f-4b54-be47-16819128f845 not found');
            });
    });

    test('returns a 422 if signature request was already signed', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataByEsignatureMetadataId') {
                const signedDocument = { ...mockData.documentFileMetadataByIdDBResponse };
                signedDocument.recordset[0].SignatureStatusID = 1;
                return Promise.resolve(signedDocument);
            } else if (payload.queryName === 'createFileMetadata') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            }
        });

        (utilService as any).validateCompany = jest.fn(() => {
            return mockData.companyInfo.recordset[0];
        });
        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        return esignatureService
            .createSimpleSignDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.createSimpleSignDocumentRequest,
                mockData.ipAddress,
                mockData.employeeId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(70);
                expect(error.message).toEqual('The database contains bad data.');
                expect(error.developerMessage).toEqual('This document has already been signed.');
            });
    });
});

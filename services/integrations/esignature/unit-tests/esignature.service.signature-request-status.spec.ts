import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.signature-request-status.update', () => {
    beforeEach(() => {
        setup();
    });

    test('updates the signature status for an e-signature document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .updateSignatureRequestStatus(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.signatureRequestId,
                mockData.updateSignatureRequestStatusRequestBody,
            )
            .then((response) => {
                expect(response).toEqual(mockData.updateSignatureRequestStatusResponse);
            });
    });

    test('throws a 400 if companyId is not a valid number', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .updateSignatureRequestStatus(
                mockData.tenantId,
                'abc123',
                mockData.employeeId,
                mockData.signatureRequestId,
                mockData.updateSignatureRequestStatusRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('throws a 400 if employeeId is not a valid number', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .updateSignatureRequestStatus(
                mockData.tenantId,
                mockData.companyId,
                'abc123',
                mockData.signatureRequestId,
                mockData.updateSignatureRequestStatusRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('throws a 400 if employeeId is not a valid number', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .updateSignatureRequestStatus(
                mockData.tenantId,
                mockData.companyId,
                'abc123',
                mockData.signatureRequestId,
                mockData.updateSignatureRequestStatusRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('throws a 404 if signatureStatusId is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .updateSignatureRequestStatus(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.signatureRequestId,
                mockData.updateSignatureRequestStatusRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Status with step number 1 not found.');
            });
    });

    test('throws a 404 if signatureRequestId is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getSignatureStatusByStepNumber') {
                return Promise.resolve(mockData.signatureStatusDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService
            .updateSignatureRequestStatus(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.signatureRequestId,
                mockData.updateSignatureRequestStatusRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Signature request with ID 1234 not found.');
            });
    });
});

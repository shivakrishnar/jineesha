import 'reflect-metadata'; // required by asure.auth dependency

import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';
import { SignatureRequestListResponse } from '../../esignature/src/signature-requests/signatureRequestListResponse';
import { SignatureRequestResponse } from '../../esignature/src/signature-requests/signatureRequestResponse';

describe('esignatureService.onboarding', () => {
    beforeEach(() => {
        setup();
    });

    test('creates onboarding signature requests', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.hellosignDocsTaskListDBResponse);
            }
        });
        const request = { ...mockData.onboardingRequestBody };
        request.onboardingKey = 'returnNothing';
        return esignatureService.onboarding(mockData.tenantId, mockData.companyId, request).then((signatureRequests) => {
            expect(signatureRequests).toBeInstanceOf(SignatureRequestListResponse);
            expect(signatureRequests.results).toEqual(mockData.onboardingResponse.results);
        });
    });

    test('returns undefined if no task list documents are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.emptyPaginatedDBResponse);
            }
        });
        const request = { ...mockData.onboardingRequestBody };
        request.onboardingKey = 'returnNothing';
        return esignatureService.onboarding(mockData.tenantId, mockData.companyId, request).then((signatureRequests) => {
            expect(signatureRequests).toEqual(undefined);
        });
    });

    test('returns existing onboarding signature requests', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.hellosignDocsTaskListDBResponse);
            }
        });
        return esignatureService
            .onboarding(mockData.tenantId, mockData.companyId, mockData.onboardingRequestBody)
            .then((signatureRequests) => {
                expect(signatureRequests).toBeInstanceOf(SignatureRequestListResponse);
                expect(signatureRequests.results[0]).toBeInstanceOf(SignatureRequestResponse);
                expect(signatureRequests.results[1]).toBeInstanceOf(SignatureRequestResponse);
                expect(signatureRequests.results).toEqual(mockData.existingOnboardingResponse.results);
            });
    });

    test('returns a 400 if companyId is not integral', () => {
        return esignatureService.onboarding(mockData.tenantId, 'abc123', mockData.onboardingRequestBody).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(400);
            expect(error.code).toEqual(30);
            expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
            expect(error.developerMessage).toEqual('abc123 is not a valid number');
        });
    });

    test('throws a 404 if no HelloSign signature requests are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.hellosignDocsTaskListDBResponse);
            }
        });

        const request = { ...mockData.onboardingRequestBody };
        request.onboardingKey = 'errorNotFound';

        return esignatureService.onboarding(mockData.tenantId, mockData.companyId, request).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual('Signature not found');
        });
    });

    test('throws a custom error if one occurs', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            throw errorService.getErrorResponse(40).setMoreInfo('Force an error');
        });

        return esignatureService.onboarding(mockData.tenantId, mockData.companyId, mockData.onboardingRequestBody).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(409);
            expect(error.code).toEqual(40);
            expect(error.message).toEqual('Conflict. The provided request object already exists.');
            expect(error.developerMessage).toEqual('There are already records in the database with the same provided information.');
            expect(error.moreInfo).toEqual('Force an error');
        });
    });
});

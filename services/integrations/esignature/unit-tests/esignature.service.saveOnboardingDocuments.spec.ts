import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.saveOnboardingDocuments', () => {
    beforeEach(() => {
        setup();
    });

    test('saves onboarding documents successfully', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.obDocsTaskListDBResponse);
            } else if (payload.queryName === 'GetOnboardingByEmployeeIDAndKey') {
                return Promise.resolve(mockData.onboardingDBResponse);
            } else if (payload.queryName === 'GetOnboardingSignedSimpleSignDocuments') {
                return Promise.resolve(mockData.onboardingSimpleSignDBResponse);
            }
        });

        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeDBResponse.recordset[0];
        });

        return esignatureService
            .saveOnboardingDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.obKey,
                mockData.saveOnboardingDocumentRequest,
            )
            .then((doc) => {
                expect(doc).toEqual(undefined);
            });
    });

    test('returns a 404 if the onboarding does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.originalDocsTaskListDBResponse);
            } else if (payload.queryName === 'GetOnboardingByEmployeeIDAndKey') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeDBResponse.recordset[0];
        });

        return esignatureService
            .saveOnboardingDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.obKey,
                mockData.saveOnboardingDocumentRequest,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`No onboarding found with key ${mockData.obKey} for the specified employee.`);
            });
    });

    test('returns a 404 if there are no documents on the task list', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetTaskListDocuments') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'GetOnboardingByEmployeeIDAndKey') {
                return Promise.resolve(mockData.onboardingDBResponse);
            }
        });

        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeDBResponse.recordset[0];
        });

        return esignatureService
            .saveOnboardingDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.obKey,
                mockData.saveOnboardingDocumentRequest,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`No onboarding docs found with onboarding key ${mockData.obKey}`);
            });
    });
});

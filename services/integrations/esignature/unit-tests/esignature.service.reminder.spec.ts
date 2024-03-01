import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.reminder', () => {
    beforeEach(() => {
        setup();
    });

    test('sends reminder email to employee', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEsignatureMetadataByIdAndCompanyId') {
                return Promise.resolve(mockData.documentMetadataDBResponse);
            }
        });

        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        await esignatureService
            .sendReminderEmail(
                {
                    tenantId: mockData.tenantId,
                    companyId: mockData.companyId,
                    employeeId: mockData.employeeId,
                    documentId: mockData.signatureRequestId,
                },
                mockData.accessToken,
                mockData.userEmail,
                mockData.domainName,
            )
            .then((document) => {
                expect(document).toEqual(undefined);
            })
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('returns a 404 if the documentId is not valid', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEsignatureMetadataByIdAndCompanyId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoDBResponse.recordset[0];
        });

        await esignatureService
            .sendReminderEmail(
                {
                    tenantId: mockData.tenantId,
                    companyId: mockData.companyId,
                    employeeId: mockData.employeeId,
                    documentId: mockData.signatureRequestId,
                },
                mockData.accessToken,
                mockData.userEmail,
                mockData.domainName,
            )
            .then(() => {
                done.fail(new Error('Test should not pass.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`cannot find document with id ${mockData.signatureRequestId}`);
            });
        done();
    });

    test('returns a 422 if employee does not have email address', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEsignatureMetadataByIdAndCompanyId') {
                return Promise.resolve(mockData.documentMetadataDBResponse);
            }
        });

        (utilService as any).validateEmployee = jest.fn(() => {
            return mockData.employeeInfoWithoutEmailDBResponse.recordset[0];
        });

        await esignatureService
            .sendReminderEmail(
                {
                    tenantId: mockData.tenantId,
                    companyId: mockData.companyId,
                    employeeId: mockData.employeeId,
                    documentId: mockData.signatureRequestId,
                },
                mockData.accessToken,
                mockData.userEmail,
                mockData.domainName,
            )
            .then(() => {
                done.fail(new Error('Test should not pass.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(70);
                expect(error.message).toEqual('The database contains bad data.');
                expect(error.developerMessage).toEqual(`user does not have an email address`);
            });
        done();
    });
});

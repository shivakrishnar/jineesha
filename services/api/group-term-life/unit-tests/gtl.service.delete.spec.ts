import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as gtlService from '../gtl.service';
import * as mockData from './mock-data/gtl-mock-data';
import * as employeeService from '../../tenants/src/employee.service';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('gtl.service.delete', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a 400 when the supplied companyId is not an integer', () => {
        return gtlService
            .deleteGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyIdWithCharacter,
                mockData.employeeId,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 400 when the supplied employeeId is not an integer', () => {
        return gtlService
            .deleteGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeIdWithCharacter,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.employeeIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('deletes a gtl record for an employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'DeleteGtlRecord') {
                return Promise.resolve(mockData.deleteGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({
                evoData: {
                    employeeId: mockData.employeeId,
                    companyId: mockData.companyId,
                    clientId: mockData.clientId,
                },
            });
        });

        return gtlService
            .deleteGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then((response) => {
                expect(response.statusCode).toEqual(200);
            });
    });

    test('returns a 404 if employee does not have a GTL record', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'DeleteGtlRecord') {
                return Promise.resolve(mockData.deleteGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({});
        });

        await gtlService
            .deleteGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('No record exists for this employee!');
            });
        done();
    });

    test('returns a 404 if employee is not found', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'DeleteGtlRecord') {
                return Promise.resolve(mockData.deleteGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return undefined;
        });

        await gtlService
            .deleteGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Employee with ID 42242 not found.');
            });
        done();
    });
});

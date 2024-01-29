import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as gtlService from '../gtl.service';
import * as employeeService from '../../tenants/src/employee.service';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';
import * as mockData from './mock-data/gtl-mock-data';

describe('gtl.service.get', () => {
    beforeEach(() => {
        setup();
        (utilService as any).validateEmployee = jest.fn();
    });

    test('returns a 400 when the supplied companyId is not an integer', () => {
        return gtlService
            .listGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyIdWithCharacter,
                mockData.employeeId,
                mockData.emailAddress,
                [],
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
            .listGtlRecordsByEmployee(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeIdWithCharacter,
                mockData.emailAddress,
                [],
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

    test('fetches a gtl record for an employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({});
        });

        return gtlService
            .listGtlRecordsByEmployee(mockData.tenantId, mockData.companyId, mockData.employeeId, mockData.emailAddress, [])
            .then((response) => {
                expect(response).toEqual(mockData.getGtlRecordMockResult);
            });
    });

    test('throws a 404 if employee is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return undefined;
        });

        return gtlService
            .listGtlRecordsByEmployee(mockData.tenantId, mockData.companyId, mockData.employeeId, mockData.emailAddress, [])
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Employee with ID 42242 not found.');
            });
    });
});

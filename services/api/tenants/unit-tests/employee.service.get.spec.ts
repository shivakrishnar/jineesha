import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as employeeService from '../../tenants/src/employee.service';
import * as mockData from './mock-data';

import { setup } from '../../../unit-test-mocks/mock';
import { employeeInfoDBResponse, employeeMockResult } from './mock-data/employee-get-mock-data';

describe('employee.service.get', () => {
    beforeEach(() => {
        setup();
    });

    test('returns information on an employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(employeeInfoDBResponse);
            }
        });
        (utilService as any).validateEmployee = jest.fn(() => {
            return Promise.resolve({});
        });

        return employeeService
            .getById(mockData.tenantId, mockData.companyId, mockData.employeeId, mockData.email, mockData.roles)
            .then((response) => {
                expect(response).toEqual(employeeMockResult);
            });
    });
});

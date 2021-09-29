/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as payrollService from '../../../remote-services/payroll.service';
import * as mockData from './mock-data';
import * as service from '../src/employee.service';
import { setup } from '../../../unit-test-mocks/mock';

describe('getEmployeeAbsenceSummary Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns employee absence summary', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockData.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockData.getEvolutionTimeOffSummariesByEmployeeId;
        });
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockData.listEmployeeAbsenceByEmployeeIdResult);
            }
        });

        return service
            .getEmployeeAbsenceSummary(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.email,
                mockData.roles,
                mockData.accessToken,
            )
            .then((employeeAbsenceSummary) => {
                expect(employeeAbsenceSummary).toEqual(mockData.expectedEmployeeAbsenceSummary);
            });
    });

    test('should return time off categories not found', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return null;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockData.getEvolutionTimeOffSummariesByEmployeeId;
        });
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockData.listEmployeeAbsenceByEmployeeIdResult);
            }
        });

        return service
            .getEmployeeAbsenceSummary(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.email,
                mockData.roles,
                mockData.accessToken,
            )
            .catch((error) => {
                expect(error).toEqual({
                    code: 50,
                    developerMessage: 'No time off categories found.',
                    message: 'The requested resource does not exist.',
                    moreInfo: '',
                    statusCode: 404,
                });
            });
    });

    test('should return time off record not found when there is no record in EVO', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockData.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return { results: [] };
        });
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockData.listEmployeeAbsenceByEmployeeIdResult);
            }
        });

        return service
            .getEmployeeAbsenceSummary(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.email,
                mockData.roles,
                mockData.accessToken,
            )
            .catch((error) => {
                expect(error).toEqual({
                    code: 50,
                    developerMessage: 'No time off records found.',
                    message: 'The requested resource does not exist.',
                    moreInfo: '',
                    statusCode: 404,
                });
            });
    });

    test('should return time off record not found when there is no record in AHR', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockData.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockData.getEvolutionTimeOffSummariesByEmployeeId;
        });
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return service
            .getEmployeeAbsenceSummary(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.email,
                mockData.roles,
                mockData.accessToken,
            )
            .catch((error) => {
                expect(error).toEqual({
                    code: 50,
                    developerMessage: 'No time off records found.',
                    message: 'The requested resource does not exist.',
                    moreInfo: '',
                    statusCode: 404,
                });
            });
    });
});

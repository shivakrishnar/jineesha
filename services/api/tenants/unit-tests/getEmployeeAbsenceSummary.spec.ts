/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as payrollService from '../../../remote-services/payroll.service';
import * as mockData from './mock-data';
import * as mockEmployeeAbsence from './mock-data/employee-absence-mock-data';
import * as service from '../src/employee.service';
import { setup } from '../../../unit-test-mocks/mock';

describe('getEmployeeAbsenceSummary Service', () => {
    beforeEach(() => {
        setup();
    });

    test('returns employee absence summary', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                undefined,
            )
            .then((employeeAbsenceSummary) => {
                expect(employeeAbsenceSummary).toEqual(mockEmployeeAbsence.expectedEmployeeAbsenceSummary);
            });
    });

    test('should return time off categories not found', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return null;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                undefined,
            )
            .then((result) => {
                expect(result).toEqual(undefined);
            });
    });

    test('should return empty result when no company time off categories are found', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return [];
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                undefined
            )
            .then((result) => {
                expect(result).toEqual(undefined);
            });
    });

    test('returns empty resources', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return { results: [] };
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                undefined,
            )
            .then((employeeAbsenceSummary) => {
                expect(employeeAbsenceSummary).toEqual(undefined);
            });
    });

    test('should return time off record and empty timeOffDates if no records in AHR', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
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
                undefined
            )
            .then((result) => {
                expect(result).toEqual(mockEmployeeAbsence.expectedEmptyDBEmployeeAbsenceSummary );
            });
    });
    test('returns only approved entries and employee absence summary', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                {approved: 'true'},
            )
            .then((employeeAbsenceSummary) => {
                expect(employeeAbsenceSummary).toEqual(mockEmployeeAbsence.expectedApprovedEmployeeAbsenceSummary);
            });
    });
    test('returns only upcoming entries and employee absence summary', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                {upcoming: 'true'},
            )
            .then((employeeAbsenceSummary) => {
                expect(employeeAbsenceSummary).toEqual(mockEmployeeAbsence.expectedUpcomingEmployeeAbsenceSummary);
            });
    });
    test('returns approved/upcoming entries and employee absence summary', () => {
        (payrollService as any).getEvolutionTimeOffCategoriesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffCategoriesByEmployeeIdResult;
        });

        (payrollService as any).getEvolutionTimeOffSummariesByEmployeeId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionTimeOffSummariesByEmployeeId;
        });

        (payrollService as any).getEvolutionCompanyTimeOffCategoriesByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getEvolutionCompanyTimeOffCategoriesByCompanyId;
        });
        (payrollService as any).getPayrollsByCompanyId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollsByCompanyId;
        });
        (payrollService as any).getPayrollBatchesByPayrollId = jest.fn(() => {
            return mockEmployeeAbsence.getPayrollBatchesByPayrollId;
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeById') {
                return Promise.resolve(mockData.getEmployeeByIdResult);
            } else if (payload.queryName === 'listEmployeeAbsenceByEmployeeId') {
                return Promise.resolve(mockEmployeeAbsence.listEmployeeAbsenceByEmployeeIdResult);
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
                {approved: 'true', upcoming: 'true'},
            )
            .then((employeeAbsenceSummary) => {
                expect(employeeAbsenceSummary).toEqual(mockEmployeeAbsence.expectedApprovedUpcomingEmployeeAbsenceSummary);
            });
    });
});

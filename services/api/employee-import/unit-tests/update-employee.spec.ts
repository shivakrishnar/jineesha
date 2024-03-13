import 'reflect-metadata'; // required by asure.auth dependency
import * as employeeImportService from '../src/EmployeeImport.Service';
import * as mockData from './mock-data/mock-data-update-employee';
import * as mockDataCommon from './mock-data/mock-data-common';
import { setup } from '../../../unit-test-mocks/mock';
import * as utilService from '../../../util.service';
import * as ssoService from '../../../remote-services/sso.service';
import * as payrollService from '../../../remote-services/payroll.service';

describe('employeeImport.Service.updateEmployee', () => {
    beforeEach(() => {
        setup();
    });

    test('should return error cause access_token is empty', async () => {
        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            '').then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('Token not found');
            });
    });

    test('should return an error because the DataImportEvent was not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('The CSV header could not be found');
            });
    });

    test('validation script failure', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('Status was not returned from the validateEmployee script');
            });
    });

    test('data provided did not pass validation', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultFailedValidationEmployee);
            }
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toBe('The data provided did not pass validation');
            });
    });

    test('Evo info not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('Do not have what we need to update on EVO');
            });
    });

    test('Employee data not found in AHR database', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAllFieldsForUpdateEmployee') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve(mockDataCommon.accessToken);
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve(mockDataCommon.tenantId);
        });

        (payrollService as any).getEmployeeFromEvo = jest.fn(() => {
            return Promise.resolve(undefined);
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('Employee not found in AHR database');
            });
    });

    test('Employee not found in EVO', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAllFieldsForUpdateEmployee') {
                return Promise.resolve(mockData.resultAllFieldsForUpdateEmployee);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve(mockDataCommon.accessToken);
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve(mockDataCommon.tenantId);
        });

        (payrollService as any).getEmployeeFromEvo = jest.fn(() => {
            return Promise.resolve(undefined);
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('Employee does not exists in EVO');
            });
    });

    test('update script failed', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAllFieldsForUpdateEmployee') {
                return Promise.resolve(mockData.resultAllFieldsForUpdateEmployee);
            }
            else if (payload.queryName === 'getPositionTypeEvoIdByCode') {
                return Promise.resolve(mockData.resultPositionType);
            }
            else if (payload.queryName === 'getWorkerCompTypeEvoIdByCode') {
                return Promise.resolve(mockData.resultWorkerCompType);
            }
            else if (payload.queryName === 'updateEmployee') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve(mockDataCommon.accessToken);
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve(mockDataCommon.tenantId);
        });

        (payrollService as any).getEmployeeFromEvo = jest.fn(() => {
            return Promise.resolve(mockData.resultEmployeeEVO);
        });

        (payrollService as any).updateEmployeeInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('Status was not returned from the update script');
            });
    });

    test('employee update script failed', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAllFieldsForUpdateEmployee') {
                return Promise.resolve(mockData.resultAllFieldsForUpdateEmployee);
            }
            else if (payload.queryName === 'getPositionTypeEvoIdByCode') {
                return Promise.resolve(mockData.resultPositionType);
            }
            else if (payload.queryName === 'getWorkerCompTypeEvoIdByCode') {
                return Promise.resolve(mockData.resultWorkerCompType);
            }
            else if (payload.queryName === 'updateEmployee') {
                return Promise.resolve(mockData.resultFailedValidationEmployee);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve(mockDataCommon.accessToken);
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve(mockDataCommon.tenantId);
        });

        (payrollService as any).getEmployeeFromEvo = jest.fn(() => {
            return Promise.resolve(mockData.resultEmployeeEVO);
        });

        (payrollService as any).updateEmployeeInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toBe('The employee update script was not executed successfully');
            });
    });

    test('employee updated successfully', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateEmployeeDetails') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAllFieldsForUpdateEmployee') {
                return Promise.resolve(mockData.resultAllFieldsForUpdateEmployee);
            }
            else if (payload.queryName === 'getPositionTypeEvoIdByCode') {
                return Promise.resolve(mockData.resultPositionType);
            }
            else if (payload.queryName === 'getWorkerCompTypeEvoIdByCode') {
                return Promise.resolve(mockData.resultWorkerCompType);
            }
            else if (payload.queryName === 'updateEmployee') {
                return Promise.resolve(mockData.resultSuccessValidationEmployee);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve(mockDataCommon.accessToken);
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve(mockDataCommon.tenantId);
        });

        (payrollService as any).getEmployeeFromEvo = jest.fn(() => {
            return Promise.resolve(mockData.resultEmployeeEVO);
        });

        (payrollService as any).updateEmployeeInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateEmployee(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(true);
                expect(response.message).toBe('Employee was updated successfully');
            });
    });

});
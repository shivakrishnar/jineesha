import 'reflect-metadata'; // required by asure.auth dependency
import * as employeeImportService from '../src/EmployeeImport.Service';
import * as mockData from './mock-data/mock-data-update-compensation';
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
        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('Token not found');
            });
    });

    test('should return an error because the DataImportEvent was not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('The CSV header could not be found');
            });
    });

    test('validation script failure', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('Status was not returned from the validateCompensation script');
            });
    });

    test('data provided did not pass validation', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultFailedValidationCompensation);
            }
        });

        await employeeImportService.updateCompensation(
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

    test('insert script failed', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultFailedValidationCompensation);
            }
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('The compensation row was not inserted on AHR');
            });
    });

    test('error when fetching EVO Employee info', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultSuccessInsertCompensation);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve('123');
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve({ subdomain: '123' });
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('Do not have what we need to update on EVO');
            });
    });

    test('no alternate rates found on EVO', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultSuccessInsertCompensation);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve('123');
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve({ subdomain: '123' });
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(undefined);
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('Compensation was inserted successfully');
            });
    });

    test('no compensation found in AHR database', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultSuccessInsertCompensation);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getEmployeeCompensationByEmployeeID') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }            
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve('123');
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve({ subdomain: '123' });
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultAlternatesRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('No Compensation found in AHR database');
            });
    });

    test('error trying to update the column responsible for integrating Evo and AHR', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultSuccessInsertCompensation);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getEmployeeCompensationByEmployeeID') {
                return Promise.resolve(mockData.resultEmployeeCompensationSalaryAHR);
            }
            else if (payload.queryName === 'updateCompensation') {
                return Promise.resolve(undefined);
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve('123');
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve({ subdomain: '123' });
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultAlternatesRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return mockData.resultInsertCompensationEVO;
        });

        (payrollService as any).updateWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchEmployeeInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('The column responsible for integrating Evo and AHR was not updated');
            });
    });

    test('compensation by salary was inserted successfully', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultSuccessInsertCompensation);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getEmployeeCompensationByEmployeeID') {
                return Promise.resolve(mockData.resultEmployeeCompensationSalaryAHR);
            }
            else if (payload.queryName === 'updateCompensation') {
                return Promise.resolve({});
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve('123');
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve({ subdomain: '123' });
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultAlternatesRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return mockData.resultInsertCompensationEVO;
        });

        (payrollService as any).updateWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchEmployeeInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('Compensation was inserted successfully');
            });
    });

    test('compensation by hour was inserted successfully', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateCompensation') {
                return Promise.resolve(mockData.resultSuccessValidationCompensation);
            }
            else if (payload.queryName === 'insertCompensation') {
                return Promise.resolve(mockData.resultSuccessInsertCompensation);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getEmployeeCompensationByEmployeeID') {
                return Promise.resolve(mockData.resultEmployeeCompensationHourAHR);
            }
            else if (payload.queryName === 'updateCompensation') {
                return Promise.resolve({});
            }
        });

        (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
            return Promise.resolve('123');
        });

        (ssoService as any).getTenantById = jest.fn(() => {
            return Promise.resolve({ subdomain: '123' });
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultAlternatesRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return mockData.resultInsertCompensationEVO;
        });

        (payrollService as any).updateWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchEmployeeInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateCompensation(
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
                expect(response.message).toBe('Compensation was inserted successfully');
            });
    });

});
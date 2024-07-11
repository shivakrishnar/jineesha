import 'reflect-metadata'; // required by asure.auth dependency
import * as employeeImportService from '../src/EmployeeImport.Service';
import * as mockData from './mock-data/mock-data-update-alternate-rate';
import * as mockDataCommon from './mock-data/mock-data-common';
import { setup } from '../../../unit-test-mocks/mock';
import * as utilService from '../../../util.service';
import * as payrollService from '../../../remote-services/payroll.service';

describe('employeeImport.Service.updateAlternateRate', () => {
    beforeEach(() => {
        setup();
    });

    test('should return error cause access_token is empty', async () => {
        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            '', 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
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

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
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
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toBe('Status was not returned from the validateAlternateRate script');
            });
    });

    test('data provided did not pass validation', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultFailedValidationAlternateRate);
            }
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
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
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultFailedValidationAlternateRate);
            }
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toBe('The alternate rate row was not inserted on AHR');
            });
    });

    test('company is not integrated with EVO', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'isEVOIntegratedCompany') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(true);
                expect(response.message).toBe('Alternate rate was inserted successfully');
            });
    });

    test('error when fetching EVO Employee info', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'isEVOIntegratedCompany') {
                return Promise.resolve(mockData.resultSuccessCompanyIntegratedEVO);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
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
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'isEVOIntegratedCompany') {
                return Promise.resolve(mockData.resultSuccessCompanyIntegratedEVO);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(undefined);
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(true);
                expect(response.message).toContain('Alternate rate was inserted successfully');
            });
    });

    test('erro updating alternate rate id after insert new alternate rate', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultSuccessInsertAlternateRate);
            }
            else if (payload.queryName === 'isEVOIntegratedCompany') {
                return Promise.resolve(mockData.resultSuccessCompanyIntegratedEVO);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAlternateRatesByEmployee') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'updateAlternateRate') {
                return Promise.resolve(undefined);
            }
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultAlternatesRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return Promise.resolve(mockData.resultPostAlternateRate);
        });

        (payrollService as any).updateWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(false);
                expect(response.message).toContain('The column responsible for integrating Evo and AHR was not updated');
            });
    });

    test('insert new alternate rate', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultSuccessInsertAlternateRate);
            }
            else if (payload.queryName === 'isEVOIntegratedCompany') {
                return Promise.resolve(mockData.resultSuccessCompanyIntegratedEVO);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAlternateRatesByEmployee') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'updateAlternateRate') {
                return Promise.resolve({});
            }
            else if (payload.queryName === 'updateDataImportEventDetailProcessed') {
                return Promise.resolve({});
            }
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultAlternatesRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return Promise.resolve(mockData.resultPostAlternateRate);
        });

        (payrollService as any).updateWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(true);
                expect(response.message).toBe('Alternate rate was inserted successfully');
            });
    });

    test('update exist alternate rate', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultCSVHeader);
            }
            else if (payload.queryName === 'validateAlternateRate') {
                return Promise.resolve(mockData.resultSuccessValidationAlternateRate);
            }
            else if (payload.queryName === 'insertAlternateRate') {
                return Promise.resolve(mockData.resultSuccessInsertAlternateRate);
            }
            else if (payload.queryName === 'isEVOIntegratedCompany') {
                return Promise.resolve(mockData.resultSuccessCompanyIntegratedEVO);
            }
            else if (payload.queryName === 'getEmployeeByEmployeeCode') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'getAlternateRatesByEmployee') {
                return Promise.resolve(mockData.resultInfoEmployeeAHREVO);
            }
            else if (payload.queryName === 'updateAlternateRate') {
                return Promise.resolve({});
            }
            else if (payload.queryName === 'updateDataImportEventDetailProcessed') {
                return Promise.resolve({});
            }
        });

        (payrollService as any).getWagesFromEvoEmployee = jest.fn(() => {
            return Promise.resolve(mockData.resultExistAlternateRatesFromEVO);
        });

        (payrollService as any).postWageInEvo = jest.fn(() => {
            return Promise.resolve(mockData.resultPostAlternateRate);
        });

        (payrollService as any).updateWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        (payrollService as any).patchWageInEvo = jest.fn(() => {
            return Promise.resolve({});
        });

        await employeeImportService.updateAlternateRate(
            mockData.jsonCsvRow,
            1,
            mockDataCommon.tenantId,
            mockDataCommon.companyId, 
            mockDataCommon.dataImportTypeId,
            mockDataCommon.dataImportEventId,
            mockDataCommon.accessToken, 
            mockDataCommon.tenantName, 
            mockDataCommon.accessTokenEvo).then((response) => {
                expect(response).toHaveProperty('isSuccess');      
                expect(response).toHaveProperty('message');
                expect(response.isSuccess).toBe(true);
                expect(response.message).toBe('Alternate rate was inserted successfully');
            });
    });

});

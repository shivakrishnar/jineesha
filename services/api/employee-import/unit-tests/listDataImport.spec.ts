import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as employeeImportService from '../src/EmployeeImport.Service';
import * as mockData from './mock-data';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('dataimporttype.service.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of all data import types', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportTypes') {
                return Promise.resolve(mockData.dataImportTypes);
            }
        });

        await employeeImportService.listDataImportTypes(mockData.devTenantId).then((response) => {
            expect(response).toEqual(mockData.dataImportTypeResponse.recordset);
        });
    });

    test('returns empty for wrong tenant id', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportTypes') {
                return Promise.resolve(mockData.dataImportTypesEmpty);
            }
        });

        await employeeImportService.listDataImportTypes('123456789').then((response) => {
            expect(response).toEqual([]);
        });
    });
});

describe('dataimport.service.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of data imports', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportByCompany') {
                return Promise.resolve(mockData.dataImports);
            }
        });

        await employeeImportService
            .listDataImports(mockData.devTenantId, mockData.CompanyId, '', null, mockData.domainName, mockData.path)
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportsResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportsResponse.results);
            });
    });

    test('returns the list of data imports by data import type id', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportByCompanyAndDataImportType') {
                return Promise.resolve(mockData.dataImportsByDataImportTypeId);
            }
        });

        await employeeImportService
            .listDataImports(mockData.devTenantId, mockData.CompanyId, mockData.DataImportTypeId, null, mockData.domainName, mockData.path)
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportsByDataImportTypeResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportsByDataImportTypeResponse.results);
            });
    });

    test('returns undefined when the company has no imports', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportByCompanyAndDataImportType') {
                return Promise.resolve(mockData.dataImportsEmpty);
            }
        });

        await employeeImportService
            .listDataImports(mockData.devTenantId, '123456789', mockData.DataImportTypeId, null, mockData.domainName, mockData.path)
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('dataimporteventdetails.service.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of data import event details', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportEventDetail') {
                return Promise.resolve(mockData.dataImportEventDetails);
            }
        });

        await employeeImportService
            .listDataImportEventDetails(
                mockData.devTenantId,
                mockData.CompanyId,
                mockData.DataImportEventId,
                null,
                mockData.domainName,
                mockData.path,
            )
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportEventDetailsResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportEventDetailsResponse.results);
            });
    });

    test('returns undefined when the company has no import event detail', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportEventDetail') {
                return Promise.resolve(mockData.dataImportEventDetailsEmpty);
            }
        });

        await employeeImportService
            .listDataImportEventDetails(
                mockData.devTenantId,
                mockData.CompanyId,
                mockData.DataImportEventId,
                null,
                mockData.domainName,
                mockData.path,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.getTemplate', () => {
    beforeEach(() => {
        setup();
    });

    test('returns undefined if data import type is wrong', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.queryReturnedEmpty);
            }
        });

        await employeeImportService.getTemplate(mockData.devTenantId, mockData.DataImportTypeId).then((response) => {
            expect(response).toBe(undefined);
        });
    });
});

describe('employeeImport.Service.downloadImportData', () => {
    beforeEach(() => {
        setup();
    });

    test('returns undefined if data import type is wrong', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.queryReturnedEmpty);
            }
        });

        await employeeImportService
            .downloadImportData(
                mockData.devTenantId,
                mockData.CompanyId,
                mockData.DataImportEventId,
                null,
                mockData.domainName,
                mockData.path,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.updateEmployee', () => {
    beforeEach(() => {
        setup();
    });

    test('should return undefined if accessToken parameter is empty', async () => {
        await employeeImportService
            .updateEmployee(null, 1, mockData.devTenantId, mockData.CompanyId, mockData.DataImportTypeId, mockData.DataImportEventId, '')
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.updateCompensation', () => {
    beforeEach(() => {
        setup();
    });

    test('should return undefined if accessToken parameter is empty', async () => {
        await employeeImportService
            .updateCompensation(
                null,
                1,
                mockData.devTenantId,
                mockData.CompanyId,
                mockData.DataImportTypeId,
                mockData.DataImportEventId,
                '',
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.updateAlternateRate', () => {
    beforeEach(() => {
        setup();
    });

    test('should return undefined if accessToken parameter is empty', async () => {
        await employeeImportService
            .updateAlternateRate(
                null,
                1,
                mockData.devTenantId,
                mockData.CompanyId,
                mockData.DataImportTypeId,
                mockData.DataImportEventId,
                '',
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.uploadUrl', () => {
    beforeEach(() => {
        setup();
    });

    test('should return error cause filename is empty', async () => {
        await employeeImportService.uploadUrl(mockData.devTenantId, mockData.CompanyId, '').catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.message).toEqual('The parameter fileName is required');
        });
    });
});

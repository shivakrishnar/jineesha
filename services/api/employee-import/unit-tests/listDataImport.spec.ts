import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as employeeImportService from '../src/EmployeeImport.Service';
import * as mockData from './mock-data';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';

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

        await employeeImportService
            .listDataImportTypes(mockData.devTenantId)
            .then((response) => {
                expect(response).toEqual(mockData.dataImportTypeResponse.recordset);
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
            .listDataImports(mockData.devTenantId, mockData.devCompanyId, "", null, mockData.domainName, mockData.path)
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportsResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportsResponse.results);
            });
    });
});

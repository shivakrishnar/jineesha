import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as tenantService from '../src/tenants.service';
import * as mockData from './mock-data';
import { setup } from '../../../unit-test-mocks/mock';

describe('dataimporttype.service.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of all data import types', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportTypes') {
				return Promise.resolve(mockData.dataImportTypeResponse);
			}
        });

        await tenantService
            .listDataImportTypes(mockData.devTenantId)
            .then((response) => {
                expect(response).toEqual(mockData.dataImportTypeResponse.recordset);
            });
    });
});

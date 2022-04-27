/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as mockData from './mock-data';
import * as service from '../src/tenants.service';
import { setup } from '../../../unit-test-mocks/mock';

describe('list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns all tenants', () => {
        (service as any).listConnectionStrings = jest.fn(() => {
            return mockData.listTenantsMockData.dynamoResult;
        })

        return service.listAll()
            .then((tenants) => {
                expect(tenants).toEqual(mockData.listTenantsMockData.allResponse);
            });
    });

    test('returns direct tenants only', () => {
        (utilService as any).validateQueryParams = jest.fn(() => {
            return;
        });

        (utilService as any).parseQueryParamsBoolean = jest.fn(() => {
            return true;
        });

        (service as any).listConnectionStrings = jest.fn(() => {
            return mockData.listTenantsMockData.dynamoResult;
        })

        return service.listAll({ direct: 'true' })
            .then((tenants) => {
                expect(tenants).toEqual(mockData.listTenantsMockData.directResponse);
            });
    });

    test('returns indirect tenants only', () => {
        (utilService as any).validateQueryParams = jest.fn(() => {
            return;
        });

        (utilService as any).parseQueryParamsBoolean = jest.fn(() => {
            return false;
        });

        (service as any).listConnectionStrings = jest.fn(() => {
            return mockData.listTenantsMockData.dynamoResult;
        })

        return service.listAll({ direct: 'false' })
            .then((tenants) => {
                expect(tenants).toEqual(mockData.listTenantsMockData.indirectResponse);
            });
    });
});

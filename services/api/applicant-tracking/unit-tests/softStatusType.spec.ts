import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as softStatusTypesService from '../src/SoftStatusType.Service';
import * as mockData from './mock-data/softStatusType-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getSoftStatusTypesByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return softStatusTypesService.getSoftStatusTypesByTenant(
            sharedMockData.tenantId, 
            sharedMockData.unsupportedQueryParam,
            sharedMockData.domainName, 
            sharedMockData.path
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeByTenantResponse);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByTenant(
            sharedMockData.tenantId, 
            undefined,
            sharedMockData.domainName, 
            sharedMockData.path);
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.softStatusTypeByTenantResponse.recordsets[1]);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeByTenantResponseEmpty);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByTenant(
            sharedMockData.tenantId, 
            undefined,
            sharedMockData.domainName, 
            sharedMockData.path);

        if (response) {
            expect(response.results).toEqual([]);
        }
    });

});

describe('getSoftStatusTypesByCompany', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return softStatusTypesService.getSoftStatusTypesByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.unsupportedQueryParam,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponse);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            undefined);
        if (response) {
            expect(response).toEqual(mockData.softStatusTypeResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponseEmpty);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            undefined);

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });

});

describe('getSoftStatusTypesById', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return softStatusTypesService.getSoftStatusTypesById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atSoftStatusTypeId,
            sharedMockData.unsupportedQueryParam,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.singleSoftStatusTypeResponse);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atSoftStatusTypeId,
            undefined);
        if (response) {
            expect(response).toEqual(mockData.singleSoftStatusTypeResponse.recordset[0]);
        }
    });

    test('getting data from another company', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.singleSoftStatusTypeResponseWrongCompany);
            return result;
        });

        await softStatusTypesService.getSoftStatusTypesById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atSoftStatusTypeId,
            undefined)
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error).toHaveProperty('moreInfo');
                expect(error.moreInfo).toBe('this record does not belong to this company')
            });
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponseEmpty);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atSoftStatusTypeId,
            undefined);

        expect(response).toEqual(undefined);
    });

});

describe('getSoftStatusTypesByCompanyAndHardStatusType', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return softStatusTypesService.getSoftStatusTypesByCompanyAndHardStatusType(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atHardStatusTypeId,
            sharedMockData.unsupportedQueryParam,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponse);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByCompanyAndHardStatusType(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atHardStatusTypeId,
            undefined);
        if (response) {
            expect(response).toEqual(mockData.softStatusTypeResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponseEmpty);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByCompanyAndHardStatusType(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atHardStatusTypeId,
            undefined);

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });

});

describe('getSoftStatusTypesByHardStatusType', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return softStatusTypesService.getSoftStatusTypesByHardStatusType(
            sharedMockData.tenantId, 
            mockData.atHardStatusTypeId,
            sharedMockData.unsupportedQueryParam,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponse);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByHardStatusType(
            sharedMockData.tenantId, 
            mockData.atHardStatusTypeId,
            undefined);
        if (response) {
            expect(response).toEqual(mockData.softStatusTypeResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.softStatusTypeResponseEmpty);
            return result;
        });

        const response = await softStatusTypesService.getSoftStatusTypesByHardStatusType(
            sharedMockData.tenantId, 
            mockData.atHardStatusTypeId,
            undefined);

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });

});

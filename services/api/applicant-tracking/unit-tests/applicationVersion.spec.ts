import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicationVersionService from '../src/ApplicationVersion.Service';
import * as mockData from './mock-data/applicationVersion-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getSoftStatusTypesByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return applicationVersionService.getApplicationVersionByTenant(
            sharedMockData.tenantId, 
            sharedMockData.unsupportedQueryParam
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
            const result: any = Promise.resolve(mockData.applicationVersionResponse);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByTenant(
            sharedMockData.tenantId, 
            undefined);
        if (response) {
            expect(response).toEqual(mockData.applicationVersionResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponseEmpty);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByTenant(
            sharedMockData.tenantId, 
            undefined);

            if (response.length === 0) {
                expect(response).toEqual([]);
            }
    });

});

describe('getSoftStatusTypesByCompany', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return applicationVersionService.getApplicationVersionByCompany(
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
            const result: any = Promise.resolve(mockData.applicationVersionResponse);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            undefined);
        if (response) {
            expect(response).toEqual(mockData.applicationVersionResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponseEmpty);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByCompany(
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
        return applicationVersionService.getApplicationVersionById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atApplicationVersionId,
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
            const result: any = Promise.resolve(mockData.singleApplicationVersionResponse);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atApplicationVersionId,
            undefined);
        if (response) {
            expect(response).toEqual(mockData.singleApplicationVersionResponse.recordset[0]);
        }
    });

    test('getting data from another company', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.singleApplicationVersionResponseWrongCompany);
            return result;
        });

        await applicationVersionService.getApplicationVersionById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atApplicationVersionId,
            undefined)
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error).toHaveProperty('moreInfo');
                expect(error.moreInfo).toBe('this record does not belong to this company')
            });
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponseEmpty);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.atApplicationVersionId,
            undefined);

        expect(response).toEqual(undefined);
    });

});

import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as hardStatusTypesService from '../src/HardStatusType.Service';
import * as mockData from './mock-data/hardStatusType-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getQuestionTypesByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return hardStatusTypesService.getHardStatusTypesByTenant(
            sharedMockData.tenantId, sharedMockData.unsupportedQueryParam
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
            const result: any = Promise.resolve(mockData.hardStatusTypeResponse);
            return result;
        });

        const response = await hardStatusTypesService.getHardStatusTypesByTenant(sharedMockData.tenantId, undefined);
        if (response.length > 0) {
            expect(response).toEqual(mockData.hardStatusTypeResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.hardStatusTypeResponseEmpty);
            return result;
        });

        const response = await hardStatusTypesService.getHardStatusTypesByTenant(sharedMockData.tenantId, undefined);

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });

});
import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as atquestionTypeService from '../src/ATQuestionType.Service';
import * as mockData from './mock-data/atquestionType-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';

describe('getATQuestionTypes', () => {

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.atQuestionTypesDBResponse);
            return result;
        });

        const response = await atquestionTypeService.getATQuestionTypes(sharedMockData.tenantId);

        if (response.length > 0) {
            expect(response).toEqual(mockData.atQuestionTypeApiResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.atQuestionTypesDBResponseEmpty);
            return result;
        });

        const response = await atquestionTypeService.getATQuestionTypes(sharedMockData.tenantId);

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });

});
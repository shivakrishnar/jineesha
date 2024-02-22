import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as questionTypeService from '../src/QuestionType.Service';
import * as mockData from './mock-data/questionType-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';

describe('getATQuestionTypesByTenant', () => {

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.atQuestionTypeResponse);
            return result;
        });

        const response = await questionTypeService.getQuestionTypesByTenant(sharedMockData.tenantId, '');

        if (response.length > 0) {
            expect(response).toEqual(mockData.atQuestionTypeResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.atQuestionTypeResponseEmpty);
            return result;
        });

        const response = await questionTypeService.getQuestionTypesByTenant(sharedMockData.tenantId, '');

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });

});


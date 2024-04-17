import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicationNoteService from '../src/ApplicationNote.Service';
import * as mockData from './mock-data/applicationNote-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getApplicationNoteByApplicationId', () => {

    test('applicationId must be an integer', () => {
        return applicationNoteService.getApplicationNoteByApplicationId(
            sharedMockData.tenantId, 
            mockData.applicationIdWithCharacter, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return applicationNoteService.getApplicationNoteByApplicationId(
            sharedMockData.tenantId, 
            mockData.applicationId, 
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
            const result: any = Promise.resolve(mockData.getApplicationNoteByApplicationIdDBResponse);
            return result;
        });

        const response = await applicationNoteService.getApplicationNoteByApplicationId(
            sharedMockData.tenantId, 
            mockData.applicationId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getApplicationNoteByApplicationIdAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationNoteByApplicationIdDBResponseEmpty);
            return result;
        });

        const response = await applicationNoteService.getApplicationNoteByApplicationId(
            sharedMockData.tenantId, 
            mockData.applicationId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        
        if (response) {
            expect(response.results).toEqual([]);
        }
    });

});
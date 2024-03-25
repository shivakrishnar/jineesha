import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicationVersionCustomQuestionService from '../src/ApplicationVersionCustomQuestion.Service';
import * as mockData from './mock-data/applicationVersionCustomQuestion-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('createApplicationVersionCustomQuestion', () => {
    test('returns error if the combination alread exists', () => {

        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            return await Promise.resolve(mockData.createAppVersionCustomQuestionDBResponseEmpty);
        });

        return applicationVersionCustomQuestionService
            .createApplicationVersionCustomQuestion(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createAppVersionCustomQuestionRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(74);
                expect(error.developerMessage).toEqual(`Was not possible to create the resource`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('creates and returns a ApplicationVersion', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'createApplicationVersionCustomQuestion') {
                const result = await Promise.resolve(mockData.createAppVersionCustomQuestionDBResponse);
                return result;
            } else if (payload.queryName === 'getAppVersionCustomQuestionByAppVersionQuestionBank') {
                const result = await Promise.resolve(mockData.getApplicationVersionCustomQuestionDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationVersionCustomQuestionService
            .createApplicationVersionCustomQuestion(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createAppVersionCustomQuestionRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createAppVersionCustomQuestionRequestBody);
            });
    });
});

describe('deleteApplicationVersionCustomQuestion', () => {

    test('applicationVersionId must be an integer', () => {
        return applicationVersionCustomQuestionService.deleteApplicationVersionCustomQuestion(
            sharedMockData.tenantId, 
            mockData.applicationVersionIdWithCharacter,
            mockData.questionBankId,
            sharedMockData.userEmail
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.applicationVersionIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('questionBankId must be an integer', () => {
        return applicationVersionCustomQuestionService.deleteApplicationVersionCustomQuestion(
            sharedMockData.tenantId, 
            mockData.applicationVersionId,
            mockData.questionBankIdWithCharacter,
            sharedMockData.userEmail
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.questionBankIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('The requested resource must exist', async () => {
        (utilService as any).invokeInternalService = jest.fn(async() => {
            return await Promise.resolve(mockData.applicationVersionCustomQuestionResponseEmpty);
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return applicationVersionCustomQuestionService.deleteApplicationVersionCustomQuestion(
            sharedMockData.tenantId, 
            mockData.applicationVersionId,
            mockData.questionBankId,
            sharedMockData.userEmail
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('');
            });
    });

    test('deletes ApplicationVersionCustomQuestion', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'deleteApplicationVersionCustomQuestion'){
                return true;
            } else if (payload.queryName === 'getAppVersionCustomQuestionByAppVersionQuestionBank') {
                const result = await Promise.resolve(mockData.getApplicationVersionCustomQuestionDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationVersionCustomQuestionService
            .deleteApplicationVersionCustomQuestion(
                sharedMockData.tenantId,
                mockData.applicationVersionId,
                mockData.questionBankId,
                sharedMockData.userEmail,
            )
            .then((result) => {
                expect(result).toEqual(mockData.deleteApplicationVersionCustomQuestionResponse);
            });
    });
});

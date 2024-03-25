import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as QuestionBankMultipleChoiceAnswersService from '../src/QuestionBankMultipleChoiceAnswers.Service';
import * as mockData from './mock-data/questionBankMultipleChoiceAnswers-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getQuestionBankMultipleChoiceAnswersByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByTenant(
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
            const result: any = Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByTenantDBResponse);
            return result;
        });

        const response = await QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getQuestionBankMultipleChoiceAnswersByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByTenantDBResponseEmpty);
            return result;
        });

        const response = await QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response.results).toEqual([]);
        }
    });

});

describe('getQuestionBankMultipleChoiceAnswersByCompany', () => {

    test('companyId must be an integer', () => {
        return QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter, 
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
        return QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
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
            const result: any = Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByCompanyDBResponse);
            return result;
        });

        const response = await QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getQuestionBankMultipleChoiceAnswersByCompanyAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByCompanyDBResponseEmpty);
            return result;
        });

        const response = await QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response.results).toEqual([]);
        }
    });

});

describe('getQuestionBankMultipleChoiceAnswersById', () => {

    test('companyId must be an integer', () => {
        return QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersById(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            mockData.QuestionBankMultipleChoiceAnswersToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('id must be an integer', () => {
        return QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.QuestionBankMultipleChoiceAnswersToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.QuestionBankMultipleChoiceAnswersToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return QuestionBankMultipleChoiceAnswersService.getQuestionBankMultipleChoiceAnswersById(
            sharedMockData.tenantId, 
            sharedMockData.anotherCompanyId,
            mockData.QuestionBankMultipleChoiceAnswersToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('returns a QuestionBankMultipleChoiceAnswers', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await QuestionBankMultipleChoiceAnswersService
            .getQuestionBankMultipleChoiceAnswersById(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                mockData.QuestionBankMultipleChoiceAnswersToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getQuestionBankMultipleChoiceAnswersByIdAPIResponse);
            });
    });
});

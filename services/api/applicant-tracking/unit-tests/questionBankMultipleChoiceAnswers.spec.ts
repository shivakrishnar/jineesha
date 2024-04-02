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

describe('createQuestionBankMultipleChoiceAnswers', () => {

    test('companyId must be an integer', () => {
        return QuestionBankMultipleChoiceAnswersService.createQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.createQuestionBankMultipleChoiceAnswersRequestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the request body companyId', () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankById') {
                const result = await Promise.resolve(mockData.getQuestionBankByIdDBResponseFromAnotherCompany);
                return result;
            } else {
                return {};
            }
        });

        const requestBody = { ...mockData.createQuestionBankMultipleChoiceAnswersRequestBody };
        requestBody.atQuestionBankId = mockData.QuestionBankMultipleChoiceAnswersToPostWithWrongQuestionBankId;
        return QuestionBankMultipleChoiceAnswersService.createQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            requestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('creates and returns a QuestionBankMultipleChoiceAnswers', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createQuestionBankMultipleChoiceAnswers'){
                const result = await Promise.resolve(mockData.createQuestionBankMultipleChoiceAnswersDBResponse);
                return result;
            } else if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponse);
                return result;
            } else if (payload.queryName === 'getQuestionBankById') {
                const result = await Promise.resolve(mockData.getQuestionBankByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await QuestionBankMultipleChoiceAnswersService
            .createQuestionBankMultipleChoiceAnswers(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.createQuestionBankMultipleChoiceAnswersRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createQuestionBankMultipleChoiceAnswersAPIResponse);
            });
    });
});

describe('updateQuestionBankMultipleChoiceAnswers', () => {

    test('companyId must be an integer', () => {
        return QuestionBankMultipleChoiceAnswersService.updateQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.updateQuestionBankMultipleChoiceAnswersRequestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the request body companyId', () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankById') {
                const result = await Promise.resolve(mockData.getQuestionBankByIdDBResponseFromAnotherCompany);
                return result;
            } else {
                return {};
            }
        });

        const requestBody = { ...mockData.updateQuestionBankMultipleChoiceAnswersRequestBody };
        requestBody.atQuestionBankId = mockData.QuestionBankMultipleChoiceAnswersToPostWithWrongQuestionBankId;
        return QuestionBankMultipleChoiceAnswersService.updateQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            requestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('updates and returns a QuestionBankMultipleChoiceAnswers', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'updateQuestionBankMultipleChoiceAnswers'){
                return true;
            } else if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponse);
                return result;
            } else if (payload.queryName === 'getQuestionBankById') {
                const result = await Promise.resolve(mockData.getQuestionBankByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await QuestionBankMultipleChoiceAnswersService
            .updateQuestionBankMultipleChoiceAnswers(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.updateQuestionBankMultipleChoiceAnswersRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateQuestionBankMultipleChoiceAnswersAPIResponse);
            });
    });
});

describe('deleteQuestionBankMultipleChoiceAnswers', () => {

    test('companyId must be an integer', () => {
        return QuestionBankMultipleChoiceAnswersService.deleteQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.QuestionBankMultipleChoiceAnswersToDeleteId,
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
        return QuestionBankMultipleChoiceAnswersService.deleteQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            mockData.QuestionBankMultipleChoiceAnswersToDeleteIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.QuestionBankMultipleChoiceAnswersToDeleteIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('The requested resource must exist', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponseEmpty);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return QuestionBankMultipleChoiceAnswersService.deleteQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            mockData.QuestionBankMultipleChoiceAnswersToDeleteId,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponseFromAnotherCompany);
                return result;
            } else {
                return {};
            }
        });

        return QuestionBankMultipleChoiceAnswersService.deleteQuestionBankMultipleChoiceAnswers(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            mockData.QuestionBankMultipleChoiceAnswersToDeleteId,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('deletes QuestionBankMultipleChoiceAnswers', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'deleteQuestionBankMultipleChoiceAnswers'){
                return true;
            } else if (payload.queryName === 'getQuestionBankMultipleChoiceAnswersById') {
                const result = await Promise.resolve(mockData.getQuestionBankMultipleChoiceAnswersByIdDBResponse);
                result.recordset[0].companyId = 3;
                result.recordset[0].companyName = 'Artsy Tartsy Bakery';
                result.recordset[0].questionTitle = 'Question 6';
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await QuestionBankMultipleChoiceAnswersService
            .deleteQuestionBankMultipleChoiceAnswers(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.QuestionBankMultipleChoiceAnswersToDeleteId,
            )
            .then((result) => {
                expect(result).toEqual(mockData.deleteQuestionBankMultipleChoiceAnswersAPIResponse);
            });
    });
});

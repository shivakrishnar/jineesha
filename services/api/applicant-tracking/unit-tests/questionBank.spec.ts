import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as questionBankService from '../src/QuestionBank.Service';
import * as mockData from './mock-data/questionBank-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getQuestionBanksByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return questionBankService.getQuestionBanksByTenant(
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
            const result: any = Promise.resolve(mockData.getQuestionBanksByTenantDBResponse);
            return result;
        });

        const response = await questionBankService.getQuestionBanksByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getQuestionBanksByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getQuestionBanksByTenantDBResponseEmpty);
            return result;
        });

        const response = await questionBankService.getQuestionBanksByTenant(
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

describe('getQuestionBanksByCompany', () => {

    test('companyId must be an integer', () => {
        return questionBankService.getQuestionBanksByCompany(
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
        return questionBankService.getQuestionBanksByCompany(
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
            const result: any = Promise.resolve(mockData.getQuestionBanksByCompanyDBResponse);
            return result;
        });

        const response = await questionBankService.getQuestionBanksByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getQuestionBanksByCompanyAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getQuestionBanksByCompanyDBResponseEmpty);
            return result;
        });

        const response = await questionBankService.getQuestionBanksByCompany(
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

describe('createQuestionBank', () => {

    test('companyId must be an integer', () => {
        return questionBankService.createQuestionBank(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.createQuestionBankRequestBody,
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
        const requestBody = { ...mockData.createQuestionBankRequestBody };
        requestBody.companyId = Number(sharedMockData.anotherCompanyId);
        return questionBankService.createQuestionBank(
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

    test('creates and returns a QuestionBank', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createQuestionBank'){
                const result = await Promise.resolve(mockData.createQuestionBankDBResponse);
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

        return await questionBankService
            .createQuestionBank(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.createQuestionBankRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createQuestionBankAPIResponse);
            });
    });
});

describe('updateQuestionBank', () => {

    test('companyId must be an integer', () => {
        return questionBankService.updateQuestionBank(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.updateQuestionBankRequestBody,
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
        const requestBody = { ...mockData.updateQuestionBankRequestBody };
        requestBody.companyId = Number(sharedMockData.anotherCompanyId);
        return questionBankService.updateQuestionBank(
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

    test('updates QuestionBank', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'updateQuestionBank'){
                return true;
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

        return await questionBankService
            .updateQuestionBank(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.updateQuestionBankRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateQuestionBankAPIResponse);
            });
    });
});

describe('deleteQuestionBank', () => {

    test('companyId must be an integer', () => {
        return questionBankService.deleteQuestionBank(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.questionBankToDeleteId,
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
        return questionBankService.deleteQuestionBank(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.questionBankToDeleteIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('The requested resource must exist', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankById') {
                const result = await Promise.resolve(mockData.getQuestionBankByIdDBResponseEmpty);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return questionBankService.deleteQuestionBank(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            mockData.questionBankToDeleteId,
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
            if (payload.queryName === 'getQuestionBankById') {
                const result = await Promise.resolve(mockData.getQuestionBankByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return questionBankService.deleteQuestionBank(
            sharedMockData.tenantId, 
            sharedMockData.anotherCompanyId,
            sharedMockData.userEmail,
            mockData.questionBankToDeleteId,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('deletes QuestionBank', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'deleteQuestionBank'){
                return true;
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

        return await questionBankService
            .deleteQuestionBank(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.questionBankToDeleteId,
            )
            .then((result) => {
                expect(result).toEqual(mockData.deleteQuestionBankAPIResponse);
            });
    });
});

import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as ApplicationQuestionBankAnswerService from '../src/ApplicationQuestionBankAnswer.Service';
import * as mockData from './mock-data/applicationQuestionBankAnswer-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';


describe('getApplicationQuestionBankAnswerById', () => {

    test('companyId must be an integer', () => {
        return ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerById(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            mockData.ApplicationQuestionBankAnswerToGetById,
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
        return ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.ApplicationQuestionBankAnswerToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.ApplicationQuestionBankAnswerToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationQuestionBankAnswerById') {
                const result = await Promise.resolve(mockData.getApplicationQuestionBankAnswerByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerById(
            sharedMockData.tenantId, 
            sharedMockData.anotherCompanyId,
            mockData.ApplicationQuestionBankAnswerToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('returns a ApplicationQuestionBankAnswer', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationQuestionBankAnswerById') {
                const result = await Promise.resolve(mockData.getApplicationQuestionBankAnswerByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await ApplicationQuestionBankAnswerService
            .getApplicationQuestionBankAnswerById(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                mockData.ApplicationQuestionBankAnswerToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getApplicationQuestionBankAnswerByIdAPIResponse);
            });
    });
});

describe('getApplicationQuestionBankAnswerByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByTenant(
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
            const result: any = Promise.resolve(mockData.getApplicationQuestionBankAnswerByTenantDBResponse);
            return result;
        });

        const response = await ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getApplicationQuestionBankAnswerByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationQuestionBankAnswerByTenantDBResponseEmpty);
            return result;
        });

        const response = await ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByTenant(
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

describe('getApplicationQuestionBankAnswerByCompany', () => {

    test('companyId must be an integer', () => {
        return ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByCompany(
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
        return ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByCompany(
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
            const result: any = Promise.resolve(mockData.getApplicationQuestionBankAnswerByCompanyDBResponse);
            return result;
        });

        const response = await ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getApplicationQuestionBankAnswerByCompanyAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getApplicationQuestionBankAnswerByCompanyDBResponseEmpty);
            return result;
        });

        const response = await ApplicationQuestionBankAnswerService.getApplicationQuestionBankAnswerByCompany(
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

describe('createApplicationQuestionBankAnswer', () => {

    test('companyId must be an integer', () => {
        return ApplicationQuestionBankAnswerService.createApplicationQuestionBankAnswer(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.createApplicationQuestionBankAnswerRequestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('answerDate must be valid', () => {
        const requestBody = { ...mockData.createApplicationQuestionBankAnswerRequestBody };
        requestBody.answerDate = new Date('2024-14-08');
        return ApplicationQuestionBankAnswerService.createApplicationQuestionBankAnswer(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            requestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${requestBody.answerDate} is not a valid date`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('creates and returns a ApplicationQuestionBankAnswer', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createApplicationQuestionBankAnswer'){
                const result = await Promise.resolve(mockData.createApplicationQuestionBankAnswerDBResponse);
                return result;
            } else if (payload.queryName === 'getApplicationQuestionBankAnswerById') {
                const result = await Promise.resolve(mockData.getApplicationQuestionBankAnswerByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await ApplicationQuestionBankAnswerService
            .createApplicationQuestionBankAnswer(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.createApplicationQuestionBankAnswerRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createApplicationQuestionBankAnswerAPIResponse);
            });
    });
});

describe('updateApplicationQuestionBankAnswer', () => {

    test('companyId must be an integer', () => {
        return ApplicationQuestionBankAnswerService.updateApplicationQuestionBankAnswer(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            sharedMockData.userEmail,
            mockData.updateApplicationQuestionBankAnswerRequestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('answerDate must be valid', () => {
        const requestBody = { ...mockData.updateApplicationQuestionBankAnswerRequestBody };
        requestBody.answerDate = new Date('2024-14-08');
        return ApplicationQuestionBankAnswerService.updateApplicationQuestionBankAnswer(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            requestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${requestBody.answerDate} is not a valid date`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('The requested resource must exist', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationQuestionBankAnswerById') {
                const result = await Promise.resolve(mockData.getApplicationQuestionBankAnswerByIdDBResponseEmpty);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return ApplicationQuestionBankAnswerService.updateApplicationQuestionBankAnswer(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            sharedMockData.userEmail,
            mockData.updateApplicationQuestionBankAnswerRequestBody,
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
            if (payload.queryName === 'getApplicationQuestionBankAnswerById') {
                const result = await Promise.resolve(mockData.getApplicationQuestionBankAnswerByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return ApplicationQuestionBankAnswerService.updateApplicationQuestionBankAnswer(
            sharedMockData.tenantId, 
            sharedMockData.anotherCompanyId,
            sharedMockData.userEmail,
            mockData.updateApplicationQuestionBankAnswerRequestBody,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('updates ApplicationQuestionBankAnswer', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'updateApplicationQuestionBankAnswer'){
                return true;
            } else if (payload.queryName === 'getApplicationQuestionBankAnswerById') {
                const result = await Promise.resolve(mockData.getApplicationQuestionBankAnswerByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await ApplicationQuestionBankAnswerService
            .updateApplicationQuestionBankAnswer(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.updateApplicationQuestionBankAnswerRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateApplicationQuestionBankAnswerAPIResponse);
            });
    });
});

import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as questionBankGroupService from '../src/QuestionBankGroup.Service';
import * as mockData from './mock-data/questionBankGroup-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';


describe('getQuestionBankGroupByTenant', () => {

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return questionBankGroupService.getQuestionBankGroupByTenant(
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
            const result: any = Promise.resolve(mockData.getQuestionBankGroupByTenantDBResponse);
            return result;
        });

        const response = await questionBankGroupService.getQuestionBankGroupByTenant(
            sharedMockData.tenantId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getQuestionBankGroupByTenantAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getQuestionBankGroupByTenantDBResponseEmpty);
            return result;
        });

        const response = await questionBankGroupService.getQuestionBankGroupByTenant(
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

describe('getQuestionBankGroupByCompany', () => {

    test('companyId must be an integer', () => {
        return questionBankGroupService.getQuestionBankGroupByCompany(
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
        return questionBankGroupService.getQuestionBankGroupByCompany(
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
            const result: any = Promise.resolve(mockData.getQuestionBankGroupByCompanyDBResponse);
            return result;
        });

        const response = await questionBankGroupService.getQuestionBankGroupByCompany(
            sharedMockData.tenantId, 
            sharedMockData.companyId, 
            sharedMockData.undefinedValue, 
            sharedMockData.domainName, 
            sharedMockData.path
        );
        if (response) {
            expect(response).toBeInstanceOf(PaginatedResult);
            expect(response.results).toEqual(mockData.getQuestionBankGroupByCompanyAPIResponse);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.getQuestionBankGroupByCompanyDBResponseEmpty);
            return result;
        });

        const response = await questionBankGroupService.getQuestionBankGroupByCompany(
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

describe('getQuestionBankGroupById', () => {

    test('companyId must be an integer', () => {
        return questionBankGroupService.getQuestionBankGroupById(
            sharedMockData.tenantId, 
            sharedMockData.companyIdWithCharacter,
            mockData.QuestionBankGroupToGetById,
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
        return questionBankGroupService.getQuestionBankGroupById(
            sharedMockData.tenantId, 
            sharedMockData.companyId,
            mockData.QuestionBankGroupToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.QuestionBankGroupToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankGroupById') {
                const result = await Promise.resolve(mockData.getQuestionBankGroupByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return questionBankGroupService.getQuestionBankGroupById(
            sharedMockData.tenantId, 
            sharedMockData.anotherCompanyId,
            mockData.QuestionBankGroupToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('returns a QuestionBankGroup', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getQuestionBankGroupById') {
                const result = await Promise.resolve(mockData.getQuestionBankGroupByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await questionBankGroupService
            .getQuestionBankGroupById(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                mockData.QuestionBankGroupToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getQuestionBankGroupByIdAPIResponse);
            });
    });
});

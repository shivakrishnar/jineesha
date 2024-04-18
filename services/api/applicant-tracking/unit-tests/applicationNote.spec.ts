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

describe('getApplicationNoteById', () => {

    test('id must be an integer', () => {
        return applicationNoteService.getApplicationNoteById(
            sharedMockData.tenantId, 
            mockData.applicationNoteToGetByIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.applicationNoteToGetByIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationNoteById') {
                const result = await Promise.resolve(mockData.getApplicationNoteByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return applicationNoteService.getApplicationNoteById(
            sharedMockData.tenantId, 
            mockData.applicationNoteToGetById,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('returns an ApplicationNote', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationNoteById') {
                const result = await Promise.resolve(mockData.getApplicationNoteByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        return await applicationNoteService
            .getApplicationNoteById(
                sharedMockData.tenantId,
                mockData.applicationNoteToGetById,
            )
            .then((result) => {
                expect(result).toEqual(mockData.getApplicationNoteByIdAPIResponse);
            });
    });
});

describe('createApplicationNote', () => {

    test('creates and returns a ApplicationNote', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'createApplicationNote'){
                const result = await Promise.resolve(mockData.createApplicationNoteDBResponse);
                return result;
            } else if (payload.queryName === 'getApplicationNoteById') {
                const result = await Promise.resolve(mockData.getApplicationNoteByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationNoteService
            .createApplicationNote(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createApplicationNoteRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createApplicationNoteAPIResponse);
            });
    });
});

describe('updateApplicationNote', () => {

    test('updates ApplicationNote', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'updateApplicationNote'){
                return true;
            } else if (payload.queryName === 'getApplicationNoteById') {
                return await Promise.resolve(mockData.getApplicationNoteByIdDBResponse);
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationNoteService
            .updateApplicationNote(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.updateApplicationNoteRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateApplicationNoteAPIResponse);
            });
    });
});

describe('deleteApplicationNote', () => {

    test('id must be an integer', () => {
        return applicationNoteService.deleteApplicationNote(
            sharedMockData.tenantId, 
            sharedMockData.userEmail,
            mockData.applicationNoteToDeleteIdWithCharacter,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.applicationNoteToDeleteIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('The requested resource must exist', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'getApplicationNoteById') {
                const result = await Promise.resolve(mockData.getApplicationNoteByIdDBResponseEmpty);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return applicationNoteService.deleteApplicationNote(
            sharedMockData.tenantId, 
            sharedMockData.userEmail,
            mockData.applicationNoteToDeleteId,
            ).catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('');
            });
    });

    test('deletes ApplicationNote', async () => {
        (utilService as any).invokeInternalService = jest.fn(async(transaction, payload) => {
            if (payload.queryName === 'deleteApplicationNote'){
                return true;
            } else if (payload.queryName === 'getApplicationNoteById') {
                const result = await Promise.resolve(mockData.getApplicationNoteByIdDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationNoteService
            .deleteApplicationNote(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.applicationNoteToDeleteId,
            )
            .then((result) => {
                expect(result).toEqual(mockData.deleteApplicationNoteAPIResponse);
            });
    });
});

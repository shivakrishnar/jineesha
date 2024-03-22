import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicationVersionService from '../src/ApplicationVersion.Service';
import * as mockData from './mock-data/applicationVersion-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('getApplicationVersionByTenant', () => {
    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return applicationVersionService
            .getApplicationVersionByTenant(sharedMockData.tenantId, sharedMockData.unsupportedQueryParam)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponse);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByTenant(sharedMockData.tenantId, undefined);
        if (response) {
            expect(response).toEqual(mockData.applicationVersionResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponseEmpty);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByTenant(sharedMockData.tenantId, undefined);

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });
});

describe('getApplicationVersionByCompany', () => {
    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return applicationVersionService
            .getApplicationVersionByCompany(sharedMockData.tenantId, sharedMockData.companyId, sharedMockData.unsupportedQueryParam)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting all data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponse);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByCompany(
            sharedMockData.tenantId,
            sharedMockData.companyId,
            undefined,
        );
        if (response) {
            expect(response).toEqual(mockData.applicationVersionResponse.recordset);
        }
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponseEmpty);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionByCompany(
            sharedMockData.tenantId,
            sharedMockData.companyId,
            undefined,
        );

        if (response.length === 0) {
            expect(response).toEqual([]);
        }
    });
});

describe('getApplicationVersionById', () => {
    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return applicationVersionService
            .getApplicationVersionById(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                mockData.atApplicationVersionId,
                sharedMockData.unsupportedQueryParam,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('getting data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.singleApplicationVersionResponse);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionById(
            sharedMockData.tenantId,
            sharedMockData.companyId,
            mockData.atApplicationVersionId,
            undefined,
        );
        if (response) {
            expect(response).toEqual(mockData.singleApplicationVersionResponse.recordset[0]);
        }
    });

    test('getting data from another company', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.singleApplicationVersionResponseWrongCompany);
            return result;
        });

        await applicationVersionService
            .getApplicationVersionById(sharedMockData.tenantId, sharedMockData.companyId, mockData.atApplicationVersionId, undefined)
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error).toHaveProperty('moreInfo');
                expect(error.moreInfo).toBe('this record does not belong to this company');
            });
    });

    test('getting empty data', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            const result: any = Promise.resolve(mockData.applicationVersionResponseEmpty);
            return result;
        });

        const response = await applicationVersionService.getApplicationVersionById(
            sharedMockData.tenantId,
            sharedMockData.companyId,
            mockData.atApplicationVersionId,
            undefined,
        );

        expect(response).toEqual(undefined);
    });
});

describe('createApplicationVersion', () => {
    test('companyId must be an integer', () => {
        return applicationVersionService
            .createApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyIdWithCharacter,
                sharedMockData.userEmail,
                mockData.createApplicationVersionRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the request body companyId', () => {
        const requestBody = { ...mockData.createApplicationVersionRequestBody };
        requestBody.companyId = 444;
        return applicationVersionService
            .createApplicationVersion(sharedMockData.tenantId, sharedMockData.companyId, sharedMockData.userEmail, requestBody)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('creates and returns a ApplicationVersion', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'createApplicationVersion') {
                const result = await Promise.resolve(mockData.createApplicationVersionDBResponse);
                return result;
            } else if (payload.queryName === 'getApplicationVersionById') {
                const result = await Promise.resolve(mockData.singleApplicationVersionResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationVersionService
            .createApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.createApplicationVersionRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createApplicationVersionAPIResponse);
            });
    });
});

describe('updateApplicationVersion', () => {
    test('companyId must be an integer', () => {
        return applicationVersionService
            .updateApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyIdWithCharacter,
                sharedMockData.userEmail,
                mockData.updateApplicationVersionRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the request body companyId', () => {
        const requestBody = { ...mockData.updateApplicationVersionRequestBody };
        requestBody.companyId = Number(sharedMockData.anotherCompanyId);
        return applicationVersionService
            .updateApplicationVersion(sharedMockData.tenantId, sharedMockData.companyId, sharedMockData.userEmail, requestBody)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('updates ApplicationVersion', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'updateApplicationVersion') {
                return true;
            } else if (payload.queryName === 'getApplicationVersionById') {
                const result = await Promise.resolve(mockData.singleApplicationVersionResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationVersionService
            .updateApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.updateApplicationVersionRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.updateApplicationVersionAPIResponse);
            });
    });
});

describe('deleteApplicationVersion', () => {
    test('companyId must be an integer', () => {
        return applicationVersionService
            .deleteApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyIdWithCharacter,
                sharedMockData.userEmail,
                mockData.applicationVersionToDeleteId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${sharedMockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('id must be an integer', () => {
        return applicationVersionService
            .deleteApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.applicationVersionToDeleteIdWithCharacter,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.applicationVersionToDeleteIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('The requested resource must exist', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getApplicationVersionById') {
                const result = await Promise.resolve(mockData.applicationVersionResponseEmpty);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return applicationVersionService
            .deleteApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.applicationVersionToDeleteId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('');
            });
    });

    test('URL companyId must be the same as the requested resource companyId', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'getApplicationVersionById') {
                const result = await Promise.resolve(mockData.singleApplicationVersionResponse);
                return result;
            } else {
                return {};
            }
        });

        return applicationVersionService
            .deleteApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.anotherCompanyId,
                sharedMockData.userEmail,
                mockData.applicationVersionToDeleteId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('');
                expect(error.moreInfo).toEqual('this record does not belong to this company');
            });
    });

    test('deletes ApplicationVersion', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'deleteApplicationVersion') {
                return true;
            } else if (payload.queryName === 'getApplicationVersionById') {
                const result = await Promise.resolve(mockData.singleApplicationVersionResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await applicationVersionService
            .deleteApplicationVersion(
                sharedMockData.tenantId,
                sharedMockData.companyId,
                sharedMockData.userEmail,
                mockData.applicationVersionToDeleteId,
            )
            .then((result) => {
                expect(result).toEqual(mockData.deleteApplicationVersionAPIResponse);
            });
    });
});

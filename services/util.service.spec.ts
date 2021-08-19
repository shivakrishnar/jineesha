import 'reflect-metadata'; // required by asure.auth dependency

import { APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import * as configService from './config.service';
import { SecurityContextProvider } from './internal-api/authentication/securityContextProvider';
import { setup } from './unit-test-mocks/mock';
import * as mockData from './unit-test-mocks/mock-data/mock-data';
import * as utilServiceMockData from './unit-test-mocks/mock-data/util-service-mock-data';
import * as utilService from './util.service';
import { ErrorMessage } from './errors/errorMessage';

jest.mock('./internal-api/authentication/securityContextProvider');

describe('utilService.gatewayEventHandlerV2', () => {
    let apiGatewayEvent: APIGatewayEvent;
    let context: Context;

    beforeEach(() => {
        apiGatewayEvent = utilServiceMockData.apiGatewayEvent;
        context = utilServiceMockData.context;
    });

    test('correctly parses a valid JSON body', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const testRequestBody = {
            testProp: 123,
        };
        apiGatewayEvent.body = JSON.stringify(testRequestBody);

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(true);
            expect(body.requestBody).toEqual(testRequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });

    test('sets requestBody to the initial JSON string when supplied with invalid JSON', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const invalidJSONRequestBody = '{ property: "Invalid" }';
        apiGatewayEvent.body = invalidJSONRequestBody;

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(false);
            expect(body.requestBody).toEqual(invalidJSONRequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });

    test('decodes and correctly parses a valid base64 encoded JSON request body', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const testRequestBody = {
            testProp: 123,
        };
        const base64RequestBody = btoa(JSON.stringify(testRequestBody));
        apiGatewayEvent.body = base64RequestBody;
        apiGatewayEvent.isBase64Encoded = true;

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(true);
            expect(body.requestBody).toEqual(testRequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });

    test('sets requestBody to the initial string when supplied with a non-JSON base64 encoded request body', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const base64RequestBody = btoa('This is not a json');
        apiGatewayEvent.body = base64RequestBody;
        apiGatewayEvent.isBase64Encoded = true;

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(false);
            expect(body.requestBody).toEqual(base64RequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });
});

describe('utilService.checkForFileExistence', () => {
    beforeEach(() => {
        setup();
    });

    test('appends a unique identifier to the file name if a file with the same name exists in S3', async () => {
        return await utilService
            .checkForFileExistence(
                utilServiceMockData.s3Key,
                utilServiceMockData.fileName,
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
            )
            .then((updatedObjectData) => {
                expect(updatedObjectData[0]).toEqual(utilServiceMockData.updatedObjectData[0]);
                expect(updatedObjectData[1]).toEqual(utilServiceMockData.updatedObjectData[1]);
            });
    });

    test('preserves the original file name if a file with the same name does not exist in S3', async () => {
        (configService as any).getFileBucketName = jest.fn(() => {
            // This will tell the aws-sdk mock to return undefined for headObject
            return undefined;
        });

        return await utilService
            .checkForFileExistence(
                utilServiceMockData.s3Key,
                utilServiceMockData.fileName,
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
            )
            .then((updatedObjectData) => {
                expect(updatedObjectData[0]).toEqual(utilServiceMockData.fileName);
                expect(updatedObjectData[1]).toEqual(utilServiceMockData.s3Key);
            });
    });
});

describe('utilService.validateEmployeeWithCompany', () => {
    beforeEach(() => {
        setup();
    });

    test('validates if company exists in tenant and employee exists in company', () => {
        (utilService as any).invokeInternalService = jest.fn((queryExecutor, payload) => {
            if (payload.queryName === 'companyExistsInTenant') return Promise.resolve(utilServiceMockData.companyExistInTenant);
            return Promise.resolve(utilServiceMockData.employeeExistsInCompany);
        });

        return utilService.validateEmployeeWithCompany(mockData.tenantId, mockData.companyId, mockData.employeeId).then((response) => {
            expect(response).toBe(undefined);
        });
    });

    test('returns 404 if company does not exist in tenant', () => {
        (utilService as any).invokeInternalService = jest.fn((queryExecutor, payload) => {
            if (payload.queryName === 'companyExistsInTenant') return Promise.resolve(utilServiceMockData.companyDoesNotExistInTenant);
            return Promise.resolve(utilServiceMockData.employeeDoesNotExistsInCompany);
        });

        return utilService.validateEmployeeWithCompany(mockData.tenantId, mockData.companyId, mockData.employeeId).catch((error) => {
            expect(error).toEqual({
                code: 50,
                developerMessage: `Company with ID ${mockData.companyId} not found.`,
                message: 'The requested resource does not exist.',
                moreInfo: '',
                statusCode: 404,
            });
        });
    });

    test('returns 404 if employee does not exist in company', () => {
        (utilService as any).invokeInternalService = jest.fn((queryExecutor, payload) => {
            if (payload.queryName === 'companyExistsInTenant') return Promise.resolve(utilServiceMockData.companyExistInTenant);
            return Promise.resolve(utilServiceMockData.employeeDoesNotExistsInCompany);
        });

        return utilService.validateEmployeeWithCompany(mockData.tenantId, mockData.companyId, mockData.employeeId).catch((error) => {
            expect(error).toEqual({
                code: 50,
                developerMessage: `Employee with ID ${mockData.employeeId} was not found in the Company with ID ${mockData.companyId}.`,
                message: 'The requested resource does not exist.',
                moreInfo: '',
                statusCode: 404,
            });
        });
    });

    test('throws error if company or employee id is invalid', async () => {
        const invalidCompanyIdError = {
            statusCode: 400,
            code: 30,
            message: 'The provided request object was not valid for the requested operation.',
            developerMessage: `${mockData.invalidCompanyId} is not a valid companyId`,
            moreInfo: '',
        };

        const invalidEmployeeIdError = {
            statusCode: 400,
            code: 30,
            message: 'The provided request object was not valid for the requested operation.',
            developerMessage: `${mockData.invalidEmployeeId} is not a valid employeeId`,
            moreInfo: '',
        };

        await utilService.validateEmployeeWithCompany(mockData.tenantId, mockData.invalidCompanyId, mockData.employeeId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error).toEqual(invalidCompanyIdError);
        });

        await utilService.validateEmployeeWithCompany(mockData.tenantId, mockData.companyId, mockData.invalidEmployeeId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error).toEqual(invalidEmployeeIdError);
        });
    });
});

describe('utilService.parseQueryParamsBoolean', () => {
    beforeEach(() => {
        setup();
    });

    test('key should not exist in queryParams', () => {
        try {
            utilService.parseQueryParamsBoolean({ key: 'true' }, 'invalidKey');
        } catch (error) {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.message).toEqual(`Key 'invalidKey' does not exist in queryParams`);
        }
    });

    test('should return boolean', () => {
        const parsedTrueQueryParamsBoolean = utilService.parseQueryParamsBoolean({ key: 'true' }, 'key');
        expect(parsedTrueQueryParamsBoolean).toBe(true);

        const parsedFalseQueryParamsBoolean = utilService.parseQueryParamsBoolean({ key: 'false' }, 'key');
        expect(parsedFalseQueryParamsBoolean).toBe(false);
    });

    test('should be invalid', () => {
        try {
            utilService.parseQueryParamsBoolean({ key: 'abc' }, 'key');
        } catch (error) {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error).toEqual({
                statusCode: 400,
                code: 60,
                message: 'Invalid url parameter value',
                developerMessage: "'abc' is not a boolean value.",
                moreInfo: '',
            });
        }
    });
});

describe('utilService.validateQueryParams', () => {
    beforeEach(() => {
        setup();
    });

    test('should show the invalid queryParameters', () => {
        try {
            utilService.validateQueryParams({ key1: 'key1', key2: 'key2', key3: 'key3' }, ['key1', 'key3']);
        } catch (error) {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error).toEqual({
                statusCode: 400,
                code: 60,
                message: 'Invalid url parameter value',
                developerMessage: "'key2' is not a valid query parameter.",
                moreInfo: '',
            });
        }

        try {
            utilService.validateQueryParams({ key1: 'key1', key2: 'key2', key3: 'key3', key4: 'key4' }, ['key1', 'key3']);
        } catch (error) {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error).toEqual({
                statusCode: 400,
                code: 60,
                message: 'Invalid url parameter value',
                developerMessage: "'key2','key4' are not valid query parameters.",
                moreInfo: '',
            });
        }
    });
});

describe('utilService.validateUserIsInCompany', () => {
    beforeEach(() => {
        setup();
    });

    test('validates if companyId is invalid', async () => {
        const invalidCompanyIdError = {
            statusCode: 400,
            code: 30,
            message: 'The provided request object was not valid for the requested operation.',
            developerMessage: `${mockData.invalidCompanyId} is not a valid companyId`,
            moreInfo: '',
        };

        await utilService.validateUserIsInCompany(mockData.tenantId, mockData.username, mockData.invalidCompanyId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error).toEqual(invalidCompanyIdError);
        });
    });

    test('returns false if user does not exist in company', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(utilServiceMockData.userDoesNotExistInCompany);
        });

        return utilService.validateUserIsInCompany(mockData.tenantId, mockData.username, mockData.companyId).then((result) => {
            expect(result).toEqual(false);
        });
    });

    test('returns true if user exists in company', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(utilServiceMockData.userExistsInCompany);
        });

        return utilService.validateUserIsInCompany(mockData.tenantId, mockData.username, mockData.companyId).then((result) => {
            expect(result).toEqual(true);
        });
    });
});

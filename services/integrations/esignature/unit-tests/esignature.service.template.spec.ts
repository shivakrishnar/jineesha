/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency

import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';
import * as fs from '../../../../__mocks__/fs';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from '../../../unit-test-mocks/mock';
import { TemplateDraftResponse } from '../src/template-draft/templateDraftResponse';

jest.mock('fs');

describe('esignatureService.template.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns templates', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.templateDBResponse);
        });

        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((templates) => {
                expect(templates).toBeInstanceOf(PaginatedResult);
                expect(templates.results.length).toBe(mockData.templateDBResponse.recordsets[1].length);
                expect(templates.results[0]).toEqual(mockData.templateListResponse[0]);
                expect(templates.results[1]).toEqual(mockData.templateListResponse[1]);
                expect(templates.results[2]).toEqual(mockData.templateListResponse[2]);
            });
    });

    test('returns consolidated templates', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.templateDBResponse);
        });

        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, mockData.consolidatedQueryParam, mockData.domainName, mockData.path)
            .then((templates) => {
                expect(templates).toBeInstanceOf(PaginatedResult);
                expect(templates.results.length).toBe(mockData.templateDBResponse.recordsets[1].length);
                expect(templates.results[0]).toEqual(mockData.templateListResponse[0]);
                expect(templates.results[1]).toEqual(mockData.templateListResponse[1]);
                expect(templates.results[2]).toEqual(mockData.templateListResponse[2]);
            });
    });

    test('returns filtered templates', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.templateDBResponse);
        });

        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, mockData.searchQueryParam, mockData.domainName, mockData.path)
            .then((templates) => {
                expect(templates).toBeInstanceOf(PaginatedResult);
                expect(templates.results.length).toBe(mockData.templateDBResponse.recordsets[1].length);
                expect(templates.results[0]).toEqual(mockData.templateListResponse[0]);
                expect(templates.results[1]).toEqual(mockData.templateListResponse[1]);
                expect(templates.results[2]).toEqual(mockData.templateListResponse[2]);
            });
    });

    test('returns undefined if no onboarding templates are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, mockData.onboardingQueryParam, mockData.domainName, mockData.path)
            .then((templates) => {
                expect(templates).toBe(undefined);
            });
    });

    test('returns onboarding templates when found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
            return Promise.resolve(mockData.templateOnboardingDBResponse);
        });

        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, mockData.onboardingQueryParam, mockData.domainName, mockData.path)
            .then((templates) => {
                expect(templates).toBeInstanceOf(PaginatedResult);
                expect(templates.results.length).toBe(mockData.templateOnboardingListResponse.length);
                expect(templates.results[0]).toEqual(mockData.templateOnboardingListResponse[0]);
            });
    });

    test('returns a 400 if both the consolidated and onboarding query params are provided', () => {
        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, mockData.queryParams, mockData.domainName, mockData.path)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(60);
                expect(error.message).toEqual('Invalid url parameter value');
                expect(error.developerMessage).toEqual('Query params may contain either consolidated=true or onboarding=true, not both');
            });
    });

    test('returns undefined if no templates are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listTemplates(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path)
            .then((templates) => {
                expect(templates).toBe(undefined);
            });
    });

    test('returns a 400 if companyId is not integral', async () => {
        return esignatureService
            .listTemplates(mockData.tenantId, 'abc123', mockData.onboardingQueryParam, mockData.domainName, mockData.path)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });
});

describe('esignatureService.template.create', () => {
    beforeEach(() => {
        setup();
        fs.__forceError(false);
    });

    test('creates and returns a template', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo' && serviceName) {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest)
            .then((templates) => {
                expect(templates).toBeInstanceOf(TemplateDraftResponse);
            });
    });

    test('returns a 500 if an error occurs while creating a temp directory', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo' && serviceName) {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        fs.__forceError('mkdir');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('returns a 500 if an error occurs while creating a file', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo' && serviceName) {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        fs.__forceError('writeFile');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('returns a 500 if an error occurs while unlinking a file', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo' && serviceName) {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        fs.__forceError('unlink');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('returns a 500 if an error occurs while removing the temp directory', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo' && serviceName) {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        fs.__forceError('rmdir');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('throws an error if one occurs', async () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw errorService.getErrorResponse(20).setDeveloperMessage('Force an error');
        });

        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(403);
                expect(error.code).toEqual(20);
                expect(error.message).toEqual('Not authorized.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });

    test('returns a 400 if companyId is not integral', async () => {
        return await esignatureService.createTemplate(mockData.tenantId, 'abc123', mockData.templatePostRequest).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(400);
            expect(error.code).toEqual(30);
            expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
            expect(error.developerMessage).toEqual('abc123 is not a valid number');
        });
    });

    test('returns a 400 if signerRoles are not strings', async () => {
        const invalidSignerRoles: any = { ...mockData.templatePostRequest };
        invalidSignerRoles.signerRoles = [{ name: 'Onboarding' }];
        return await esignatureService.createTemplate(mockData.tenantId, mockData.companyId, invalidSignerRoles).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(400);
            expect(error.code).toEqual(30);
            expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
            expect(error.developerMessage).toEqual('signerRoles must only contain strings');
        });
    });

    test('returns a 400 if ccRoles are not strings', async () => {
        const invalidCCRoles: any = { ...mockData.templatePostRequest };
        invalidCCRoles.ccRoles = [{ name: 'Onboarding' }];
        return await esignatureService.createTemplate(mockData.tenantId, mockData.companyId, invalidCCRoles).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(400);
            expect(error.code).toEqual(30);
            expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
            expect(error.developerMessage).toEqual('ccRoles must only contain strings');
        });
    });
});

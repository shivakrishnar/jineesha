import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { TemplateDraftResponse } from '../src/template-draft/templateDraftResponse';
import { setup } from './mock';

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
            .listTemplates(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path, mockData.accessToken)
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
            .listTemplates(
                mockData.tenantId,
                mockData.companyId,
                mockData.consolidatedQueryParam,
                mockData.domainName,
                mockData.path,
                mockData.accessToken,
            )
            .then((templates) => {
                expect(templates).toBeInstanceOf(PaginatedResult);
                expect(templates.results.length).toBe(mockData.templateDBResponse.recordsets[1].length);
                expect(templates.results[0]).toEqual(mockData.templateListResponse[0]);
                expect(templates.results[1]).toEqual(mockData.templateListResponse[1]);
                expect(templates.results[2]).toEqual(mockData.templateListResponse[2]);
            });
    });

    test('returns onboarding templates', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.templateDBResponse);
        });

        return esignatureService
            .listTemplates(
                mockData.tenantId,
                mockData.companyId,
                mockData.onboardingQueryParam,
                mockData.domainName,
                mockData.path,
                mockData.accessToken,
            )
            .then((templates) => {
                expect(templates).toBeInstanceOf(PaginatedResult);
                expect(templates.results.length).toBe(mockData.templateDBResponse.recordsets[1].length);
                expect(templates.results[0]).toEqual(mockData.templateListResponse[0]);
                expect(templates.results[1]).toEqual(mockData.templateListResponse[1]);
                expect(templates.results[2]).toEqual(mockData.templateListResponse[2]);
            });
    });

    test('returns a 400 if both the consolidated and onboarding query params are provided', () => {
        return esignatureService
            .listTemplates(
                mockData.tenantId,
                mockData.companyId,
                mockData.queryParams,
                mockData.domainName,
                mockData.path,
                mockData.accessToken,
            )
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
            .listTemplates(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path, mockData.accessToken)
            .then((templates) => {
                expect(templates).toBe(undefined);
            });
    });

    test('returns a 400 if companyId is not integral', async () => {
        return esignatureService
            .listTemplates(
                mockData.tenantId,
                'abc123',
                mockData.onboardingQueryParam,
                mockData.domainName,
                mockData.path,
                mockData.accessToken,
            )
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
        // tslint:disable-next-line:no-require-imports
        require('fs').__forceError(false);
    });

    test('creates and returns a template', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
            .then((templates) => {
                expect(templates).toBeInstanceOf(TemplateDraftResponse);
            });
    });

    test('returns a 500 if an error occurs while creating a temp directory', async () => {
        // tslint:disable-next-line:no-require-imports
        require('fs').__forceError('mkdir');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('returns a 500 if an error occurs while creating a file', async () => {
        // tslint:disable-next-line:no-require-imports
        require('fs').__forceError('writeFile');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
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
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        // tslint:disable-next-line:no-require-imports
        require('fs').__forceError('unlink');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
                console.log(error);
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('returns a 500 if an error occurs while removing the temp directory', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        // tslint:disable-next-line:no-require-imports
        require('fs').__forceError('rmdir');
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });

    test('throws an error if one occurs', async () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            throw errorService.getErrorResponse(20).setDeveloperMessage('Force an error');
        });

        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(403);
                expect(error.code).toEqual(20);
                expect(error.message).toEqual('Not authorized.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });

    test('returns a 400 if companyId is not integral', async () => {
        return await esignatureService
            .createTemplate(mockData.tenantId, 'abc123', mockData.templatePostRequest, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
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
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, invalidSignerRoles, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
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
        return await esignatureService
            .createTemplate(mockData.tenantId, mockData.companyId, invalidCCRoles, mockData.userEmail, mockData.accessToken)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('ccRoles must only contain strings');
            });
    });
});

import 'reflect-metadata'; // required by asure.auth dependency

import * as employeeService from '../../../api/tenants/src/employee.service';
import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from '../../../unit-test-mocks/mock';

jest.mock('shortid');

const decodedDocumentId = '101010';

describe('esignatureService.company-document.list', () => {
    beforeEach(() => {
        setup();
        // Moved this out of setup() so that tests for getById work
        (employeeService as any).getById = jest.fn(() => {
            return {};
        });
    });

    test('returns original company documents', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.originalDocsTaskListDBResponse);
        });

        return esignatureService
            .listDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.documentQueryParams,
                mockData.domainName,
                mockData.path,
                true,
                undefined,
            )
            .then((documents) => {
                expect(documents).toBeInstanceOf(PaginatedResult);
                expect(documents.results.length).toBe(mockData.companyOriginalDocumentListResponse.length);
                expect(documents.results[0]).toEqual(mockData.companyOriginalDocumentListResponse[0]);
                expect(documents.results[1]).toEqual(mockData.companyOriginalDocumentListResponse[1]);
                expect(documents.results[2]).toEqual(mockData.companyOriginalDocumentListResponse[2]);
            });
    });

    test('returns hellosign company documents', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.hellosignDocsTaskListDBResponse);
        });

        const queryParams = { ...mockData.documentQueryParams };
        queryParams.docType = 'hellosign';

        return esignatureService
            .listDocuments(mockData.tenantId, mockData.companyId, queryParams, mockData.domainName, mockData.path, true, undefined)
            .then((documents) => {
                expect(documents).toBeInstanceOf(PaginatedResult);
                expect(documents.results.length).toBe(mockData.companyHellosignDocumentListResponse.length);
                expect(documents.results[0]).toEqual(mockData.companyHellosignDocumentListResponse[0]);
                expect(documents.results[1]).toEqual(mockData.companyHellosignDocumentListResponse[1]);
                expect(documents.results[2]).toEqual(mockData.companyHellosignDocumentListResponse[2]);
            });
    });

    test('returns a 404 if company is not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return await esignatureService
            .listDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.documentQueryParams,
                mockData.domainName,
                mockData.path,
                true,
                undefined,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('The company id: 600013 not found');
            });
    });

    test('returns a 400 if no query params are provided', async () => {
        return await esignatureService
            .listDocuments(mockData.tenantId, mockData.companyId, undefined, mockData.domainName, mockData.path, true, undefined)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Query parameters expected');
            });
    });

    test('returns a 400 if unsupported query params are provided', async () => {
        return await esignatureService
            .listDocuments(mockData.tenantId, mockData.companyId, { test: 'test' }, mockData.domainName, mockData.path, true, undefined)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported or missing query parameters');
            });
    });

    test('returns a 400 if category query param is not onboarding', async () => {
        const queryParams = { ...mockData.documentQueryParams };
        queryParams.category = 'test';
        return await esignatureService
            .listDocuments(mockData.tenantId, mockData.companyId, queryParams, mockData.domainName, mockData.path, true, undefined)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported value: test');
            });
    });

    test('returns a 400 if categoryId is negative', async () => {
        const queryParams = { ...mockData.documentQueryParams };
        queryParams.categoryId = -10;
        return await esignatureService
            .listDocuments(mockData.tenantId, mockData.companyId, queryParams, mockData.domainName, mockData.path, true, undefined)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Value of categoryId: -10 is not a valid number');
            });
    });

    test('returns a 400 if docType is not supported', async () => {
        const queryParams = { ...mockData.documentQueryParams };
        queryParams.docType = 'test';
        return await esignatureService
            .listDocuments(mockData.tenantId, mockData.companyId, queryParams, mockData.domainName, mockData.path, true, undefined)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported value: test');
            });
    });
});

describe('esignatureService.employee-document.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a list of employee documents by tenant', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentsByTenant(mockData.tenantId, undefined, mockData.domainName, mockData.path, mockData.userEmail)
            .then((documents) => {
                expect(documents).toBeInstanceOf(PaginatedResult);
                expect(documents.results.length).toBe(mockData.employeeDocumentListResponse.length);
                expect(documents.results[0]).toEqual(mockData.employeeDocumentListResponse[0]);
                expect(documents.results[1]).toEqual(mockData.employeeDocumentListResponse[1]);
                expect(documents.results[2]).toEqual(mockData.employeeDocumentListResponse[2]);
            });
    });

    test('returns undefined if no employee documents exist in tenant', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentsByTenant(mockData.tenantId, undefined, mockData.domainName, mockData.path, mockData.userEmail)
            .then((documents) => {
                expect(documents).toEqual(undefined);
            });
    });

    test('returns a list of employee documents by company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentsByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((documents) => {
                expect(documents).toBeInstanceOf(PaginatedResult);
                expect(documents.results.length).toBe(mockData.employeeDocumentListResponse.length);
                expect(documents.results[0]).toEqual(mockData.employeeDocumentListResponse[0]);
                expect(documents.results[1]).toEqual(mockData.employeeDocumentListResponse[1]);
                expect(documents.results[2]).toEqual(mockData.employeeDocumentListResponse[2]);
            });
    });

    test('returns undefined if no employee documents exist in company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            console.log('empty');
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentsByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((documents) => {
                expect(documents).toEqual(undefined);
            });
    });

    test('returns a list of employee documents by company for a manager', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocumentsByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                true,
                mockData.userEmail,
            )
            .then((documents) => {
                expect(documents).toBeInstanceOf(PaginatedResult);
                expect(documents.results.length).toBe(mockData.employeeDocumentListResponse.length);
                expect(documents.results[0]).toEqual(mockData.employeeDocumentListResponse[0]);
                expect(documents.results[1]).toEqual(mockData.employeeDocumentListResponse[1]);
                expect(documents.results[2]).toEqual(mockData.employeeDocumentListResponse[2]);
            });
    });

    test('returns undefined if no employee documents exist for employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listEmployeeDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((documents) => {
                expect(documents).toEqual(undefined);
            });
    });

    test('returns a list of employee documents by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .then((documents) => {
                expect(documents).toBeInstanceOf(PaginatedResult);
                expect(documents.results.length).toBe(mockData.employeeDocumentListResponse.length);
                expect(documents.results[0]).toEqual(mockData.employeeDocumentListResponse[0]);
                expect(documents.results[1]).toEqual(mockData.employeeDocumentListResponse[1]);
                expect(documents.results[2]).toEqual(mockData.employeeDocumentListResponse[2]);
            });
    });

    test('returns a 400 if employeeId is not integral while retrieving documents by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocuments(
                mockData.tenantId,
                mockData.companyId,
                'abc123',
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('returns a 404 if employee is not found while retrieving documents by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`Employee with ID ${mockData.employeeId} not found`);
            });
    });

    test('returns a 404 if company is not found while retrieving documents by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.employeeDocumentsDBResponse);
        });

        return esignatureService
            .listEmployeeDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`The company id: ${mockData.companyId} not found`);
            });
    });

    test('throws an error if one occurs while retrieving documents by tenant', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listEmployeeDocumentsByTenant(mockData.tenantId, undefined, mockData.domainName, mockData.path, mockData.userEmail)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });

    test('throws an error if one occurs while retrieving documents by company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listEmployeeDocumentsByCompany(
                mockData.tenantId,
                mockData.companyId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });

    test('throws an error if one occurs while retrieving documents by employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .listEmployeeDocuments(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                undefined,
                mockData.domainName,
                mockData.path,
                false,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });
});

describe('esignatureService.company-document.create', () => {
    beforeEach(() => {
        setup();

        (utilService as any).checkForFileExistence = jest.fn(() => {
            return mockData.fileExistenceResponseArray;
        });
    });

    test('creates a company document', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.documentFileMetadataDBResponse);
        });

        return esignatureService
            .createCompanyDocument(mockData.tenantId, mockData.companyId, mockData.companyDocumentRequest, 'Test', 'User')
            .then((document) => {
                delete document.uploadDate;
                expect(document).toEqual(mockData.companyDocumentResponse);
            });
    });

    test('throws an error if one occurs', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Force an error');
        });

        return esignatureService
            .createCompanyDocument(mockData.tenantId, mockData.companyId, mockData.companyDocumentRequest, 'Test', 'User')
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Force an error');
            });
    });
});

describe('esignatureService.company-document.update', () => {
    beforeEach(() => {
        setup();

        (utilService as any).checkForFileExistence = jest.fn(() => {
            return mockData.fileExistenceResponseArray;
        });
    });

    test('updates a non-legacy company document', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
        });

        return esignatureService
            .updateCompanyDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.s3DocumentEncodedId,
                mockData.updateCompanyDocumentRequest,
            )
            .then((document) => {
                delete document.uploadDate;
                expect(document).toEqual(mockData.updateNonLegacyCompanyDocumentResponse);
            });
    });

    test('updates a legacy company document', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
        });

        return esignatureService
            .updateCompanyDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.legacyDocumentEncodedId,
                mockData.updateCompanyDocumentRequest,
            )
            .then((document) => {
                delete document.uploadDate;
                expect(document).toEqual(mockData.updateLegacyCompanyDocumentResponse);
            });
    });

    test('returns a 404 if non-legacy document is not found', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyDBResponse);
        });

        return esignatureService
            .updateCompanyDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.s3DocumentEncodedId,
                mockData.updateCompanyDocumentRequest,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`The document id: 1 not found`);
            });
    });

    test('returns a 404 if legacy document is not found', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyDBResponse);
        });

        return esignatureService
            .updateCompanyDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.legacyDocumentEncodedId,
                mockData.updateCompanyDocumentRequest,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`The document id: 1 not found`);
            });
    });
});

describe('esignatureService.employee-document.update', () => {
    beforeEach(() => {
        setup();
    });

    test('updates a non-legacy employee document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.s3DocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .then((document) => {
                delete document.uploadDate;
                expect(document).toEqual(mockData.updateNonLegacyEmployeeDocumentResponse);
            });
    });

    test('updates a legacy employee document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.legacyDocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .then((document) => {
                delete document.uploadDate;
                expect(document).toEqual(mockData.updateLegacyEmployeeDocumentResponse);
            });
    });

    test('returns a 403 if employee is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return;
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.legacyDocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(403);
                expect(error.code).toEqual(20);
                expect(error.message).toEqual('Not authorized.');
            });
    });

    test('returns a 404 if non-legacy document is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.emptyDBResponse);
        });

        (employeeService as any).getById = jest.fn(() => {
            return { eeCode: '1' };
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.s3DocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`The document id: 1 not found`);
            });
    });

    test('returns a 400 if the specified non-legacy document is not editable', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            const document = { ...mockData.documentFileMetadataByIdDBResponse };
            document.recordset[0].UploadedBy = undefined;
            document.recordset[0].Category = 'onboarding';
            return Promise.resolve(document);
        });

        (employeeService as any).getById = jest.fn(() => {
            return { eeCode: '1' };
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.s3DocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Signed documents are not editable');
            });
    });

    test('returns a 404 if legacy document is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.emptyDBResponse);
        });

        (employeeService as any).getById = jest.fn(() => {
            return { eeCode: '1' };
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.legacyDocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`The document id: 1 not found`);
            });
    });

    test('returns a 400 if the specified non-legacy document is not editable', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            const document = { ...mockData.documentFileMetadataByIdDBResponse };
            document.recordset[0].IsPublishedToEmployee = true;
            return Promise.resolve(document);
        });

        (employeeService as any).getById = jest.fn(() => {
            return { eeCode: '1' };
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.legacyDocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Documents that have been published to employees are not editable');
            });
    });

    test('returns a 400 if the specified non-legacy document is not editable', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            const document = { ...mockData.documentFileMetadataByIdDBResponse };
            document.recordset[0].UploadedByUsername = 'Onboarding';
            document.recordset[0].DocumentCategory = 'Onboarding-I9';
            document.recordset[0].IsPublishedToEmployee = false;
            return Promise.resolve(document);
        });

        (employeeService as any).getById = jest.fn(() => {
            return { eeCode: '1' };
        });

        return esignatureService
            .updateEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.legacyDocumentEncodedId,
                mockData.updateEmployeeDocumentRequest,
                mockData.roles,
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Documents generated by the system are not editable');
                expect(error.moreInfo).toEqual('These files are W4, I9, Direct Deposit, and Background Check Auth');
            });
    });
});

describe('esignatureService.company-document.delete', () => {
    beforeEach(() => {
        setup();
    });

    test('deletes an e-signature company document', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        esignatureService
            .deleteCompanyDocument(mockData.tenantId, mockData.companyId, 'abc123', mockData.userEmail)
            .then((document) => {
                expect(document).toEqual(undefined);
            })
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('deletes a non-e-signature company document', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        (utilService as any).authorizeAndRunQuery = jest.fn(() => {
            return [[{ Pointer: 'test' }]];
        });

        esignatureService
            .deleteCompanyDocument(mockData.tenantId, mockData.companyId, mockData.s3DocumentEncodedId, mockData.userEmail)
            .then((document) => {
                expect(document).toEqual(undefined);
            })
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('deletes a legacy company document', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        esignatureService
            .deleteCompanyDocument(mockData.tenantId, mockData.companyId, mockData.legacyDocumentEncodedId, mockData.userEmail)
            .then((document) => {
                expect(document).toEqual(undefined);
            })
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('returns a 404 if no company documents are found', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        (utilService as any).authorizeAndRunQuery = jest.fn(() => {
            return [];
        });

        esignatureService
            .deleteCompanyDocument(mockData.tenantId, mockData.companyId, 'abc123', mockData.userEmail)
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Document with ID abc123 not found.');
            });
        done();
    });
});

describe('esignatureService.employee-document.delete', () => {
    beforeEach(() => {
        setup();
    });

    test('deletes an non-signature employee document', async (done) => {
        try {
            (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
                if (payload.queryName === 'DeleteFileMetadataById') {
                    return Promise.resolve(mockData.deleteEmployeeDocumentDBResponse);
                }
                else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                    return Promise.resolve(mockData.employeeDBResponse);
                }
            });

            (employeeService as any).getById = jest.fn(() => {
                return mockData.employeeObject
            });

            (utilService as any).authorizeAndRunQuery = jest.fn(() => {
                return [[{ Pointer: 'test' }]];
            });
            const document = await esignatureService.deleteEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.s3DocumentEncodedId,
                mockData.userEmail,
                mockData.roles,
            );

            expect(document).toEqual(undefined);
            done();
        } catch (e) {
            done.fail(new Error('Test should not throw an exception.'));
        }
    });

    test('deletes a legacy employee document', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            if (payload.queryName === 'DeleteDocumentById') {
                return Promise.resolve(mockData.deleteEmployeeLegacyDocumentDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return mockData.employeeObject
        });

        (utilService as any).authorizeAndRunQuery = jest.fn(() => {
            return [[{ Pointer: 'test' }]];
        });

        await esignatureService
            .deleteEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.legacyDocumentEncodedId,
                mockData.userEmail,
                mockData.roles,
            )
            .then((document) => {
                expect(document).toEqual(undefined);
            })
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('returns a 404 if no employee documents are found', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            if (payload.queryName === 'DeleteFileMetadataById') {
                return Promise.resolve(mockData.deleteEmployeeDocumentDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return mockData.employeeObject
        });

        (utilService as any).authorizeAndRunQuery = jest.fn(() => {
            return [];
        });

        await esignatureService
            .deleteEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                'abc123',
                mockData.userEmail,
                mockData.roles,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Document with ID abc123 not found.');
            });
        done();
    });
});

describe('esignatureService.create-upload-url', () => {
    beforeEach(() => {
        setup();

        (utilService as any).checkForFileExistence = jest.fn(() => {
            return mockData.fileExistenceResponseArray;
        });
    });

    test('with an invalid employee id returns an error message', async (done) => {
        const invalidPayload = {
            employeeId: 'A',
            isPrivate: true,
            documentId: '83xx6',
        };

        try {
            await esignatureService.generateDocumentUploadUrl(mockData.tenantId, mockData.companyId, 'bigboss', invalidPayload);
            done.fail(new Error('Test should throw an exception.'));
        } catch (error) {
            const errorMessage = `${invalidPayload.employeeId} is not a valid number`;
            expect(error).toEqual(errorService.getErrorResponse(30).setDeveloperMessage(errorMessage));
            done();
        }
    });

    test('with an invalid company id returns an error message', async (done) => {
        const invalidCompanyId = 'A1234';
        try {
            await esignatureService.generateDocumentUploadUrl(
                mockData.tenantId,
                invalidCompanyId,
                'bigboss',
                mockData.uploadUrlGenerationRequest,
            );
            done.fail(new Error('Test should throw an exception.'));
        } catch (error) {
            const errorMessage = `${invalidCompanyId} is not a valid number`;
            expect(error).toEqual(errorService.getErrorResponse(30).setDeveloperMessage(errorMessage));
            done();
        }
    });

    test('creates a document upload url', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeInfoById') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'getFileMetadataById') {
                return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
            }
        });

        await esignatureService
            .generateDocumentUploadUrl(mockData.tenantId, mockData.companyId, 'bigboss', mockData.uploadUrlGenerationRequest)
            .then((document) => {
                expect(document).toEqual(mockData.uploadUrlGenerationResponse);
                done();
            })
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
    });
});

describe('esignatureService.legacy-document.checks', () => {
    beforeEach(() => {
        setup();
    });

    test('with an invalid employee id returns an error message', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDocumentMetadataById') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        try {
            return await esignatureService.isEditableLegacyEmployeeDocument(decodedDocumentId, mockData.tenantId, mockData.employeeId);
        } catch (error) {
            const errorMessage = `The document id: ${decodedDocumentId} not found`;
            expect(error).toEqual(errorService.getErrorResponse(50).setDeveloperMessage(errorMessage));
        }
    });

    test('prevent editing of documents published to employee', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDocumentMetadataById') {
                const docsInfo = { ...mockData.documentFileMetadataByIdDBResponse };
                docsInfo.recordset[0].IsPublishedToEmployee = true;
                return Promise.resolve(docsInfo);
            }
        });

        try {
            return await esignatureService.isEditableLegacyEmployeeDocument(decodedDocumentId, mockData.tenantId, mockData.employeeId);
        } catch (error) {
            const errorMessage = 'Documents that have been published to employees are not editable';
            expect(error).toEqual(errorService.getErrorResponse(30).setDeveloperMessage(errorMessage));
        }
    });

    test('prevent editing of documents generated during onboarding', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDocumentMetadataById') {
                const docsInfo = { ...mockData.documentFileMetadataByIdDBResponse };
                docsInfo.recordset[0].UploadedByUsername = 'Onboarding';
                docsInfo.recordset[0].DocumentCategory = 'Onboarding-I9';
                docsInfo.recordset[0].IsPublishedToEmployee = false;
                return Promise.resolve(docsInfo);
            }
        });

        try {
            return await esignatureService.isEditableLegacyEmployeeDocument(decodedDocumentId, mockData.tenantId, mockData.employeeId);
        } catch (error) {
            const expectedError = errorService
                .getErrorResponse(30)
                .setDeveloperMessage('Documents generated by the system are not editable')
                .setMoreInfo('These files are W4, I9, Direct Deposit, and Background Check Auth');
            expect(error).toEqual(expectedError);
        }
    });

    test('prevent editing of esigned I9 documents', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDocumentMetadataById') {
                const docsInfo = { ...mockData.documentFileMetadataByIdDBResponse };
                docsInfo.recordset[0].Title = 'FormI9';
                docsInfo.recordset[0].DocumentCategory = 'I-9';
                return Promise.resolve(docsInfo);
            }
        });

        try {
            return await esignatureService.isEditableLegacyEmployeeDocument(decodedDocumentId, mockData.tenantId, mockData.employeeId);
        } catch (error) {
            const expectedError = errorService
                .getErrorResponse(30)
                .setDeveloperMessage('Documents generated by the system are not editable')
                .setMoreInfo('These files are W4, I9, Direct Deposit, and Background Check Auth');
            expect(error).toEqual(expectedError);
        }
    });
});

describe('esignatureService.save-uploaded-document-metadata', () => {
    beforeEach(() => {
        setup();
    });

    test('saves the metadata of an uploaded document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getFileMetadataById') {
                return Promise.resolve(mockData.documentFileMetadataByIdDBResponse);
            }
        });

        return esignatureService.saveUploadedDocumentMetadata('test', 'uploadTime').then((categories) => {
            expect(categories).toBe(undefined);
        });
    });
});

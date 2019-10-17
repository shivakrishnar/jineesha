import * as employeeService from '../../../api/tenants/src/employee.service';
import * as errorService from '../../../errors/error.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from './mock';

jest.mock('shortid');

describe('esignatureService.company-document.list', () => {
    beforeEach(() => {
        setup();
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
    });

    test('creates an company document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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

describe('esignatureService.employee-document.create', () => {
    beforeEach(() => {
        setup();
    });

    test('creates an employee document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeInfoById') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
            return Promise.resolve(mockData.documentFileMetadataDBResponse);
        });

        return esignatureService
            .createEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.employeeDocumentRequest,
                'Test',
                'User',
            )
            .then((document) => {
                delete document.uploadDate;
                expect(document).toEqual(mockData.employeeDocumentResponse);
            });
    });

    test('returns a 400 if companyId is not integral', () => {
        return esignatureService
            .createEmployeeDocument(mockData.tenantId, 'abc123', mockData.employeeId, mockData.employeeDocumentRequest, 'Test', 'User')
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('returns a 400 if employeeId is not integral', () => {
        return esignatureService
            .createEmployeeDocument(mockData.tenantId, mockData.companyId, 'abc123', mockData.employeeDocumentRequest, 'Test', 'User')
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('returns a 404 if employee is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeInfoById') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService
            .createEmployeeDocument(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.employeeDocumentRequest,
                'Test',
                'User',
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`Employee with ID ${mockData.employeeId} not found.`);
            });
    });
});

describe('esignatureService.company-document.update', () => {
    beforeEach(() => {
        setup();
    });

    test('updates a non-legacy company document', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
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

        (employeeService as any).getById = jest.fn((transaction, payload) => {
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

        (employeeService as any).getById = jest.fn((params: any) => {
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

        (employeeService as any).getById = jest.fn((params: any) => {
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

        (employeeService as any).getById = jest.fn((params: any) => {
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

        (employeeService as any).getById = jest.fn((params: any) => {
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

        (employeeService as any).getById = jest.fn((params: any) => {
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

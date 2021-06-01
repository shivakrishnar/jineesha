import 'reflect-metadata'; // required by asure.auth dependency

import * as uuidV4 from 'uuid/v4';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';
jest.mock('uuid/v4');

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.signature-request.list', () => {
    beforeEach(() => {
        setup();
    });

    test('returns a consolidated list of company signature requests', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.signatureRequestDBResponse);
        });

        return esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                mockData.signatureRequestQueryParams,
                mockData.domainName,
                mockData.path,
            )
            .then((signatureRequests) => {
                expect(signatureRequests).toBeInstanceOf(PaginatedResult);
                expect(signatureRequests.results[0]).toEqual(mockData.signatureRequestListResponse[0]);
                expect(signatureRequests.results[1]).toEqual(mockData.signatureRequestListResponse[1]);
                expect(signatureRequests.results[2]).toEqual(mockData.signatureRequestListResponse[1]);
            });
    });

    test('returns a consolidated list of company signature requests for managers', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeEmailsByManager') {
                return Promise.resolve(mockData.employeeEmailsByManagerDBResponse);
            }
            return Promise.resolve(mockData.signatureRequestDBResponse);
        });

        return esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                true,
                mockData.signatureRequestQueryParams,
                mockData.domainName,
                mockData.path,
            )
            .then((signatureRequests) => {
                expect(signatureRequests).toBeInstanceOf(PaginatedResult);
                expect(signatureRequests.results.length).toEqual(3);
                expect(signatureRequests.results[0]).toEqual(mockData.signatureRequestListResponse[0]);
                expect(signatureRequests.results[1]).toEqual(mockData.signatureRequestListResponse[1]);
            });
    });

    test('returns a list of company signature requests', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.signatureRequestDBResponse);
        });

        const queryParams = { ...mockData.signatureRequestQueryParams };
        delete queryParams.consolidated;

        return esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                queryParams,
                mockData.domainName,
                mockData.path,
            )
            .then((signatureRequests) => {
                expect(signatureRequests).toBeInstanceOf(PaginatedResult);
                expect(signatureRequests.results[0]).toEqual(mockData.signatureRequestListResponse[0]);
                expect(signatureRequests.results[1]).toEqual(mockData.signatureRequestListResponse[1]);
                expect(signatureRequests.results[2]).toEqual(mockData.signatureRequestListResponse[1]);
            });
    });

    test('returns a list of company signature requests for managers', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.signatureRequestDBResponse);
        });

        const queryParams = { ...mockData.signatureRequestQueryParams };
        delete queryParams.consolidated;

        return esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                true,
                queryParams,
                mockData.domainName,
                mockData.path,
            )
            .then((signatureRequests) => {
                expect(signatureRequests).toBeInstanceOf(PaginatedResult);
                expect(signatureRequests.results[0]).toEqual(mockData.signatureRequestListResponse[0]);
                expect(signatureRequests.results[1]).toEqual(mockData.signatureRequestListResponse[1]);
                expect(signatureRequests.results[2]).toEqual(mockData.signatureRequestListResponse[1]);
            });
    });

    test('returns a list of pending company signature requests', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.signatureRequestDBResponse);
        });

        const queryParams = { ...mockData.signatureRequestQueryParams };
        queryParams.status = 'pending';

        return esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                queryParams,
                mockData.domainName,
                mockData.path,
            )
            .then((signatureRequests) => {
                expect(signatureRequests).toBeInstanceOf(PaginatedResult);
                expect(signatureRequests.results.length).toEqual(1);
                expect(signatureRequests.results[0]).toEqual(mockData.signatureRequestListResponse[0]);
            });
    });

    test('returns a 400 if companyId is not integral', async () => {
        return await esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                'abc123',
                mockData.userEmail,
                false,
                mockData.signatureRequestQueryParams,
                mockData.domainName,
                mockData.path,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('abc123 is not a valid number');
            });
    });

    test('returns a 400 if an unsupported query param is provided', async () => {
        const queryParams = { test: '1' };
        return await esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                queryParams,
                mockData.domainName,
                mockData.path,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
                expect(error.moreInfo).toEqual('Available query parameters: status, consolidated. See documentation for usage.');
            });
    });

    test('returns a 400 if an invalid value for status is provided', async () => {
        const queryParams = { ...mockData.signatureRequestQueryParams };
        queryParams.status = 'test';
        return await esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                queryParams,
                mockData.domainName,
                mockData.path,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported value: test');
                expect(error.moreInfo).toEqual('Available values for status: signed, pending. See documentation for usage.');
            });
    });

    test('returns a 400 if an invalid value for consolidated is provided', async () => {
        const queryParams = { ...mockData.signatureRequestQueryParams };
        queryParams.consolidated = 'test';
        return await esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                queryParams,
                mockData.domainName,
                mockData.path,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported value: test');
                expect(error.moreInfo).toEqual('Available values for status: true. See documentation for usage.');
            });
    });

    test('returns undefined if no company signature requests are found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            return Promise.resolve(mockData.emptyPaginatedDBResponse);
        });

        return esignatureService
            .listCompanySignatureRequests(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                false,
                mockData.signatureRequestQueryParams,
                mockData.domainName,
                mockData.path,
            )
            .then((signatureRequests) => {
                expect(signatureRequests).toEqual(undefined);
            });
    });
});

describe('esignatureService.signature-requests.create', () => {
    beforeEach(() => {
        setup();
    });

    test('creates and returns signature requests for some employees', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.employeesByCodeDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.bulkSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .then((signatureRequests) => {
                expect(Array.isArray(signatureRequests)).toBe(true);
                expect(signatureRequests).toEqual(mockData.someEmployeesSignatureRequestsResponse);
            });
    });

    test('creates and returns signature requests for all employees', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'listEmployeesByCompany') {
                return Promise.resolve(mockData.paginatedEmployeesDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.allEmployeesBulkSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .then((signatureRequests) => {
                expect(Array.isArray(signatureRequests)).toBe(true);
                expect(signatureRequests).toEqual(mockData.signatureRequestsResponse);
            });
    });

    test('creates and returns simple signature requests for all employees', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'listEmployeesByCompany') {
                return Promise.resolve(mockData.paginatedEmployeesDBResponse);
            } else if (payload.queryName === 'getFileMetadataById') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            }
        });

        uuidV4.mockImplementation(() => '1234');
        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.allEmployeesBulkSimpleSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .then((signatureRequests) => {
                expect(Array.isArray(signatureRequests)).toBe(true);
                expect(signatureRequests).toEqual(mockData.SimpleSignatureRequestsResponse);
            });
    });

    test('returns a 404 if employees are not found when trying to find all employees', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'listEmployeesByCompany') {
                return Promise.resolve(mockData.emptyPaginatedDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.allEmployeesBulkSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toContain(`No employees were found under the provided company ${mockData.companyId}`);
            });
    });

    test('returns a 404 if employees are not found when trying to find all employees', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'listEmployeesByCompany') {
                return Promise.resolve(mockData.emptyPaginatedDBResponse);
            } else if (payload.queryName === 'getFileMetadataById') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.allEmployeesBulkSimpleSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toContain(`No employees were found under the provided company ${mockData.companyId}`);
            });
    });

    test('returns a 404 if some employees are not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'getFileMetadataById') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.bulkSimpleSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toContain(
                    `Employees with the following codes were not found under company ${
                        mockData.companyId
                    }: ${mockData.bulkSignatureRequestRequestBody.signatories.map((signatory) => signatory.employeeCode).join(',')}`,
                );
            });
    });

    test('returns a 404 if some employees are not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.bulkSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toContain(
                    `Employees with the following codes were not found under company ${
                        mockData.companyId
                    }: ${mockData.bulkSignatureRequestRequestBody.signatories.map((signatory) => signatory.employeeCode).join(',')}`,
                );
            });
    });

    test('returns a 422 if some employee do not have email addresses (HelloSign)', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.employeesWithoutEmailAddressDBResponse);
            } else if (payload.queryName === 'getEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse);
            }
        });

        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.bulkSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .catch((error) => {
                console.log(error);
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(70);
                expect(error.message).toEqual('The database contains bad data.');
                expect(error.developerMessage).toContain('Some employees do not have email addresses.');
                expect(error.moreInfo).toContain(
                    '{"employees":"[{\\"firstName\\":\\"Hugh\\",\\"lastName\\":\\"Jass\\",\\"emailAddress\\":null,\\"employeeCode\\":\\"1\\"}]","successes":1,"failures":1}',
                );
            });
    });

    test('returns a 422 if some employees do not have email addresses (Simple Sign)', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.employeesWithoutEmailAddressDBResponse);
            } else if (payload.queryName === 'getFileMetadataById') {
                return Promise.resolve(mockData.documentFileMetadataDBResponse);
            }
        });

        uuidV4.mockImplementation(() => '1234');
        return esignatureService
            .createBatchSignatureRequest(
                { tenantId: mockData.tenantId, companyId: mockData.companyId },
                mockData.bulkSimpleSignatureRequestRequestBody,
                {},
                mockData.userEmail,
                '123',
                mockData.domainName,
            )
            .catch((error) => {
                console.log('here', error);
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(70);
                expect(error.message).toEqual('The database contains bad data.');
                expect(error.developerMessage).toContain('Some employees do not have email addresses.');
                expect(error.moreInfo).toContain(
                    '{"employees":"[{\\"firstName\\":\\"Hugh\\",\\"lastName\\":\\"Jass\\",\\"employeeCode\\":\\"1\\",\\"emailAddress\\":null}]","successes":1,"failures":1}',
                );
            });
    });
});

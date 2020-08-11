import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { setup } from '../../../unit-test-mocks/mock';
import { SignatureRequestResponse } from '../src/signature-requests/signatureRequestResponse';

describe('esignatureService.signature-request.create', () => {
    beforeEach(() => {
        setup();
    });

    test('creates and returns a signature request', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeInfoById') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.employeesByCodeDBResponse);
            }
        });

        return esignatureService
            .createSignatureRequest(mockData.tenantId, mockData.companyId, mockData.employeeId, mockData.signatureRequestRequestBody)
            .then((signatureRequest) => {
                expect(signatureRequest).toBeInstanceOf(SignatureRequestResponse);
                expect(signatureRequest).toEqual(mockData.signatureRequestResponse);
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
            .createSignatureRequest(mockData.tenantId, mockData.companyId, mockData.employeeId, mockData.signatureRequestRequestBody)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Employee record not found');
            });
    });

    test('returns a 404 if employee code is not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeInfoById') {
                return Promise.resolve(mockData.employeeDBResponse);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService
            .createSignatureRequest(mockData.tenantId, mockData.companyId, mockData.employeeId, mockData.signatureRequestRequestBody)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toContain(
                    `Employees with the following codes were not found under company ${mockData.companyId}: ${
                        mockData.signatureRequestRequestBody.employeeCode
                    }`,
                );
            });
    });
});

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

    test('creates and returns signature requests', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.employeesByCodeDBResponse);
            }
        });

        return esignatureService
            .createBulkSignatureRequest(mockData.tenantId, mockData.companyId, mockData.bulkSignatureRequestRequestBody, {}, undefined)
            .then((signatureRequest) => {
                expect(signatureRequest).toBeInstanceOf(SignatureRequestResponse);
                expect(signatureRequest).toEqual(mockData.signatureRequestResponse);
            });
    });

    test('returns a 404 if some employees are not found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetEmployeeByCompanyIdAndCode') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        return esignatureService
            .createBulkSignatureRequest(mockData.tenantId, mockData.companyId, mockData.bulkSignatureRequestRequestBody, {}, undefined)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toContain(
                    `Employees with the following codes were not found under company ${
                        mockData.companyId
                    }: ${mockData.bulkSignatureRequestRequestBody.employeeCodes.join(',')}`,
                );
            });
    });
});

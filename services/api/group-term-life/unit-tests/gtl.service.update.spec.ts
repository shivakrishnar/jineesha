import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as gtlService from '../gtl.service';
import * as mockData from './mock-data/gtl-mock-data';
import * as employeeService from '../../tenants/src/employee.service';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('gtl.service.update', () => {
    beforeEach(() => {
        setup();
    });

    test('updates a gtl record for an employee', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({
                evoData: {
                    employeeId: mockData.employeeId,
                    companyId: mockData.companyId,
                    clientId: mockData.clientId,
                },
            });
        });

        return gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.flatCoveragePayload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then((response) => {
                expect(response).toEqual(mockData.updateGtlRecordMockResult);
            });
    });

    test('returns a 404 if employee does not have a GTL record', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({});
        });

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.flatCoveragePayload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('No record exists for this employee!');
            });
        done();
    });

    test('returns a 404 if employee is not found', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return undefined;
        });

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.flatCoveragePayload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Employee with ID 42242 not found.');
            });
        done();
    });

    test('returns a 400 if flatCoverage is true and flatAmount is not provided', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({});
        });

        const payload = Object.assign({}, mockData.flatCoveragePayload);
        delete payload.flatAmount;

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                payload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('flatAmount must be provided if flatCoverage is true.');
            });
        done();
    });

    test('returns a 400 if flatCoverage is true and earningsMultiplier is provided', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({});
        });

        const payload = Object.assign({ earningsMultiplier: 2000 }, mockData.flatCoveragePayload);

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                payload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('earningsMultiplier and workHours must not be provided if flatCoverage is true.');
            });
        done();
    });

    test('returns a 400 if flatCoverage is false and earningsMultiplier is not provided', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({});
        });

        const payload = Object.assign({}, mockData.earningsMultiplierPayload);
        delete payload.earningsMultiplier;

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                payload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('earningsMultiplier must be provided if flatCoverage is false.');
            });
        done();
    });

    test('returns a 400 if flatCoverage is false, employee is hourly and workHours is not provided', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({ isSalary: false });
        });

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.earningsMultiplierPayload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('workHours must be provided if flatCoverage is false and employee is hourly.');
            });
        done();
    });

    test('returns a 400 if flatCoverage is false and flatAmount is provided', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'UpdateGtlRecord') {
                return Promise.resolve(mockData.updateGtlRecordDBResponse);
            } else if (payload.queryName === 'ListGtlRecordsByEmployee') {
                return Promise.resolve(mockData.getGtlRecordEmptyDBResponse);
            }
        });

        (employeeService as any).getById = jest.fn(() => {
            return Promise.resolve({ isSalary: true });
        });

        const payload = Object.assign({ flatAmount: 20000 }, mockData.earningsMultiplierPayload);

        await gtlService
            .updateGtlRecord(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                payload,
                mockData.emailAddress,
                [],
                mockData.accessToken,
            )
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('flatAmount must not be provided if flatCoverage is false.');
            });
        done();
    });
});

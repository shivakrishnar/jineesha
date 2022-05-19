/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as mockData from './mock-data';
import * as service from '../src/tenants.service';
import { setup } from '../../../unit-test-mocks/mock';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('scheduleTenantDeletion', () => {
    beforeEach(() => {
        setup();
    });

    test('schedules a tenant deletion', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.tenantInfoDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return false;
        });

        return service.scheduleTenantDeletion(mockData.tenantId, mockData.tenantDeletionRemovePatchInstructions)
            .then((result) => {
                expect(result.ttl).toBeDefined();
            });
    });

    test('unschedules a tenant deletion', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.tenantInfoDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return false;
        });

        await service.scheduleTenantDeletion(mockData.tenantId, mockData.tenantDeletionUndoPatchInstructions)
            .catch(() => {
                done.fail('expected test to pass');
            })
        done();
    });

    test('throws an error if an unsupported patch operation is supplied', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.tenantInfoDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return false;
        });

        await service.scheduleTenantDeletion(mockData.tenantId, mockData.testPatchInstruction)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Patch operation not supported');
            });
        done()
    });

    test('throws an error if a value is not provided', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.tenantInfoDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return false;
        });

        const patch = { ...mockData.tenantDeletionRemovePatchInstructions };
        delete patch.value;

        await service.scheduleTenantDeletion(mockData.tenantId, patch)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('value should be an integer');
            });
        done()
    });

    test('throws an error if the provided value is out of the allowed range', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.tenantInfoDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return false;
        });

        const patch = { ...mockData.tenantDeletionRemovePatchInstructions };
        patch.value = 11;

        await service.scheduleTenantDeletion(mockData.tenantId, patch)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('value should be between 7 and 10');
            });
        done()
    });

    test('throws an error if tenant info is not found', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.emptyDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return false;
        });

        await service.scheduleTenantDeletion(mockData.tenantId, mockData.tenantDeletionRemovePatchInstructions)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('Cannot find tenant info');
            });
        done()
    });

    test('throws an error if tenant url exists', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'TenantInfo') {
            	return Promise.resolve(mockData.tenantInfoDBResponse);
            }
        });

		(utilService as any).urlExists = jest.fn(() => {
			return true;
        });

        await service.scheduleTenantDeletion(mockData.tenantId, mockData.tenantDeletionRemovePatchInstructions)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(74);
                expect(error.message).toEqual('Cannot perform the specified operation.');
                expect(error.developerMessage).toEqual('The tenant URL still exists.');
                expect(error.moreInfo).toEqual('The tenant URL must be deleted first before the database can be deleted.');
            });
        done()
    });
});

describe('deleteTenantDatabase', () => {
    beforeEach(() => {
        setup();
    });

    test('deletes a tenant database', async (done) => {
        let statusRetry = false;
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'backupDatabase') {
            	return Promise.resolve(mockData.databaseBackupDBResponse);
            } else if (payload.queryName === 'getBackupStatus') {
                const result = Promise.resolve(
                    mockData.databaseBackupStatusDBResponse(statusRetry ? 'SUCCESS' : 'PENDING')
                );
                statusRetry = true;
                return result;
            }
        });

        (utilService as any).sleep = jest.fn(() => {
            return;
        })

        await service.deleteTenantDatabase(mockData.tenantId, mockData.tenantUrl)
            .catch(() => {
                done.fail('expected test to pass');
            });
        done();
    });

    test('throws an error if the backup task is not found', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'backupDatabase') {
            	return Promise.resolve(mockData.databaseBackupDBResponse);
            } else if (payload.queryName === 'getBackupStatus') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        await service.deleteTenantDatabase(mockData.tenantId, mockData.tenantUrl)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Database backup task not found.');
            });
        done();
    });

    test('throws an error if the backup task query returns an error', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'backupDatabase') {
            	return Promise.resolve(mockData.databaseBackupDBResponse);
            } else if (payload.queryName === 'getBackupStatus') {
                return Promise.resolve(mockData.databaseBackupStatusDBResponse('ERROR'));
            }
        });

        await service.deleteTenantDatabase(mockData.tenantId, mockData.tenantUrl)
            .then(() => {
                done.fail('expected test to fail');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('The database backup failed.');
                expect(error.moreInfo).toEqual('Check the CloudWatch logs for more info.');
            });
        done();
    });
});

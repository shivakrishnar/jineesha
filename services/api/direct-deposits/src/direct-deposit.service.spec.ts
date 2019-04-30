import * as configService from '../../../config.service';
import * as databaseService from '../../../internal-api/database/database.service';
import * as paginationService from '../../../pagination/pagination.service';
import * as payrollService from '../../../remote-services/payroll.service';
import * as ssoService from '../../../remote-services/sso.service';
import * as utilService from '../../../util.service';
import * as directDepositService from './direct-deposit.service';

import { ConnectionPool } from 'mssql';
import { ErrorMessage } from '../../../errors/errorMessage';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { BankAccount } from '../../models/BankAccount';
import { DirectDeposit } from './directDeposit';
import * as mockData from './mock-data';

(configService as any).getSecretsAwsEndpoint = jest.fn(() => {
    return 'https://secretsmanager.us-east-1.amazonaws.com';
});

(configService as any).getAwsRegion = jest.fn(() => {
    return 'us-east-1';
});

(configService as any).getRdsCredentials = jest.fn(() => {
    return 'xxxorwhatever';
});

(configService as any).getPageLimitDefault = jest.fn(() => {
    return 30;
});

(utilService as any).getSecret = jest.fn((params: any) => {
    return `{
    "username": "user",
    "password": "password"
  }`;
});

(utilService as any).logToAuditTrail = jest.fn((params: any) => {
    return {};
});

(utilService as any).clearCache = jest.fn((pool: any, accessToken: string) => {
    return;
});

(utilService as any).getSSOToken = jest.fn((params: any) => {
    return 'token';
});

(utilService as any).invokeInternalService = jest.fn((params: any) => {
    return {};
});

(payrollService as any).getEvolutionEarningAndDeduction = jest.fn((params: any) => {
    return {};
});

(payrollService as any).updateEvolutionEarningAndDeduction = jest.fn((params: any) => {
    return {};
});

(ssoService as any).getAccessToken = jest.fn((params: any) => {
    return {};
});

(ssoService as any).getTenantById = jest.fn((params: any) => {
    return {};
});

(databaseService as any).createConnectionPool = jest.fn((params: any) => {
    const pool = new ConnectionPool('dummyConnectionString');
    return Promise.resolve(pool);
});

(databaseService as any).findConnectionString = jest.fn((params: any) => {
    return Promise.resolve('');
});

(paginationService as any).appendPaginationFilter = jest.fn((params: any) => {
    return Promise.resolve('');
});

describe('directDepositService.list', () => {
    (utilService as any).invokeInternalService = jest.fn((params: any) => {
        return Promise.resolve(mockData.listResponseObject);
    });

    test('returns direct deposits', () => {
        return directDepositService.list(mockData.employeeId, mockData.tenantId, undefined, undefined, undefined).then((directDeposits) => {
            expect(directDeposits.results.length).toBe(mockData.listResponseObject.recordsets[1].length);
            expect(directDeposits.results[0]).toBeInstanceOf(DirectDeposit);
            expect(directDeposits.results[0].bankAccount).toMatchObject(new BankAccount());
            expect(directDeposits.results[0]).toEqual(mockData.expectedObjects[0]);
            expect(directDeposits.results[1]).toEqual(mockData.expectedObjects[1]);
        });
    });

    test('returns paginated direct deposits', () => {
        return directDepositService
            .list(mockData.employeeId, mockData.tenantId, mockData.paginationQueryParams, mockData.domainName, mockData.path)
            .then((directDeposits) => {
                expect(directDeposits).toBeInstanceOf(PaginatedResult);
                expect(directDeposits).toHaveProperty('limit');
                expect(directDeposits).toHaveProperty('count');
                expect(directDeposits).toHaveProperty('next');
                expect(directDeposits).toHaveProperty('previous');
                expect(directDeposits).toHaveProperty('first');
                expect(directDeposits).toHaveProperty('last');
                expect(directDeposits).toHaveProperty('results');
                expect(directDeposits.results.length).toBeGreaterThan(0);
            });
    });
});

describe('directDepositService.create', () => {
    test('creates and returns a direct deposit', () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            if (payload.queryName === 'CheckForDuplicateBankAccounts') {
                return Promise.resolve(mockData.emptyResponseObject);
            } else if (payload.queryName === 'DirectDepositCreate') {
                return Promise.resolve(mockData.outputResponseObject);
            } else {
                return Promise.resolve(mockData.postResponseObject);
            }
        });
        return directDepositService
            .create(
                mockData.employeeId,
                mockData.companyId,
                mockData.tenantId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                new DirectDeposit(mockData.postObject),
                mockData.userEmail,
            )
            .then((directDeposit) => {
                expect(directDeposit).toBeInstanceOf(DirectDeposit);
                expect(directDeposit.bankAccount).toMatchObject(new BankAccount());
                expect(directDeposit).toEqual(mockData.expectedObjects[0]);
            });
    });

    test('returns a 409 error when a record already exists with the same routing or account number', () => {
        (utilService as any).invokeInternalService = jest.fn((params: any) => {
            return Promise.resolve(mockData.duplicateBankAccountResponseObject);
        });
        return directDepositService
            .create(
                mockData.employeeId,
                mockData.companyId,
                mockData.tenantId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                new DirectDeposit(mockData.postObject),
                mockData.userEmail,
            )
            .catch((error: any) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(409);
                expect(error.code).toEqual(40);
                expect(error.message).toEqual('Conflict. The provided request object already exists.');
                const developerMessage = 'There are already records in the database with the same provided information.';
                const moreInfo = 'Routing number, account number and designation must be collectively unique.';
                expect(error.developerMessage).toEqual(developerMessage);
                expect(error.moreInfo).toEqual(moreInfo);
            });
    });

    test('returns a 409 error when a record already exists with an amountType of Balance Remainder', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'CheckForDuplicateBankAccounts-union-CheckForDuplicateRemainderOfPay') {
                return Promise.resolve(mockData.duplicateRemainderResponseObject);
            } else {
                return Promise.resolve(mockData.postResponseObject);
            }
        });
        return directDepositService
            .create(
                mockData.employeeId,
                mockData.companyId,
                mockData.tenantId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                new DirectDeposit(mockData.balanceRemainderPostObject),
                mockData.userEmail,
            )
            .catch((error: any) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(409);
                expect(error.code).toEqual(40);
                expect(error.message).toEqual('Conflict. The provided request object already exists.');
                expect(error.developerMessage).toEqual('There are already records in the database with the same provided information.');
                expect(error.moreInfo).toEqual('You can only have one direct deposit with an amountType of Balance Remainder');
            });
    });
});

describe('directDepositService.update', () => {
    test('updates and returns a direct deposit', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'CheckForDuplicateRemainderOfPay') {
                return Promise.resolve(mockData.emptyResponseObject);
            } else if (payload.queryName === 'DirectDepositUpdate') {
                return Promise.resolve(mockData.putAuditResponseObject);
            } else if (payload.queryName === 'GetDirectDepositById') {
                return Promise.resolve(mockData.putResponseObject);
            } else {
                return Promise.resolve(mockData.putResponseObject);
            }
        });
        return directDepositService
            .update(
                mockData.employeeId,
                mockData.tenantId,
                new DirectDeposit(mockData.putObject),
                mockData.directDepositId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .then((directDeposit) => {
                expect(directDeposit).toBeInstanceOf(DirectDeposit);
                expect(directDeposit.bankAccount).toMatchObject(new BankAccount());
                expect(directDeposit).toEqual(mockData.putExpectedObjects[0]);
            });
    });

    test('returns a 400 when the supplied id is not an integer', () => {
        return directDepositService
            .update(
                mockData.employeeId,
                mockData.tenantId,
                new DirectDeposit(mockData.putObject),
                mockData.directDepositIdWithCharacter,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.directDepositIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 400 when the supplied employeeId is not an integer', () => {
        return directDepositService
            .update(
                mockData.employeeIdWithCharacter,
                mockData.tenantId,
                new DirectDeposit(mockData.putObject),
                mockData.directDepositId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.employeeIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 404 when the requested resource does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'CheckForDuplicateRemainderOfPay' || payload.queryName === 'GetDirectDepositById') {
                return Promise.resolve(mockData.emptyResponseObject);
            } else {
                return Promise.resolve(mockData.notUpdatedResponseObject);
            }
        });
        return directDepositService
            .update(
                mockData.employeeId,
                mockData.tenantId,
                new DirectDeposit(),
                mockData.directDepositId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`Resource with id ${mockData.directDepositId} does not exist.`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 409 error when a record already exists with an amountType of Balance Remainder', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.duplicateRemainderResponseObject);
        });
        return directDepositService
            .update(
                mockData.employeeId,
                mockData.tenantId,
                new DirectDeposit(mockData.balanceRemainderPatchObject),
                mockData.directDepositId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                '',
                mockData.companyId,
            )
            .catch((error: any) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(409);
                expect(error.code).toEqual(40);
                expect(error.message).toEqual('Conflict. The provided request object already exists.');
                expect(error.developerMessage).toEqual('There are already records in the database with the same provided information.');
                expect(error.moreInfo).toEqual('You can only have one direct deposit with an amountType of Balance Remainder');
            });
    });
});

describe('directDepositService.delete', () => {
    test('returns a 400 when the supplied id is not an integer', () => {
        return directDepositService
            .remove(
                mockData.employeeId,
                mockData.tenantId,
                mockData.directDepositIdWithCharacter,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.directDepositIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 400 when the supplied employeeId is not an integer', () => {
        return directDepositService
            .remove(
                mockData.employeeIdWithCharacter,
                mockData.tenantId,
                mockData.directDepositId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.employeeIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 404 when the requested resource does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, query) => {
            return Promise.resolve(mockData.emptyResponseObject);
        });
        return directDepositService
            .remove(
                mockData.employeeId,
                mockData.tenantId,
                mockData.directDepositId,
                mockData.accessToken,
                mockData.payrollApiCredentials,
                mockData.userEmail,
                mockData.companyId,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual(`Resource with id ${mockData.directDepositId} does not exist.`);
                expect(error.moreInfo).toEqual('');
            });
    });
});

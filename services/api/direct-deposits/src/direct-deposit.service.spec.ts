import 'reflect-metadata'; // required by asure.auth dependency

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

(utilService as any).getSecret = jest.fn(() => {
    return `{
    "username": "user",
    "password": "password"
  }`;
});

(utilService as any).logToAuditTrail = jest.fn(() => {
    return {};
});

(utilService as any).clearCache = jest.fn(() => {
    return;
});

(utilService as any).getSSOToken = jest.fn(() => {
    return 'token';
});

(utilService as any).invokeInternalService = jest.fn(() => {
    return {};
});

(utilService as any).getPayrollApiCredentials = jest.fn(() => {
    return 'token';
});

(payrollService as any).getEvolutionEarningAndDeduction = jest.fn(() => {
    return {};
});

(payrollService as any).updateEvolutionEarningAndDeduction = jest.fn(() => {
    return {};
});

(ssoService as any).getAccessToken = jest.fn(() => {
    return {};
});

(ssoService as any).getTenantById = jest.fn(() => {
    return {};
});

(databaseService as any).createConnectionPool = jest.fn(() => {
    const pool = new ConnectionPool('dummyConnectionString');
    return Promise.resolve(pool);
});

(databaseService as any).findConnectionString = jest.fn(() => {
    return Promise.resolve('');
});

(paginationService as any).appendPaginationFilter = jest.fn(() => {
    return Promise.resolve('');
});

describe('directDepositService.list', () => {
    (utilService as any).invokeInternalService = jest.fn(() => {
        return Promise.resolve(mockData.listResponseObject);
    });

    test('returns a 400 when an unsupported query parameter(s) supplied', () => {
        return directDepositService
            .list(
                mockData.employeeIdWithCharacter,
                mockData.tenantId,
                mockData.unsupportedQueryParam,
                undefined,
                undefined,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual('Unsupported query parameter(s) supplied');
            });
    });

    test('returns a 400 when the supplied employeeId is not an integer', () => {
        return directDepositService
            .list(
                mockData.employeeIdWithCharacter,
                mockData.tenantId,
                undefined,
                undefined,
                undefined,
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
    test('returns a 400 when the supplied employeeId is not an integer', () => {
        return directDepositService
            .create(
                mockData.employeeIdWithCharacter,
                mockData.companyId,
                mockData.tenantId,
                mockData.accessToken,
                new DirectDeposit(mockData.postObject),
                mockData.userEmail,
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

    test('returns a 400 when the supplied companyId is not an integer', () => {
        return directDepositService
            .create(
                mockData.employeeId,
                mockData.companyIdWithCharacter,
                mockData.tenantId,
                mockData.accessToken,
                new DirectDeposit(mockData.postObject),
                mockData.userEmail,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    // test('returns a 409 error when a record already exists with an amountType of Balance Remainder', () => {
    //     (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
    //         if (payload.queryName === 'CheckForDuplicateBankAccounts-union-CheckForDuplicateRemainderOfPay') {
    //             return Promise.resolve(mockData.duplicateRemainderResponseObject);
    //         } else {
    //             return Promise.resolve(mockData.postResponseObject);
    //         }
    //     });
    //     return directDepositService
    //         .create(
    //             mockData.employeeId,
    //             mockData.companyId,
    //             mockData.tenantId,
    //             mockData.accessToken,
    //             new DirectDeposit(mockData.balanceRemainderPostObject),
    //             mockData.userEmail,
    //         )
    //         .catch((error: any) => {
    //             console.log('===>>> error: ', error);
    //             expect(error).toBeInstanceOf(ErrorMessage);                
    //             expect(error.statusCode).toEqual(409);
    //             expect(error.code).toEqual(40);
    //             expect(error.message).toEqual('Conflict. The provided request object already exists.');
    //             expect(error.developerMessage).toEqual('There are already records in the database with the same provided information.');
    //             expect(error.moreInfo).toEqual('You can only have one direct deposit with an amountType of Balance Remainder');
    //         });
    // });

    test('creates and returns a direct deposit', () => {
        (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
            let result: any;
            if (payload.queryName === 'CheckForDuplicateBankAccounts') {
                result = Promise.resolve(mockData.emptyResponseObject);
            } else if (payload.queryName === 'DirectDepositCreate') {
                result = Promise.resolve(mockData.outputResponseObject);
            } else if (payload.queryName === 'CheckNachaBetaFlagIsOn') {
                result = Promise.resolve(mockData.outputResponseObjectForCheckNachaBetaFlag)
            } else {
                result = Promise.resolve(mockData.postResponseObject);
            }
            return result;
        });
        return directDepositService
            .create(
                mockData.employeeId,
                mockData.companyId,
                mockData.tenantId,
                mockData.accessToken,
                new DirectDeposit(mockData.postObject),
                mockData.userEmail,
            )
            .then((directDeposit) => {
                expect(directDeposit).toBeInstanceOf(DirectDeposit);
                expect(directDeposit.bankAccount).toMatchObject(new BankAccount());
                expect(directDeposit).toEqual(mockData.expectedObjects[0]);
            });
    });

    // test('returns a 409 error when a record already exists with the same routing or account number', () => {
    //     (utilService as any).invokeInternalService = jest.fn(() => {
    //         return Promise.resolve(mockData.duplicateBankAccountResponseObject);
    //     });
    //     return directDepositService
    //         .create(
    //             mockData.employeeId,
    //             mockData.companyId,
    //             mockData.tenantId,
    //             mockData.accessToken,
    //             new DirectDeposit(mockData.postObject),
    //             mockData.userEmail,
    //         )
    //         .catch((error: any) => {
    //             expect(error).toBeInstanceOf(ErrorMessage);
    //             expect(error.statusCode).toEqual(409);
    //             expect(error.code).toEqual(40);
    //             expect(error.message).toEqual('Conflict. The provided request object already exists.');
    //             const developerMessage = 'There are already records in the database with the same provided information.';
    //             const moreInfo = 'Routing number and account number must be collectively unique.';
    //             expect(error.developerMessage).toEqual(developerMessage);
    //             expect(error.moreInfo).toEqual(moreInfo);
    //         });
    // });
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

    test('returns a 400 when the supplied companyId is not an integer', () => {
        return directDepositService
            .update(
                mockData.employeeId,
                mockData.tenantId,
                new DirectDeposit(mockData.putObject),
                mockData.directDepositId,
                mockData.accessToken,
                mockData.userEmail,
                mockData.companyIdWithCharacter,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.companyIdWithCharacter} is not a valid number`);
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

    test('returns a 400 when the supplied companyId is not an integer', () => {
        return directDepositService
            .remove(
                mockData.employeeId,
                mockData.tenantId,
                mockData.directDepositId,
                mockData.accessToken,
                mockData.userEmail,
                mockData.companyIdWithCharacter,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(400);
                expect(error.code).toEqual(30);
                expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
                expect(error.developerMessage).toEqual(`${mockData.companyIdWithCharacter} is not a valid number`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('returns a 404 when the requested resource does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            return Promise.resolve(mockData.emptyResponseObject);
        });
        return directDepositService
            .remove(
                mockData.employeeId,
                mockData.tenantId,
                mockData.directDepositId,
                mockData.accessToken,
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

describe('directDepositService.listBetaFlags', () => {
    test('returns beta flags when there are results', () => {
        return directDepositService.listBetaFlags(mockData.tenantId).then((betaFlags) => {
            expect(Array.isArray(betaFlags)).toBe(true);
            if (betaFlags.length > 0) {
                const expectedProperties: string[] = Object.keys({
                    id: expect.any(Number),
                    companyId: expect.any(Number),
                    isOn: expect.any(Boolean),
                    code: expect.any(String),
                });
                const actualProperties: string[] = Object.keys(betaFlags[0]);
                expect(actualProperties).toEqual(expect.arrayContaining(expectedProperties));             
            }
        });
    });

    test('returns an empty array when there are no results', () => {
        return directDepositService.listBetaFlags(mockData.tenantId).then((betaFlags) => {
            expect(betaFlags).toEqual([]);
        });
    });
});
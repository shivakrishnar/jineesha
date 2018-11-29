import * as configService from '../../config.service';
import * as utilService from '../../util.service';
import * as directDepositDao from './direct-deposit.dao';
import * as directDepositService from './direct-deposit.service';

import { ConnectionPool } from 'mssql';
import { ErrorMessage } from '../../errors/errorMessage';
import { BankAccount } from '../../models/BankAccount';
import { DirectDeposit } from './directDeposit';
import { DirectDeposits } from './directDeposits';
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

(utilService as any).getSecret = jest.fn((params: any) => {
  return `{
    "username": "user",
    "password": "password"
  }`;
});

(directDepositDao as any).createConnectionPool = jest.fn((params: any) => {
  const pool = new ConnectionPool('dummyConnectionString');
  return Promise.resolve(pool);
});

describe('directDepositService.list', () => {
  (directDepositDao as any).executeQuery = jest.fn((params: any) => {
    return Promise.resolve(mockData.listResponseObject);
  });

  test('returns direct deposits', () => {
    return directDepositService.list(mockData.employeeId, mockData.tenantId).then((directDeposits) => {
      expect(directDeposits).toBeInstanceOf(DirectDeposits);
      expect(directDeposits.results.length).toBe(mockData.listResponseObject.recordset.length);
      expect(directDeposits.results[0]).toBeInstanceOf(DirectDeposit);
      expect(directDeposits.results[0].bankAccount).toMatchObject(new BankAccount());
      expect(directDeposits.results[0]).toEqual(mockData.expectedObjects[0]);
      expect(directDeposits.results[1]).toEqual(mockData.expectedObjects[1]);
    });
  });
});

describe('directDepositService.create', () => {
  test('creates and returns a direct deposit', () => {
    (directDepositDao as any).executeQuery = jest.fn((transaction, query) => {
      if (query.name === 'CheckForDuplicateDirectDeposits') {
        return Promise.resolve(mockData.emptyResponseObject);
      } else if (query.name === 'DirectDepositCreate') {
        return Promise.resolve(mockData.scopeIdentityResponseObject);
      } else {
        return Promise.resolve(mockData.postResponseObject);
      }
    });
    return directDepositService.create(mockData.employeeId, mockData.tenantId, mockData.postObject).then((directDeposit) => {
      expect(directDeposit).toBeInstanceOf(DirectDeposit);
      expect(directDeposit.bankAccount).toMatchObject(new BankAccount());
      expect(directDeposit).toEqual(mockData.expectedObjects[0]);
    });
  });

  test('returns a 409 error when a record already exists with the same routing or account number', () => {
    (directDepositDao as any).executeQuery = jest.fn((params: any) => {
      return Promise.resolve(mockData.postResponseObject);
    });
    return directDepositService.create(mockData.employeeId, mockData.tenantId, mockData.postObject).catch((error: any) => {
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
});

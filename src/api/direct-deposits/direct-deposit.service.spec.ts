import * as configService from '../../config.service';
import * as utilService from '../../util.service';
import * as directDepositDao from './direct-deposit.dao';
import * as directDepositService from './direct-deposit.service';

import { ConnectionPool } from 'mssql';
import { BankAccount } from '../../models/BankAccount';
import { DirectDeposit } from './directDeposit';
import { DirectDeposits } from './directDeposits';

const tenantId: string = 'c807d7f9-b391-4525-ac0e-31dbc0cf202b';
const employeeId: string = '113';
const responseObject = {
  recordsets: [
    [
      [
        {
          id: '37',
          amount: '9000',
          routingNumber: '211274450',
          accountNumber: '49309909',
          accountHolder: 'Roger Dodger',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Checking'
        }
      ],
      [
        {
          id: '38',
          amount: '100',
          routingNumber: '211274450',
          accountNumber: '490909909',
          accountHolder: 'Roger Dodger',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Savings'
        }
      ]
    ]
  ],
  recordset: [
    {
      id: '37',
      amount: '9000',
      routingNumber: '211274450',
      accountNumber: '49309909',
      accountHolder: 'Roger Dodger',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Checking'
    },
    {
      id: '38',
      amount: '100',
      routingNumber: '211274450',
      accountNumber: '490909909',
      accountHolder: 'Roger Dodger',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Savings'
    }
  ],
  output: {},
  rowsAffected: [
    2
  ]
};

const expectedObjects = [
  {
    id: 37,
    amount: 9000,
    bankAccount: {
      routingNumber: 211274450,
      accountNumber: 49309909,
      designation: 'Checking',
      accountHolder: 'Roger Dodger',
    },
    amountType: 'Flat',
    status: 'No Status'
  },
  {
    id: 38,
    amount: 100,
    bankAccount: {
      routingNumber: 211274450,
      accountNumber: 490909909,
      designation: 'Savings',
      accountHolder: 'Roger Dodger'
    },
    amountType: 'Flat',
    status: 'No Status'
  }
];

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

(directDepositDao as any).executeQuery = jest.fn((params: any) => {
  return Promise.resolve(responseObject);
});

describe('directDepositService.list', () => {
  test('returns direct deposits', () => {
    return directDepositService.list(employeeId, tenantId).then((directDeposits) => {
      console.log(directDeposits);
      expect(directDeposits).toBeInstanceOf(DirectDeposits);
      expect(directDeposits.results.length).toBe(responseObject.recordset.length);
      expect(directDeposits.results[0]).toBeInstanceOf(DirectDeposit);
      expect(directDeposits.results[0].bankAccount).toMatchObject(new BankAccount());
      expect(directDeposits.results[0]).toEqual(expectedObjects[0]);
      expect(directDeposits.results[1]).toEqual(expectedObjects[1]);
    });
  });
});

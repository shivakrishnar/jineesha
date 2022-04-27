/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as service from '../src/tenants.service';
import { setup } from '../../../unit-test-mocks/mock';
import { mockSdkMethod, dynamoResult } from '../../../unit-test-mocks/aws-sdk-mock';
import { ErrorMessage } from '../../../errors/errorMessage';

// mock data
const dynamoScanItems = [
    {
        ID: '123',
        Status: 'Pending',
        Details: {
            source: {
                tenantId: '12345',
                companyId: '1',
            },
            destination: {
                tenantId: '23456',
                companyId: '450',
            },
        },
        Timestamp: '2022-04-21T19:57:01.472Z',
    },
    {
        ID: '456',
        Status: 'Success',
        Details: {
            source: {
                tenantId: '56789',
                companyId: '2',
            },
            destination: {
                tenantId: '67890',
                companyId: '900',
            },
        },
        Timestamp: '2022-04-20T19:57:01.472Z',
    }
];

const endpointResult = [
    {
        id: '123',
        status: 'Pending',
        source: {
            tenantId: '12345',
            companyId: '1',
        },
        destination: {
            tenantId: '23456',
            companyId: '450',
        },
        timestamp: '2022-04-21T19:57:01.472Z',
    },
    {
        id: '456',
        status: 'Success',
        source: {
            tenantId: '56789',
            companyId: '2',
        },
        destination: {
            tenantId: '67890',
            companyId: '900',
        },
        timestamp: '2022-04-20T19:57:01.472Z',
    }
]

describe('list', () => {
    beforeEach(() => {
        setup();
    })

    test('returns a list of company migrations', () => {
	    mockSdkMethod('dynamodb', 'scan', () => {
            return dynamoResult(dynamoScanItems);
        });

        return service.listCompanyMigrations().then((migrations) => {
            expect(migrations).toEqual(endpointResult);
        });
    });

    test('throws an error if the dynamodb scan fails', async (done) => {
	    mockSdkMethod('dynamodb', 'scan', () => {
            throw 'error!';
        });

        await service.listCompanyMigrations()
        .then(() => {
            done.fail('Test should throw an exception');
        })
        .catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(500);
            expect(error.code).toEqual(0);
            expect(error.message).toEqual('Unexpected error occurred.');
            expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
        })
        done();
    });
});

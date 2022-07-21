/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'; // required by asure.auth dependency
import * as service from '../src/company.service';
import { setup } from '../../../unit-test-mocks/mock';
import { ErrorMessage } from '../../../errors/errorMessage';
import { mockSdkMethod, promiseResult } from '../../../unit-test-mocks/aws-sdk-mock';
import * as fs from '../../../../__mocks__/fs';
import * as utilService from '../../../util.service';
import * as errorService from '../../../errors/error.service';

jest.mock('fs');

//mock data
const migrationInputData = {
    Details: {
        source: {
            tenantId: '12345',
            companyId: '1',
        },
        destination: {
            tenantId: '23456',
            companyId: '450',
        },
        migrationId: 1,
    },
};

describe('company migration creation ', () => {
    beforeEach(() => {
        setup();
        fs.__forceError(false);
    });
    test('successful if it return nothing (no error)', async (done) => {
        mockSdkMethod('dynamodb', 'put', () => {
            return promiseResult();
        });
        await service
            .createCompanyMigration(
                migrationInputData.Details.source.tenantId,
                migrationInputData.Details.source.companyId,
                migrationInputData.Details.destination.tenantId,
                migrationInputData.Details.destination.companyId,
                migrationInputData.Details.migrationId,
            )
            .catch(() => {
                done.fail('success');
            });
        done();
    });

    test('throws an error if invokeInternalService failed', async (done) => {
        (utilService as any).invokeInternalService = jest.fn(() => {
            throw errorService.getErrorResponse(0);
        });
        await service
            .createCompanyMigration(
                migrationInputData.Details.source.tenantId,
                migrationInputData.Details.source.companyId,
                migrationInputData.Details.destination.tenantId,
                migrationInputData.Details.destination.companyId,
                migrationInputData.Details.migrationId,
            )
            .then(() => {
                done.fail('Test should throw an exception.');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
        done();
    });
});

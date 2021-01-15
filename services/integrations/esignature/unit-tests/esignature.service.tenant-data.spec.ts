import 'reflect-metadata'; // required by asure.auth dependency

import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.tenant-data.get', () => {
    beforeEach(() => {
        setup();
    });

    test('returns tenant e-signature data for direct clients', () => {
        return esignatureService.getTenantEsignatureData(mockData.directClientTenantId).then((data) => {
            expect(data).toEqual(mockData.directClientResponse);
        });
    });

    test('returns tenant e-signature data for indirect clients', () => {
        return esignatureService.getTenantEsignatureData(mockData.indirectClientTenantId).then((data) => {
            expect(data).toEqual(mockData.indirectClientResponse);
        });
    });

    test('returns a 404 if the provided tenant id does not exist', () => {
        return esignatureService.getTenantEsignatureData(mockData.nonExistentTenantId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.message).toEqual('The requested resource does not exist.');
            expect(error.developerMessage).toEqual('Connection string not found for tenant');
        });
    });
});

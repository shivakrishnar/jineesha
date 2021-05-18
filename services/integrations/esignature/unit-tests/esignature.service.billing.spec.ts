import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.billing.generate-report', () => {
    beforeEach(() => {
        setup();
    });

    test('generates a billing report', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getBillableSignRequests') {
                return Promise.resolve(mockData.billableSignRequestDBResponse);
            }
        });

        return esignatureService
            .generateBillingReport({ returnReport: true, targetEmail: 'test@test.com', month: 0, year: 0 })
            .then((results) => {
                expect(typeof results).toBe('string');
                expect(results).toEqual('Domain,Company,Billable Documents\r\nTest,HRN IT Services (1),2\r\n');
            });
    });
});

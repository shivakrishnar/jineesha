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

                const expectedCsv = [];
                expectedCsv.push('Domain,Company,Billable Documents');
                expectedCsv.push('Test,HRN IT Services (0),2');
                // deleted companies
                expectedCsv.push('Test,Company One (1),15'); // non-legacy
                expectedCsv.push('Test,Company Two (2),5'); // legacy
                expectedCsv.push('Test,Company Three (3),0'); // no requests, enhanced billing tier
                expectedCsv.push('Test,Company Four (4),0'); // no requests, simple billing tier, has existing billing events
                expect(results).toEqual(expectedCsv.join('\r\n') + '\r\n');
                expect(results).not.toContain('Test,Company Five (5),0');
            });
    });
});

import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';

describe('esignatureService.product-tier.update', () => {
    beforeEach(() => {
        setup();
    });

    test('updates the e-signature product tier for a legacy company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.esignatureProductTierDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateEsignatureProductTierDBResponse);
            }
        });
        (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
            return mockData.legacyCompanyInfo.recordset[0];
        });

        return esignatureService
            .updateEsignatureProductTier(mockData.tenantId, mockData.companyId, mockData.userEmail, mockData.esignatureProductTierRequest)
            .then((productTier) => {
                expect(productTier).toEqual(mockData.esignatureProductTierResponse);
            });
    });

    test('removes hellosign documents for a non-legacy company from task list when e-signature is disabled', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.esignatureProductTierDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'removeHelloSignTemplatesFromTaskList') {
                return Promise.resolve(mockData.esignatureProductTierDBResponse);
            }
        });
        (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
            return mockData.companyInfo.recordset[0];
        });

        return esignatureService
            .updateEsignatureProductTier(mockData.tenantId, mockData.companyId, mockData.userEmail, mockData.esignatureProductTierRequest)
            .then((productTier) => {
                expect(productTier).toEqual(mockData.esignatureProductTierResponse);
            });
    });

    test('returns a 404 if the provided product tier does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateEsignatureProductTierDBResponse);
            }
        });

        return esignatureService
            .updateEsignatureProductTier(mockData.tenantId, mockData.companyId, mockData.userEmail, mockData.esignatureProductTierRequest)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('E-Signature product tier with ID 1 not found.');
            });
    });
});

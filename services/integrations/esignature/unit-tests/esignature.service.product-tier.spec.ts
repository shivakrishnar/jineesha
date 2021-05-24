import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';

describe('esignatureService.product-tier.update', () => {
    beforeEach(() => {
        setup();
    });

    test('updates the e-signature product tier for a legacy company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.simpleEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateToSimpleEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'getBillingEventTypeByName') {
                return Promise.resolve(mockData.getBillingEventTypeDBResponse(2, 'EnhancedEsignatureDisabled'));
            }
        });
        (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
            return mockData.legacyCompanyInfo.recordset[0];
        });

        const updateQuery = new ParameterizedQuery('updateCompanyEsignatureProductTier', Queries.updateCompanyEsignatureProductTier);
        updateQuery.setParameter('@esignatureProductTierId', 1);
        updateQuery.setParameter('@companyId', mockData.companyId);
        const updatePayload = {
            tenantId: mockData.tenantId,
            queryName: updateQuery.name,
            query: updateQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const createQuery = new ParameterizedQuery('createBillingEventForCompany', Queries.createBillingEventForCompany);
        createQuery.setParameter('@companyId', mockData.companyId);
        createQuery.setParameter('@billingEventTypeId', 2);
        const createPayload = {
            tenantId: mockData.tenantId,
            queryName: createQuery.name,
            query: createQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService
            .updateEsignatureProductTier(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                mockData.simpleEsignatureProductTierRequest,
            )
            .then((productTier) => {
                expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                    'queryExecutor',
                    updatePayload,
                    utilService.InvocationType.RequestResponse,
                );
                expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                    'queryExecutor',
                    createPayload,
                    utilService.InvocationType.RequestResponse,
                );
                expect(productTier).toEqual(mockData.simpleEsignatureProductTierResponse);
            });
    });

    test('removes hellosign documents for a non-legacy company from task list when e-signature is disabled', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.simpleEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateToSimpleEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'removeHelloSignTemplatesFromTaskList') {
                return Promise.resolve(mockData.simpleEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'getBillingEventTypeByName') {
                return Promise.resolve(mockData.getBillingEventTypeDBResponse(2, 'EnhancedEsignatureDisabled'));
            }
        });
        (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
            return mockData.companyInfo.recordset[0];
        });

        const updateQuery = new ParameterizedQuery('updateCompanyEsignatureProductTier', Queries.updateCompanyEsignatureProductTier);
        updateQuery.setParameter('@esignatureProductTierId', 1);
        updateQuery.setParameter('@companyId', mockData.companyId);
        const updatePayload = {
            tenantId: mockData.tenantId,
            queryName: updateQuery.name,
            query: updateQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const createQuery = new ParameterizedQuery('createBillingEventForCompany', Queries.createBillingEventForCompany);
        createQuery.setParameter('@companyId', mockData.companyId);
        createQuery.setParameter('@billingEventTypeId', 2);
        const createPayload = {
            tenantId: mockData.tenantId,
            queryName: createQuery.name,
            query: createQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService
            .updateEsignatureProductTier(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                mockData.simpleEsignatureProductTierRequest,
            )
            .then((productTier) => {
                expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                    'queryExecutor',
                    updatePayload,
                    utilService.InvocationType.RequestResponse,
                );
                expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                    'queryExecutor',
                    createPayload,
                    utilService.InvocationType.RequestResponse,
                );
                expect(productTier).toEqual(mockData.simpleEsignatureProductTierResponse);
            });
    });

    test('returns a 404 if the provided product tier does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.emptyDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateToSimpleEsignatureProductTierDBResponse);
            }
        });

        return esignatureService
            .updateEsignatureProductTier(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                mockData.simpleEsignatureProductTierRequest,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('E-Signature product tier with ID 1 not found.');
            });
    });

    test('creates a BillingEvent when enhanced e-signature is enabled', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.enhancedEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateToEnhancedEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'getBillingEventTypeByName') {
                return Promise.resolve(mockData.getBillingEventTypeDBResponse(1, 'EnhancedEsignatureEnabled'));
            }
        });
        (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
            const company = Object.assign({}, mockData.legacyCompanyInfo.recordset[0]);
            company.EsignatureProductTierID = 1;
            return company;
        });

        const updateQuery = new ParameterizedQuery('updateCompanyEsignatureProductTier', Queries.updateCompanyEsignatureProductTier);
        updateQuery.setParameter('@esignatureProductTierId', 2);
        updateQuery.setParameter('@companyId', mockData.companyId);
        const updatePayload = {
            tenantId: mockData.tenantId,
            queryName: updateQuery.name,
            query: updateQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const createQuery = new ParameterizedQuery('createBillingEventForCompany', Queries.createBillingEventForCompany);
        createQuery.setParameter('@companyId', mockData.companyId);
        createQuery.setParameter('@billingEventTypeId', 1);
        const createPayload = {
            tenantId: mockData.tenantId,
            queryName: createQuery.name,
            query: createQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService
            .updateEsignatureProductTier(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                mockData.enhancedEsignatureProductTierRequest,
            )
            .then((productTier) => {
                expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                    'queryExecutor',
                    updatePayload,
                    utilService.InvocationType.RequestResponse,
                );
                expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                    'queryExecutor',
                    createPayload,
                    utilService.InvocationType.RequestResponse,
                );
                expect(productTier).toEqual(mockData.enhancedEsignatureProductTierResponse);
            });
    });

    test('returns a 500 if the billing event type does not exist', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getEsignatureProductTierById') {
                return Promise.resolve(mockData.enhancedEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'updateCompanyEsignatureProductTier') {
                return Promise.resolve(mockData.updateToEnhancedEsignatureProductTierDBResponse);
            } else if (payload.queryName === 'getBillingEventTypeByName') {
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });
        (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
            const company = Object.assign({}, mockData.legacyCompanyInfo.recordset[0]);
            company.EsignatureProductTierID = 1;
            return company;
        });

        return esignatureService
            .updateEsignatureProductTier(
                mockData.tenantId,
                mockData.companyId,
                mockData.userEmail,
                mockData.enhancedEsignatureProductTierRequest,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
            });
    });
});

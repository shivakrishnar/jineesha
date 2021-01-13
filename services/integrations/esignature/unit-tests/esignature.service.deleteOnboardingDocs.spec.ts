import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';
import * as listSignatureRequests from './mock-functions/hellosign-list-requests';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';
import { InvocationType } from '../../../util.service';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { Queries } from '../../../queries/queries';

describe('esignatureService.deleteOnboardingDocuments', () => {
    beforeEach(() => {
        setup();
    });

    test('delete onboarding signed documents when multiple documents are present', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            if (payload.queryName === 'getIncompleteOnboardingsByCompanyIdAndKey') {
                return Promise.resolve({ recordset: [true] }); //just need a non-empty recordset
            }
            if (payload.queryName === 'GetOnboardingSimpleSignDocuments') {
                return Promise.resolve(mockData.onboardingSimpleSignDBResponse);
            }
            if (payload.queryName === 'getNonApprovedOnboardingByKey') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
        });
        const expectedNumberOfMockSigRequestIds = 2;
        if (mockData.helloSignSignatureRequestsIdList.length != expectedNumberOfMockSigRequestIds) {
            throw new Error(
                'Ensure that all the request IDs are present in the requestIds string, and that the expectedNumberOfMockSigRequestIds has been updated',
            );
        }
        if (mockData.helloSignSignatureRequestsIdList.length != mockData.helloSignSignatureRequests.length) {
            throw new Error('Ensure that all the mock signature requests have a matching ID in mockData.helloSignSignatureRequestIdList');
        }
        const requestIds = `${mockData.helloSignSignatureRequestsIdList[0]},${mockData.helloSignSignatureRequestsIdList[1]},`;
        const query = new ParameterizedQuery('deleteEsignatureMetadataByIdList', Queries.deleteEsignatureMetadataByIdList);
        query.setStringParameter('@idList', requestIds);
        const payload = {
            tenantId: mockData.tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService.deleteOnboardingDocuments(mockData.tenantId, mockData.companyId, mockData.obKey).then(() => {
            expect(utilService.invokeInternalService).toHaveBeenCalledWith('queryExecutor', payload, InvocationType.RequestResponse);
            expect(listSignatureRequests).toHaveBeenCalledWith({ query: `metadata:${mockData.obKey}` });
        });
    });

    test('delete onboarding signed documents when only one document is present', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
            if (payload.queryName === 'getIncompleteOnboardingsByCompanyIdAndKey') {
                return Promise.resolve({ recordset: [true] }); //just need a non-empty recordset
            }
            if (payload.queryName === 'GetOnboardingSimpleSignDocuments') {
                return Promise.resolve(mockData.onboardingSimpleSignDBResponse);
            }
            if (payload.queryName === 'getNonApprovedOnboardingByKey') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
        });
        if (mockData.helloSignSignatureRequestsIdList[0] != mockData.helloSignSignatureRequests[0].signature_request_id) {
            throw new Error(
                "Ensure that the first mock signature request's ID matches the first ID in mockData.helloSignSignatureRequestIdList",
            );
        }

        const requestIds = `${mockData.helloSignSignatureRequestsIdList[0]},`;
        const query = new ParameterizedQuery('deleteEsignatureMetadataByIdList', Queries.deleteEsignatureMetadataByIdList);
        query.setStringParameter('@idList', requestIds);
        const payload = {
            tenantId: mockData.tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService.deleteOnboardingDocuments(mockData.tenantId, mockData.companyId, mockData.obKeyOneResult).then(() => {
            expect(utilService.invokeInternalService).toHaveBeenCalledWith('queryExecutor', payload, InvocationType.RequestResponse);
            expect(listSignatureRequests).toHaveBeenCalledWith({ query: `metadata:${mockData.obKeyOneResult}` });
        });
    });

    // test just one of the behaviors of validateCompany to make sure it's being called & we're handling errors, other validateCompany behavior covered in other tests
    test('returns a 400 if companyId is not integral', () => {
        return esignatureService.deleteOnboardingDocuments(mockData.tenantId, 'abc123', mockData.obKey).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(400);
            expect(error.code).toEqual(30);
            expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
            expect(error.developerMessage).toEqual('abc123 is not a valid number');
        });
    });

    test('returns a 404 if an incomplete onboarding matching the given key could not be found', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getIncompleteOnboardingsByCompanyIdAndKey') {
                return Promise.resolve({ recordset: [] });
            }
        });
        return esignatureService.deleteOnboardingDocuments(mockData.tenantId, mockData.companyId, mockData.obKey).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(404);
            expect(error.code).toEqual(50);
            expect(error.developerMessage).toEqual(`No incomplete onboarding with key ${mockData.obKey} could be found`);
        });
    });
});

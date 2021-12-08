import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { setup } from '../../../unit-test-mocks/mock';
import { InvocationType } from '../../../util.service';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { Queries } from '../../../queries/queries';
import { cancelMock } from '../../__mocks__/mockFunctions/helloSignCancelSignatureRequest';

describe('esignatureService.deleteSignatureRequest', () => {
    beforeEach(() => {
        setup();
    });

    test('delete pending simple signature request', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'CancelSignatureRequestById') {
                return Promise.resolve({});
            } else if (payload.queryName === 'GetEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureSimpleSignMetadataDBResponse);
            } else if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
        });

        const mockRequestId = `${mockData.esignatureSimpleSignMetadataDBResponse.recordset[0].ID}`;

        const query = new ParameterizedQuery('CancelSignatureRequestById', Queries.cancelSignatureRequestById);
        query.setStringParameter('@documentId', mockRequestId);
        const payload = {
            tenantId: mockData.tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService
            .deleteSignatureRequest(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockRequestId,
                {
                    tenantId: mockData.tenantId,
                    companyId: mockData.companyId,
                    employeeId: mockData.employeeId,
                    documentId: mockData.signatureRequestId,
                },
                mockData.userEmail,
                'issatoken',
            )
            .then(() => {
                expect(utilService.invokeInternalService).toHaveBeenCalledWith('queryExecutor', payload, InvocationType.RequestResponse);
            });
    });

    test('delete pending enhanced signature request', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'CancelSignatureRequestById') {
                return Promise.resolve({});
            } else if (payload.queryName === 'GetEsignatureMetadataById') {
                return Promise.resolve(mockData.esignatureEnhancedSignMetadataDBResponse);
            } else if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            } else if (payload.queryName === 'GetEmployeeByCompanyIdAndId') {
                return Promise.resolve(mockData.employeeDBResponse);
            }
        });

        const mockRequestId = `${mockData.esignatureSimpleSignMetadataDBResponse.recordset[0].ID}`;
        const query = new ParameterizedQuery('CancelSignatureRequestById', Queries.cancelSignatureRequestById);
        query.setStringParameter('@documentId', mockRequestId);
        const payload = {
            tenantId: mockData.tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        return esignatureService
            .deleteSignatureRequest(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockRequestId,
                {
                    tenantId: mockData.tenantId,
                    companyId: mockData.companyId,
                    employeeId: mockData.employeeId,
                    documentId: mockData.signatureRequestId,
                },
                mockData.userEmail,
                'issatoken',
            )
            .then(() => {
                expect(utilService.invokeInternalService).toHaveBeenCalledWith('queryExecutor', payload, InvocationType.RequestResponse);
                expect(cancelMock).toHaveBeenCalledWith(mockRequestId);
            });
    });
});

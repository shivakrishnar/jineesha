import 'reflect-metadata'; // required by asure.auth dependency

import { setup } from '../../../unit-test-mocks/mock';
import * as utilService from '../../../util.service';
import * as service from '../src/employee.service';
import * as mockData from './mock-data';

describe('updateEmployeeLicenseById service', () => {
    beforeEach(() => {
        setup();
    });

    test('should throw error for invalid id', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn();

        return service
            .updateEmployeeLicenseById(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.invalidId,
                mockData.updateEmailAcknowledgedLicenseBody,
            )
            .catch((error) => {
                expect(error).toEqual({
                    statusCode: 400,
                    code: 30,
                    message: 'The provided request object was not valid for the requested operation.',
                    developerMessage: `${mockData.invalidId} is not a valid id.`,
                    moreInfo: '',
                });
            });
    });

    test('should throw error for id not found', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn();
        (utilService as any).invokeInternalService = jest.fn(() => mockData.emptyLicenseResult);

        return service
            .updateEmployeeLicenseById(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.validId,
                mockData.updateEmailAcknowledgedLicenseBody,
            )
            .catch((error) => {
                expect(error).toEqual({
                    statusCode: 404,
                    code: 50,
                    message: 'The requested resource does not exist.',
                    developerMessage: `License with ID ${mockData.validId} not found.`,
                    moreInfo: '',
                });
            });
    });

    test('should return result', () => {
        (utilService as any).validateEmployeeWithCompany = jest.fn();
        (utilService as any).invokeInternalService = jest.fn(() => mockData.validUpdateEmailAcknowledgedLicenseResult);

        return service
            .updateEmployeeLicenseById(
                mockData.tenantId,
                mockData.companyId,
                mockData.employeeId,
                mockData.validId,
                mockData.updateEmailAcknowledgedLicenseBody,
            )
            .then((response) => {
                expect(response).toEqual({
                    id: parseInt(mockData.validId),
                    oldEmailAcknowledged: mockData.validUpdateEmailAcknowledgedLicenseResult.recordsets[0][0].EmailAcknowledged === '1',
                    newEmailAcknowledged: mockData.validUpdateEmailAcknowledgedLicenseResult.recordsets[1][0].EmailAcknowledged === '1',
                });
            });
    });
});

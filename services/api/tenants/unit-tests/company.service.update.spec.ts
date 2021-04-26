import 'reflect-metadata'; // required by asure.auth dependency

import * as hellosignService from '../../../remote-services/hellosign.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as utilService from '../../../util.service';
import * as companyService from '../src/company.service';
import * as mockData from './mock-data/mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from '../../../unit-test-mocks/mock';
import { PatchInstruction } from '../src/patchInstruction';

describe('company.service.update.platform.integration', () => {
    beforeEach(() => {
        setup();
    });

    test('updates a configuration for a company', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfoByEvoCompanyCode') {
                if (payload.tenantId === mockData.oldTenantId) {
                    return Promise.resolve(mockData.oldCompanyDBResponse);
                } else {
                    return Promise.resolve(mockData.newCompanyDBResponse);
                }
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((tenantId) => {
            if (tenantId === mockData.oldTenantId) {
                return mockData.oldIntegrationConfiguration;
            } else {
                return mockData.newIntegrationConfiguration;
            }
        });

        (hellosignService as any).getApplicationForCompany = jest.fn((hsAppId) => {
            if (hsAppId === mockData.oldIntegrationConfiguration.integrationDetails.eSignatureAppClientId) {
                return mockData.oldHsApp;
            } else {
                return mockData.newHsApp;
            }
        });

        await companyService
            .companyUpdate(mockData.oldTenantId, mockData.companyCode, mockData.platformIntegrationPatchInstructions)
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('throws a 400 when no value (new tenant ID) is provided', async () => {
        const instruction: PatchInstruction = Object.assign({}, mockData.platformIntegrationPatchInstructions[0]);
        instruction.value = undefined;

        await companyService.companyUpdate(mockData.oldTenantId, mockData.companyCode, [instruction]).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.statusCode).toEqual(400);
            expect(error.code).toEqual(30);
            expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
            expect(error.developerMessage).toEqual('Expected value to equal newTenantId');
        });
    });

    test('throws a 404 when old integration configuration is not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfoByEvoCompanyCode') {
                if (payload.tenantId === mockData.oldTenantId) {
                    return Promise.resolve(mockData.oldCompanyDBResponse);
                } else {
                    return Promise.resolve(mockData.newCompanyDBResponse);
                }
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((tenantId) => {
            if (tenantId === mockData.oldTenantId) {
                return undefined;
            } else {
                return mockData.newIntegrationConfiguration;
            }
        });

        await companyService
            .companyUpdate(mockData.oldTenantId, mockData.companyCode, mockData.platformIntegrationPatchInstructions)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('oldIntegrationConfiguration not found for this company');
            });
    });

    test('throws a 404 when new integration configuration is not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfoByEvoCompanyCode') {
                if (payload.tenantId === mockData.oldTenantId) {
                    return Promise.resolve(mockData.oldCompanyDBResponse);
                } else {
                    return Promise.resolve(mockData.newCompanyDBResponse);
                }
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((tenantId) => {
            if (tenantId === mockData.oldTenantId) {
                return mockData.oldIntegrationConfiguration;
            } else {
                return undefined;
            }
        });

        await companyService
            .companyUpdate(mockData.oldTenantId, mockData.companyCode, mockData.platformIntegrationPatchInstructions)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('newIntegrationConfiguration not found for this company');
            });
    });

    test('performs rollback when error occurs', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfoByEvoCompanyCode') {
                if (payload.tenantId === mockData.oldTenantId) {
                    return Promise.resolve(mockData.oldCompanyDBResponse);
                } else {
                    return Promise.resolve(mockData.newCompanyDBResponse);
                }
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((tenantId) => {
            if (tenantId === mockData.oldTenantId) {
                return mockData.oldIntegrationConfiguration;
            } else {
                return mockData.newIntegrationConfiguration;
            }
        });

        (hellosignService as any).getApplicationForCompany = jest.fn((hsAppId) => {
            if (hsAppId === mockData.oldIntegrationConfiguration.integrationDetails.eSignatureAppClientId) {
                return mockData.oldHsApp;
            } else {
                return mockData.newHsApp;
            }
        });

        mockData.platformIntegrationPatchInstructions.push(mockData.testPatchInstruction);

        await companyService
            .companyUpdate(mockData.oldTenantId, mockData.companyCode, mockData.platformIntegrationPatchInstructions)
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(500);
                expect(error.code).toEqual(0);
                expect(error.message).toEqual('Unexpected error occurred.');
                expect(error.developerMessage).toEqual('Something happened on the server and we have no idea what. Blame the architect.');
                expect(error.moreInfo).toEqual('Manual failure for unit tests');
            });
    });
});

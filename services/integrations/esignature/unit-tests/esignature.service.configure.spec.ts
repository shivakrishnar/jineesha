import * as errorService from '../../../errors/error.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import * as utilService from '../../../util.service';
import * as esignatureService from '../src/esignature.service';
import * as mockData from './mock-data';

import { ErrorMessage } from '../../../errors/errorMessage';
import { setup } from './mock';

describe('esignatureService.configure.add', () => {
    beforeEach(() => {
        setup();
    });

    test('updates a configuration for a company', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.addConfigurationRequest, 'adminToken')
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('adds a configuration for a company', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((params) => {
            return undefined;
        });

        esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.addConfigurationRequest, 'adminToken')
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('throws an error if one occurs while adding a configuration', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            throw errorService.getErrorResponse(0);
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((params) => {
            return undefined;
        });

        (integrationsService as any).createIntegrationConfiguration = jest.fn((params) => {
            throw new Error('Manually throw an error');
        });

        await esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.addConfigurationRequest, 'adminToken')
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
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

    test('throws an error if one occurs', async (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            throw errorService.getErrorResponse(0);
        });

        await esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.addConfigurationRequest, 'adminToken')
            .then(() => {
                done.fail(new Error('Test should throw an exception.'));
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

describe('esignatureService.configure.remove', () => {
    beforeEach(() => {
        setup();
    });

    test('removes a configuration for a company', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.removeConfigurationRequest, 'adminToken')
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('returns a 404 if a configuration does not exist for a company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((params) => {
            return undefined;
        });

        return esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.removeConfigurationRequest, 'adminToken')
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('No existing e-signature configuration found');
            });
    });
});

describe('esignatureService.configure.delete', () => {
    beforeEach(() => {
        setup();
    });

    test('deletes a configuration for a company', (done) => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.deleteConfigurationRequest, 'adminToken')
            .catch(() => {
                done.fail(new Error('Test should not throw an exception.'));
            });
        done();
    });

    test('returns a 404 if a configuration does not exist for a company', () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'GetCompanyInfo') {
                return Promise.resolve(mockData.companyInfo);
            }
        });

        (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((params) => {
            return undefined;
        });

        return esignatureService
            .configure(mockData.tenantId, mockData.companyId, 'token', mockData.deleteConfigurationRequest, 'adminToken')
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(404);
                expect(error.code).toEqual(50);
                expect(error.message).toEqual('The requested resource does not exist.');
                expect(error.developerMessage).toEqual('No existing e-signature configuration found');
            });
    });
});

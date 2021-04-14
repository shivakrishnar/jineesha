import { IPayrollApiCredentials } from '../api/models/IPayrollApiCredentials';
import * as employeeService from '../api/tenants/src/employee.service';
import * as tenantsService from '../api/tenants/src/tenants.service';
import * as configService from '../config.service';
import * as errorService from '../errors/error.service';
import * as mockData from '../integrations/esignature/unit-tests/mock-data';
import * as paginationService from '../pagination/pagination.service';
import * as hellosignService from '../remote-services/hellosign.service';
import * as integrationsService from '../remote-services/integrations.service';
import * as utilService from '../util.service';
import * as ssoService from '../remote-services/sso.service';

export const setup = () => {
    (configService as any).getSecretsAwsEndpoint = jest.fn(() => {
        return 'https://secretsmanager.us-east-1.amazonaws.com';
    });

    (configService as any).getAwsRegion = jest.fn(() => {
        return 'us-east-1';
    });

    (configService as any).getRdsCredentials = jest.fn(() => {
        return 'xxxorwhatever';
    });

    (configService as any).getPageLimitDefault = jest.fn(() => {
        return 30;
    });

    (configService as any).getEsignatureApiCredentials = jest.fn(() => {
        return 'credentialId';
    });

    (configService as any).getFileBucketName = jest.fn(() => {
        return 'FileBucketName';
    });

    (configService as any).getSignaturePageFontUrl = jest.fn(() => {
        return 'www.awesomefonts.com';
    });

    (configService as any).getLegacyClientCutOffDate = jest.fn(() => {
        return '01/01/2020';
    });

    (configService as any).getDirectClientPricingData = jest.fn(() => {
        return mockData.directClientPricingData;
    });

    (configService as any).getIndirectClientPricingData = jest.fn(() => {
        return mockData.indirectClientPricingData;
    });
    (configService as any).getFromEmailAddress = jest.fn(() => {
        return 'random@email.com'
    });
    (configService as any).getSesSmtpCredentials = jest.fn(() => {
        return 'Mail Credents'
    });
    (configService as any).getSesSmtpServerHost = jest.fn(() => {
        return 'Mail Host'
    });
    (configService as any).getSesSmtpServerPort = jest.fn(() => {
        return '12345'
    });
    
    (utilService as any).getPayrollApiCredentials = jest.fn(() => {
        return { evoApiUsername: 'username', evoApiPassword: 'pass' } as IPayrollApiCredentials
    });

    (utilService as any).getSecret = jest.fn((params: any) => {
        return `{
        "salt": "salt",
        "apiKey": "123"
    }`;
    });

    (utilService as any).logToAuditTrail = jest.fn((params: any) => {
        return {};
    });

    (utilService as any).clearCache = jest.fn((pool: any, accessToken: string) => {
        return;
    });

    (utilService as any).getSSOToken = jest.fn((params: any) => {
        return 'token';
    });

    (utilService as any).invokeInternalService = jest.fn((params: any) => {
        return {};
    });

    (utilService as any).generateAdminToken = jest.fn((params: any) => {
        return 'token';
    });

    (utilService as any).sanitizeForS3 = jest.fn((params: any) => {
        return 'key';
    });

    (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
        if (Number.isNaN(Number(companyId))) {
            const errorMessage = `${companyId} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });

    (utilService as any).authorizeAndRunQuery = jest.fn((params: any) => {
        return [[{}]];
    });

    (utilService as any).sendEventNotification = jest.fn();

    (paginationService as any).appendPaginationFilter = jest.fn((params: any) => {
        return Promise.resolve({ name: params.name, value: params.value });
    });

    (employeeService as any).getById = jest.fn((params: any) => {
        return {};
    });

    (hellosignService as any).getTemplateEditUrlById = jest.fn((params: any) => {
        return '{ "embedded": { "edit_url": "editUrl", "expires_at": "123" } }';
    });

    (hellosignService as any).getTemplateFilesById = jest.fn((params: any) => {
        return '{ "data_uri": "my data" }';
    });

    (hellosignService as any).createApplicationForCompany = jest.fn((params: any) => {
        return { api_app: { client_id: '1234' } };
    });

    (hellosignService as any).deleteApplicationById = jest.fn((params: any) => {
        return;
    });

    (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn((params: any) => {
        return { integrationDetails: { eSignatureAppClientId: '1234' } };
    });

    (integrationsService as any).updateIntegrationConfigurationById = jest.fn((params: any) => {
        return;
    });

    (integrationsService as any).createIntegrationConfiguration = jest.fn((params: any) => {
        return;
    });

    (integrationsService as any).deleteIntegrationConfigurationbyId = jest.fn((params: any) => {
        return;
    });

    (integrationsService as any).eSignatureApiDevModeOn = jest.fn((params: any) => {
        return true;
    });

    (ssoService as any).getAccessToken = jest.fn((params: any) => {
        return 'randomaccessmemory'
    });

    (tenantsService as any).listConnectionStrings = jest.fn((params: any) => {
        return {
            Items: [
                {
                    TenantID: '1234',
                    Domain: 'Test',
                },
            ],
        };
    });
};

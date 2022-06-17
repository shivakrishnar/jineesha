import { IPayrollApiCredentials } from '../api/models/IPayrollApiCredentials';
import * as tenantsService from '../api/tenants/src/tenants.service';
import * as configService from '../config.service';
import * as errorService from '../errors/error.service';
import * as mockData from '../integrations/esignature/unit-tests/mock-data';
import * as paginationService from '../pagination/pagination.service';
import * as hellosignService from '../remote-services/hellosign.service';
import * as integrationsService from '../remote-services/integrations.service';
import * as ssoService from '../remote-services/sso.service';
import * as utilService from '../util.service';
import * as payrollService from '../remote-services/payroll.service';
import * as databaseService from '../internal-api/database/database.service';

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
        return 'random@email.com';
    });
    (configService as any).getSesSmtpCredentials = jest.fn(() => {
        return 'Mail Credents';
    });
    (configService as any).getSesSmtpServerHost = jest.fn(() => {
        return 'Mail Host';
    });
    (configService as any).getSesSmtpServerPort = jest.fn(() => {
        return '12345';
    });
    (configService as any).getDbBackupBucket = jest.fn(() => {
        return 'bucketname';
    });

    (utilService as any).getPayrollApiCredentials = jest.fn(() => {
        return { evoApiUsername: 'username', evoApiPassword: 'pass' } as IPayrollApiCredentials;
    });

    (utilService as any).getSecret = jest.fn(() => {
        return `{
        "salt": "salt",
        "apiKey": "123"
    }`;
    });

    (utilService as any).logToAuditTrail = jest.fn(() => {
        return {};
    });

    (utilService as any).clearCache = jest.fn(() => {
        return;
    });

    (utilService as any).getSSOToken = jest.fn(() => {
        return 'token';
    });

    (utilService as any).getSignedUrlSync = jest.fn(() => {
        return 'www.mysignedurl.com';
    });

    (utilService as any).invokeInternalService = jest.fn(() => {
        return {};
    });

    (utilService as any).generateAdminToken = jest.fn(() => {
        return 'token';
    });

    (utilService as any).generateAssumedRoleToken = jest.fn(() => {
        return 'token';
    });

    (utilService as any).sanitizeForS3 = jest.fn(() => {
        return 'key';
    });

    (utilService as any).validateCompany = jest.fn((tenantId, companyId) => {
        if (Number.isNaN(Number(companyId))) {
            const errorMessage = `${companyId} is not a valid number`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });

    (utilService as any).authorizeAndRunQuery = jest.fn(() => {
        return [[{}]];
    });

    (utilService as any).sendEventNotification = jest.fn();

    (paginationService as any).appendPaginationFilter = jest.fn((params: any) => {
        return Promise.resolve({ name: params.name, value: params.value });
    });

    (hellosignService as any).getTemplateEditUrlById = jest.fn(() => {
        return '{ "embedded": { "edit_url": "editUrl", "expires_at": "123" } }';
    });

    (hellosignService as any).getTemplateFilesById = jest.fn(() => {
        return '{ "data_uri": "my data" }';
    });

    (hellosignService as any).createApplicationForCompany = jest.fn(() => {
        return { api_app: { client_id: '1234' } };
    });

    (hellosignService as any).deleteApplicationById = jest.fn(() => {
        return;
    });

    (hellosignService as any).updateApplicationForCompany = jest.fn(() => {
        return;
    });

    (integrationsService as any).getIntegrationConfigurationByCompany = jest.fn(() => {
        return { integrationDetails: { eSignatureAppClientId: '1234' } };
    });

    (integrationsService as any).updateIntegrationConfigurationById = jest.fn(() => {
        return;
    });

    (integrationsService as any).createIntegrationConfiguration = jest.fn(() => {
        return;
    });

    (integrationsService as any).deleteIntegrationConfigurationbyId = jest.fn(() => {
        return;
    });

    (integrationsService as any).eSignatureApiDevModeOn = jest.fn(() => {
        return true;
    });

    (ssoService as any).getAccessToken = jest.fn(() => {
        return 'randomaccessmemory';
    });

    (payrollService as any).getEmployeeFromEvo = jest.fn(() => {
        return {
            groupTermLife: {
                hours: '2500',
                flatAmount: null,
                earningsMultiplier: '3',
            },
        };
    });

    (utilService as any).validateEmployee = jest.fn(() => {
        return Promise.resolve({});
    });

    (utilService as any).getEvoTokenWithHrToken = jest.fn(() => {
        return 'token';
    });
    (ssoService as any).getTenantById = jest.fn(() => {
        return { subdomain: 'payroll' };
    });

    (tenantsService as any).listConnectionStrings = jest.fn(() => {
        return {
            Items: [
                {
                    TenantID: '1234',
                    Domain: 'Test',
                },
            ],
        };
    });

    (databaseService as any).findConnectionString = jest.fn(() => {
        return Promise.resolve('');
    });
};

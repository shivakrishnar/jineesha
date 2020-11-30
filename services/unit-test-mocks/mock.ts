import * as employeeService from '../api/tenants/src/employee.service';
import * as configService from '../config.service';
import * as paginationService from '../pagination/pagination.service';
import * as hellosignService from '../remote-services/hellosign.service';
import * as integrationsService from '../remote-services/integrations.service';
import * as utilService from '../util.service';
import * as errorService from '../errors/error.service';

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
};

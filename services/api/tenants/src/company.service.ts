import * as AWS from 'aws-sdk';
import { Queries } from '../../../queries/queries';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Query } from '../../../queries/query';
import { Company } from './company';

import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import * as paginationService from '../../../pagination/pagination.service';
import * as hellosignService from '../../../remote-services/hellosign.service';
import { HelloSignApplication } from '../../../remote-services/hellosign.service';
import * as integrationsService from '../../../remote-services/integrations.service';
import { EsignatureAppConfiguration } from '../../../remote-services/integrations.service';
import * as utilService from '../../../util.service';
import { CompanyDetail, ICompany } from './ICompany';
import { PatchInstruction, PatchOperation } from './patchInstruction';

/**
 * Returns a listing of companies for a specific user within a tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address of the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<Companies>}: Promise of an array of companies
 */
export async function list(tenantId: string, email: string, domainName: string, path: string, queryParams: any): Promise<PaginatedResult> {
    console.info('companyService.list');

    const validQueryStringParameters = ['pageToken'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        // Get user info
        const userQuery = new ParameterizedQuery('GetUserById', Queries.getUserById);
        userQuery.setParameter('@username', email);
        const payload = {
            tenantId,
            queryName: userQuery.name,
            query: userQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const userResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );

        if (userResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Could not find user with email ${email}`);
        }

        const isGaOrSuperAdmin = userResult.recordset[0].IsGA === true || userResult.recordset[0].IsSuperAdmin === true;
        const userId = userResult.recordset[0].ID;

        const query = new Query('ListCompanies', Queries.listCompanies);

        if (!isGaOrSuperAdmin) {
            const userCompaniesQuery = new ParameterizedQuery('GetUserCompaniesById', Queries.getUserCompaniesById);
            userCompaniesQuery.setParameter('@userId', userId);
            payload.queryName = userCompaniesQuery.name;
            payload.query = userCompaniesQuery.value;
            const userCompaniesResult: any = await utilService.invokeInternalService(
                'queryExecutor',
                payload,
                utilService.InvocationType.RequestResponse,
            );

            if (userCompaniesResult.recordset.length === 0) {
                return undefined;
            }

            const companyIds = userCompaniesResult.recordset.map(({ CompanyID }) => CompanyID).join(',');
            query.appendFilter(`where ID in (${companyIds})`, false);
        }

        query.appendFilter(' order by ID', false);
        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        payload.queryName = paginatedQuery.name;
        payload.query = paginatedQuery.value;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;
        const recordSet = result.recordsets[1];

        if (recordSet.length === 0) {
            return undefined;
        }

        const companies: Company[] = recordSet.map(({ ID: id, CompanyName: name }) => {
            return { id, name } as Company;
        });

        return await paginationService.createPaginatedResult(companies, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Returns a listing of companies for a specific user within a tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address of the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<Companies>}: Promise of an array of companies
 */
export async function getById(tenantId: string, companyId: string, email: string): Promise<any> {
    console.info('companyService.getById');

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        const query = new ParameterizedQuery('GetCompanyByID', Queries.getCompanyById);
        query.setParameter('@email', email);
        query.setParameter('@companyId', companyId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Company with ID ${companyId} not found.`);
        }

        const company: any = result.recordset[0];

        // retrieve legacy client cut off date
        const ssm = new AWS.SSM({ region: configService.getAwsRegion() });
        const params = {
            Name: '/hr/esignature/simplesign/legacyClientCutOffDate',
            WithDecryption: false,
        };
        const ssmResult = await ssm.getParameter(params).promise();
        const isEsignatureLegacyCompany = new Date(company.CreateDate) < new Date(ssmResult.Parameter.Value);

        return {
            id: company.ID,
            name: company.CompanyName,
            esignatureProductTier: {
                id: company.EsignatureProductTierID,
                name: company.EsignatureProductTierName,
            },
            isEsignatureLegacyCompany,
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a company or that company's integrations
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} companyCode: The unique code for the company
 * @param {PatchInstruction[]} patch: The list of instructions the patch is should attempt to execute
 * The patch instructions will be executed in the order provided.
 * The array as a whole is atomic, if an instruction fails, all previous instructions will be rolled back.
 */
export async function companyUpdate(tenantId: string, companyCode: string, patch: PatchInstruction[]): Promise<void> {
    console.info('companyService.companyUpdate');

    const rollbackActions = [];

    try {
        for (const instruction of patch) {
            switch (instruction.path) {
                case '/platform/integration':
                    rollbackActions.push(await updateHelloSignConfigurations(tenantId, companyCode, instruction));
                    break;
                case '/test':
                    if (instruction.op === PatchOperation.Test) {
                        throw errorService.getErrorResponse(0).setMoreInfo('Manual failure for unit tests');
                    }
                    break;
                default:
                // throw unrecognized path error
            }
        }
    } catch (error) {
        let action = rollbackActions.pop();
        while (action) {
            await action();
            action = rollbackActions.pop();
        }
        if (error instanceof ErrorMessage) {
            if (error.statusCode === 404) {
                return undefined;
            }
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Updates a company's HelloSign configurations
 * @param {string} oldTenantId: The unique identifier (SSO tenantId GUID) for the old (donor) tenant
 * @param {string} evoCompanyCode: The unique code for the company
 * @param {PatchInstruction} patch: The instruction the patch should attempt to execute
 * @returns {Promise<() => void>}: A Promise of a rollback function
 */
async function updateHelloSignConfigurations(oldTenantId: string, evoCompanyCode: string, patch: PatchInstruction): Promise<() => void> {
    console.info('companyService.updateHelloSignConfigurations');

    const newTenantId = patch.value;

    if (!newTenantId) {
        throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to equal newTenantId');
    }

    const rollbackActions = [];

    try {
        const [oldCompanyInfo, newCompanyInfo, adminToken]: any[] = await Promise.all([
            getCompanyInfoByEvoCompanyCode(oldTenantId, evoCompanyCode),
            getCompanyInfoByEvoCompanyCode(newTenantId, evoCompanyCode),
            utilService.generateAdminToken(),
        ]);

        const oldIntegrationConfiguration: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            oldTenantId,
            oldCompanyInfo.clientId,
            oldCompanyInfo.id,
            adminToken,
        );
        console.log('oldIntegrationConfiguration', JSON.stringify(oldIntegrationConfiguration));

        if (!oldIntegrationConfiguration) {
            throw errorService.getErrorResponse(50).setDeveloperMessage('oldIntegrationConfiguration not found for this company');
        }

        // update new integration configuration for company with old eSignatureAppClientId
        const newIntegrationConfiguration: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            newTenantId,
            newCompanyInfo.clientId,
            newCompanyInfo.id,
            adminToken,
        );
        console.log('newIntegrationConfiguration', JSON.stringify(newIntegrationConfiguration));

        if (!newIntegrationConfiguration) {
            throw errorService.getErrorResponse(50).setDeveloperMessage('newIntegrationConfiguration not found for this company');
        }

        const newEsignatureAppClientId = newIntegrationConfiguration.integrationDetails.eSignatureAppClientId;
        const oldEsignatureAppClientId = oldIntegrationConfiguration.integrationDetails.eSignatureAppClientId;
        newIntegrationConfiguration.integrationDetails.eSignatureAppClientId = oldEsignatureAppClientId;

        await integrationsService.updateIntegrationConfigurationById(
            newTenantId,
            newCompanyInfo.clientId,
            newCompanyInfo.id,
            newIntegrationConfiguration,
            adminToken,
        );
        rollbackActions.push(async () => {
            newIntegrationConfiguration.integrationDetails.eSignatureAppClientId = newEsignatureAppClientId;
            await integrationsService.updateIntegrationConfigurationById(
                newTenantId,
                newCompanyInfo.clientId,
                newCompanyInfo.id,
                newIntegrationConfiguration,
                adminToken,
            );
        });

        const newHsApp: any = JSON.parse(await hellosignService.getApplicationForCompany(newEsignatureAppClientId));
        const oldHsApp: any = JSON.parse(await hellosignService.getApplicationForCompany(oldEsignatureAppClientId));

        // update new HelloSign app name to temp name - HelloSign does not allow apps with duplicate names
        let helloSignApplication: HelloSignApplication = {
            name: newHsApp.api_app.name + ' old',
        };
        await hellosignService.updateApplicationForCompany(newEsignatureAppClientId, helloSignApplication);
        rollbackActions.push(async () => {
            try {
                helloSignApplication = {
                    name: newHsApp.api_app.name,
                };
                await hellosignService.updateApplicationForCompany(newEsignatureAppClientId, helloSignApplication);
            } catch (error) {
                // Note: we are eating the exception here because the update will not work if the HelloSign application
                // has already been deleted. Just log the error and continue.
                console.error(error);
            }
        });

        // update old HelloSign app name and domain
        helloSignApplication = {
            name: newHsApp.api_app.name,
            domain: newHsApp.api_app.domain,
        };
        await hellosignService.updateApplicationForCompany(oldEsignatureAppClientId, helloSignApplication);
        rollbackActions.push(async () => {
            helloSignApplication = {
                name: oldHsApp.api_app.name,
                domain: oldHsApp.api_app.domain,
            };
            await hellosignService.updateApplicationForCompany(oldEsignatureAppClientId, helloSignApplication);
        });

        // delete new HelloSign app
        await hellosignService.deleteApplicationById(newEsignatureAppClientId);
        rollbackActions.push(async () => {
            const {
                api_app: { client_id: eSignatureClientId },
            } = await hellosignService.createApplicationForCompany(
                newCompanyInfo.id,
                newHsApp.api_app.domain,
                newHsApp.api_app.callback_url,
            );

            newIntegrationConfiguration.integrationDetails.eSignatureAppClientId = eSignatureClientId;
            await integrationsService.updateIntegrationConfigurationById(
                newTenantId,
                newCompanyInfo.clientId,
                newCompanyInfo.id,
                newIntegrationConfiguration,
                adminToken,
            );
        });

        // delete old integration configuration
        await integrationsService.deleteIntegrationConfigurationbyId(
            oldTenantId,
            oldCompanyInfo.clientId,
            oldCompanyInfo.id,
            oldIntegrationConfiguration,
            adminToken,
        );
        rollbackActions.push(async () => {
            await integrationsService.createIntegrationConfiguration(
                oldTenantId,
                oldCompanyInfo.clientId,
                oldCompanyInfo.id,
                oldCompanyInfo.companyName,
                oldHsApp.api_app.domain,
                oldEsignatureAppClientId,
                adminToken,
            );
        });
    } catch (error) {
        console.error(error);
        let action = rollbackActions.shift();
        while (action) {
            await action();
            action = rollbackActions.shift();
        }
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }

    // return rollback function
    return async () => {
        let action = rollbackActions.shift();
        while (action) {
            await action();
            action = rollbackActions.shift();
        }
    };
}

/**
 * Retrieves company info by EvoCompanyCode
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} companyCode: The unique code for the company
 * @returns {Promise<CompanyDetail>}: A Promise of a company's details
 */
async function getCompanyInfoByEvoCompanyCode(tenantId: string, companyCode: string): Promise<CompanyDetail> {
    console.info('companyService.getCompanyInfoByEvoCompanyCode');

    try {
        const query = new ParameterizedQuery('GetCompanyInfoByEvoCompanyCode', Queries.getCompanyInfoByEvoCompanyCode);
        query.setParameter('@evoCompanyCode', companyCode);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The company code: ${companyCode} not found`);
        }

        const companyInfo: any = result.recordset.map((entry) => {
            return {
                id: entry.ID,
                clientId: entry.PRIntegration_ClientID,
                companyName: entry.CompanyName,
            };
        })[0];

        return companyInfo;
    } catch (e) {
        throw e;
    }
}

/**
 * Retrieves a company logo document.
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} companyId: The unique (numeric) identifier for the company
 * @returns {Promise<any>}: A Promise of a document, or undefined if company not found or has no logo
 */
export async function getLogoDocument(tenantId: string, companyId: string): Promise<any> {
    console.info('companyService.getLogoDocument');

    try {
        // if companyId not an integer, it doesn't exist, so don't waste time executing a query
        if (!companyId || !String(companyId).match(/^\d+$/)) {
            return undefined;
        }

        const query = new ParameterizedQuery('GetCompanyLogo', Queries.getCompanyLogo);
        query.setParameter('@companyId', companyId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (!result || !result.recordset.length) {
            return undefined;
        }

        const base64String = result.recordset[0].FSDocument;
        const extension = result.recordset[0].Extension;

        if (!base64String) {
            return undefined;
        }

        return { base64String, extension };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            if (error.statusCode === 404) {
                return undefined;
            }
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Retrieves a list of companies for the employees a user is mapped to. (Does not include companies a user is
 * mapped to directly, without being an employee.) Note that the resultset is not paginated, because the
 * caller is expected to be another back-end service which will need the entire list and not want to make
 * multiple requests, and because the list cannot be longer than the maximum number of companies in a tenant.
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} ssoAccountId: The unique identifier (SSO accountId GUID) for the user
 * @returns {Promise<ICompany[]>}: A Promise of a list of companies, or an empty list if tenant or user not found
 */
export async function listEmployeeCompaniesBySsoAccount(tenantId: string, ssoAccountId: string): Promise<ICompany[]> {
    console.info('companyService.listEmployeeCompaniesBySsoAccount');

    try {
        const query = new ParameterizedQuery('ListEmployeeCompaniesBySsoAccount', Queries.listEmployeeCompaniesBySsoAccount);
        query.setParameter('@ssoAccountId', ssoAccountId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        // This endpoint should return an empty list (not 404) if tenant or account not found in AHR.
        // This makes it easier for the caller to handle users that exist only in another app (i.e. Evo).
        if (!result || !result.recordset.length) {
            return [];
        }

        const buildLogoUrl = (companyId: string) =>
            `${configService.getHrServicesDomain()}/internal/tenants/${tenantId}/companies/${companyId}/logo`;

        return result.recordset.map((record: any) => {
            const { companyId, companyName, evoClientId, evoCompanyId, evoCompanyCode, hasLogo } = record;
            return {
                companyId: Number(companyId),
                companyName,
                evoClientId: evoClientId || undefined,
                evoCompanyId: evoCompanyId || undefined,
                evoCompanyCode: evoCompanyCode || undefined,
                logoUrl: hasLogo ? buildLogoUrl(companyId) : undefined,
            };
        });
    } catch (error) {
        if (error instanceof ErrorMessage) {
            if (error.statusCode === 404) {
                return [];
            }
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }
}

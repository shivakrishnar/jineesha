import * as AWS from 'aws-sdk';
import { Queries } from '../../../queries/queries';
import * as crypto from 'crypto';

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
import { ssoRoles, SsoAccount } from '../../../remote-services/sso.service';
import * as pSettle from 'p-settle';
import * as ssoService from '../../../remote-services/sso.service';

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
                case '/sso/account':
                    rollbackActions.push(await handleSsoPatch(tenantId, companyCode, instruction));
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

async function handleSsoPatch(donorTenantId: string, companyCode: string, instruction: PatchInstruction): Promise<() => void> {
    console.info('companyService.handleSsoPatch');

    const recipientTenantId = instruction.value;

    if (!recipientTenantId) {
        throw errorService.getErrorResponse(30).setDeveloperMessage('Expected value to equal newTenantId');
    }

    const supportedOperations = [PatchOperation.Copy, PatchOperation.Remove];
    if (!supportedOperations.includes(instruction.op)) {
        throw errorService.getErrorResponse(71).setDeveloperMessage(`Supported patch operations: ${supportedOperations.join()}`);
    }

    const rollbackActions = [];

    try {
        await Promise.all([
            getCompanyInfoByEvoCompanyCode(donorTenantId, companyCode),
            getCompanyInfoByEvoCompanyCode(recipientTenantId, companyCode),
        ]);

        // get all hr accounts under a company from recipient database
        const usersQuery = new ParameterizedQuery('GetUserSsoIdByEvoCompanyCode', Queries.getUserSsoIdByEvoCompanyCode);
        usersQuery.setStringParameter('@companyCode', companyCode);

        const usersPayload = {
            tenantId: instruction.op === PatchOperation.Remove ? donorTenantId : recipientTenantId,
            queryName: usersQuery.name,
            query: usersQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const usersResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            usersPayload,
            utilService.InvocationType.RequestResponse,
        );

        if (usersResult.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage('No accounts found under this company');
        }

        const users = usersResult.recordset.map((record) => ({
            id: record.ID,
            key: record.PR_Integration_PK,
        }));

        const updatedUsers = [];
        const actions = [];

        const donorTenantToken = await utilService.generateAssumedRoleToken(ssoRoles.tenantAdmin, donorTenantId);
        const recipientTenantToken = await utilService.generateAssumedRoleToken(ssoRoles.tenantAdmin, recipientTenantId);

        for (const user of users) {
            if (instruction.op === PatchOperation.Copy) {
                actions.push(async () => {
                    try {
                        const account: SsoAccount = await ssoService.getSsoAccountById(user.key, donorTenantId, donorTenantToken);
                        delete account.href;
                        delete account.id;
                        delete account.tenantId;
                        // generate a cryptographically-secure temp password
                        account.password = await crypto.randomBytes(8).toString('hex');

                        const createdAccount: SsoAccount = await ssoService.createSsoAccount(
                            recipientTenantId,
                            account,
                            recipientTenantToken,
                        );
                        rollbackActions.push(async () => {
                            // Note: We cannot delete right now because the endpoint requires the user to have the asure-admin role.
                            // Disable the account instead.
                            const account: SsoAccount = { enabled: false };
                            await ssoService.updateSsoAccountById(createdAccount.id, recipientTenantId, account, recipientTenantToken);
                        });

                        // update PR_Integration_PK in recipient database
                        const query = new ParameterizedQuery('UpdateUserSsoIdById', Queries.updateUserSsoIdById);
                        query.setStringParameter('@ssoId', createdAccount.id);
                        query.setParameter('@userId', user.id);

                        const payload = {
                            tenantId: recipientTenantId,
                            queryName: query.name,
                            query: query.value,
                            queryType: QueryType.Simple,
                        } as DatabaseEvent;

                        await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
                        rollbackActions.push(async () => {
                            const query = new ParameterizedQuery('UpdateUserSsoIdById', Queries.updateUserSsoIdById);
                            query.setStringParameter('@ssoId', user.key);
                            query.setParameter('@userId', user.id);

                            const payload = {
                                tenantId: recipientTenantId,
                                queryName: query.name,
                                query: query.value,
                                queryType: QueryType.Simple,
                            } as DatabaseEvent;

                            await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
                        });

                        updatedUsers.push(user.key);
                    } catch (e) {
                        console.error(`${user.key}: ${e}`);
                    }
                });
            } else if (instruction.op === PatchOperation.Remove) {
                actions.push(async () => {
                    try {
                        const account: SsoAccount = { enabled: false };
                        await ssoService.updateSsoAccountById(user.key, donorTenantId, account, donorTenantToken);
                        rollbackActions.push(async () => {
                            account.enabled = true;
                            await ssoService.updateSsoAccountById(user.key, donorTenantId, account, donorTenantToken);
                        });
                        updatedUsers.push(user.key);
                    } catch (e) {
                        console.error(`${user.key}: ${e}`);
                    }
                });
            } else {
                return Function;
            }
        }

        await pSettle(actions);
        if (updatedUsers.length !== users.length) {
            const failedUpdates = users.filter(({ key }) => updatedUsers.indexOf(key) === -1);
            console.log(`The following user(s) failed to update ${JSON.stringify(failedUpdates)}, attempting rollback`);
            throw errorService
                .getErrorResponse(0)
                .setMoreInfo('Error occurred while performing patch operation. Check CloudWatch logs for more info.');
        }
    } catch (error) {
        console.log('Update SSO accounts failed, rolling back');
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

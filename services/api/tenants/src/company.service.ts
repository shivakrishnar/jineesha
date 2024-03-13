import * as AWS from 'aws-sdk';
import { Queries, basePath } from '../../../queries/queries';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as pathGlobal from 'path';

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
import * as ssoService from '../../../remote-services/sso.service';
import * as payrollService from '../../../remote-services/payroll.service';
import { CompanyAnnouncement } from './CompanyAnnouncement';
import { CompanyOpenEnrollment } from './CompanyOpenEnrollment';
import * as databaseService from '../../../internal-api/database/database.service';
import * as uniqueifier from 'uuid/v4';

/**
 * Returns a listing of companies for a specific user within a tenant
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address of the user.
 * @param {any} roleMemberships: The roles to which the user belongs.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @returns {Promise<Companies>}: Promise of an array of companies
 */
export async function list(tenantId: string, email: string, roleMemberships: any, domainName: string, path: string, queryParams: any): Promise<PaginatedResult> {
    console.info('companyService.list');
    let validQueryStringParameters = ['pageToken', 'search', 'pageSize'];
    const isGA = roleMemberships.indexOf('global.admin') > -1;
    if(isGA) validQueryStringParameters = [...validQueryStringParameters, 'migration', 'requestingFrom']
    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);
    let userTenant = tenantId;
    try {
        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);
            const migration = queryParams.migration && utilService.parseQueryParamsBoolean(queryParams, 'migration');
            if (migration) userTenant = queryParams.requestingFrom
        }
        
        // Get user info
        const userQuery = new ParameterizedQuery('GetUserById', Queries.getUserById);
        userQuery.setParameter('@username', email);
        
        const userPayload = {
            tenantId: userTenant,
            queryName: userQuery.name,
            query: userQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const payload = {
            tenantId,
            queryName: userQuery.name,
            query: userQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const userResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            userPayload,
            utilService.InvocationType.RequestResponse,
        );

        if (userResult.recordset.length === 0) {
            throw errorService.notFound().setDeveloperMessage(`Could not find user with email ${email}`);
        }

        const isGaOrSuperAdmin = userResult.recordset[0].IsGA === true || userResult.recordset[0].IsSuperAdmin === true;
        const userId = userResult.recordset[0].ID;

        const query = new ParameterizedQuery('ListCompanies', Queries.listCompanies);
        const searchString = queryParams?.search || '';
        query.setStringParameter('@search', searchString);

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
            query.appendFilter(`ID in (${companyIds})`, true);
        }

        query.appendFilter(' order by ID', false);
        let paginatedQuery;
        if (queryParams?.pageSize) {
            let pageSize = queryParams.pageSize;
            if (queryParams.pageSize === 'all') {
                paginatedQuery = query;
            } else {
                pageSize = parseInt(pageSize)
                paginatedQuery = await paginationService.appendPaginationFilter(query, page, false, pageSize)
            }
        } else {
            paginatedQuery = await paginationService.appendPaginationFilter(query, page);
        }
        payload.queryName = paginatedQuery.name;
        payload.query = paginatedQuery.value;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        const totalCount = result.recordsets[0][0].totalCount;
        const recordSet = result.recordsets[1];

        if (recordSet.length === 0) {
            return undefined;
        }

        const companies: Company[] = recordSet.map(
            ({ ID: id, CompanyName: name, PRIntegrationCompanyCode: code, CreateDate: createDate }) => {
                return { id, name, code, createDate } as Company;
            },
        );

        const pageSize = queryParams?.pageSize;

        return await paginationService.createPaginatedResult(companies, baseUrl, totalCount, page, pageSize);
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
            productTierId: company.ProductTierID,
            isLandingSectionOnUpcomingTimeOff: company.IsLandingSectionOnUpcomingTimeOff,
            IsLandingSectionOnAnnouncements: company.IsLandingSectionOnAnnouncements,
            clientId: company.PRIntegration_ClientID,
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
 * Retrieves company info by companyId
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} companyId: The unique identifier for the company
 * @returns {Promise<CompanyDetail>}: A Promise of a company's details
 */
async function getCompanyInfoByCompanyId(tenantId: string, companyId: string): Promise<CompanyDetail> {
    console.info('companyService.getCompanyInfoByCompanyId');

    const query = new ParameterizedQuery('GetCompanyInfoByCompanyId', Queries.getCompanyInfoByCompanyId);
    query.setParameter('@companyId', companyId);
    const payload = {
        tenantId,
        queryName: query.name,
        query: query.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
    if (result.recordset.length === 0) {
        throw errorService.getErrorResponse(50).setDeveloperMessage(`The company id: ${companyId} not found`);
    }

    const companyInfo: CompanyDetail = result.recordset.map((entry) => {
        return {
            id: entry.ID,
            clientId: entry.PRIntegration_ClientID,
            companyCode: entry.PRIntegrationCompanyCode,
            companyName: entry.CompanyName,
        };
    })[0];

    return companyInfo;
}

/**
 * Updates a company's HelloSign configurations
 * @param {string} donorTenantId: The unique identifier (SSO tenantId GUID) for the donor (donor) tenant
 * @param {string} donorCompanyId: The unique identifier for the company
 * @param {PatchInstruction} patch: The instruction the patch should attempt to execute
 * @returns {Promise<() => void>}: A Promise of a rollback function
 */
async function updateHelloSignConfigurations(donorTenantId: string, donorCompanyId: string, patch: PatchInstruction): Promise<() => void> {
    console.info('companyService.updateHelloSignConfigurations');

    const { tenantId: recipientTenantId, companyId: recipientCompanyId } = patch.value || {};

    if (!recipientTenantId || !recipientCompanyId) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Expected value to equal object containing recipient tenantId and companyId');
    }

    const rollbackActions = [];

    try {
        const [donorCompanyInfo, recipientCompanyInfo, adminToken]: any[] = await Promise.all([
            getCompanyInfoByCompanyId(donorTenantId, donorCompanyId),
            getCompanyInfoByCompanyId(recipientTenantId, recipientCompanyId),
            utilService.generateAdminToken(),
        ]);

        const donorIntegrationConfiguration: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            donorTenantId,
            donorCompanyInfo.clientId,
            donorCompanyInfo.id,
            adminToken,
        );
        console.log('donorIntegrationConfiguration', JSON.stringify(donorIntegrationConfiguration));

        if (!donorIntegrationConfiguration) {
            throw errorService.getErrorResponse(50).setDeveloperMessage('donorIntegrationConfiguration not found for this company');
        }

        // update new integration configuration for company with donor eSignatureAppClientId
        const recipientIntegrationConfiguration: EsignatureAppConfiguration = await integrationsService.getIntegrationConfigurationByCompany(
            recipientTenantId,
            recipientCompanyInfo.clientId,
            recipientCompanyInfo.id,
            adminToken,
        );
        console.log('recipientIntegrationConfiguration', JSON.stringify(recipientIntegrationConfiguration));

        if (!recipientIntegrationConfiguration) {
            throw errorService.getErrorResponse(50).setDeveloperMessage('recipientIntegrationConfiguration not found for this company');
        }

        const recipientEsignatureAppClientId = recipientIntegrationConfiguration.integrationDetails.eSignatureAppClientId;
        const donorEsignatureAppClientId = donorIntegrationConfiguration.integrationDetails.eSignatureAppClientId;
        recipientIntegrationConfiguration.integrationDetails.eSignatureAppClientId = donorEsignatureAppClientId;

        await integrationsService.updateIntegrationConfigurationById(
            recipientTenantId,
            recipientCompanyInfo.clientId,
            recipientCompanyInfo.id,
            recipientIntegrationConfiguration,
            adminToken,
        );
        rollbackActions.push(async () => {
            recipientIntegrationConfiguration.integrationDetails.eSignatureAppClientId = recipientEsignatureAppClientId;
            await integrationsService.updateIntegrationConfigurationById(
                recipientTenantId,
                recipientCompanyInfo.clientId,
                recipientCompanyInfo.id,
                recipientIntegrationConfiguration,
                adminToken,
            );
        });

        const recipientHsApp: any = JSON.parse(await hellosignService.getApplicationForCompany(recipientEsignatureAppClientId));
        const donorHsApp: any = JSON.parse(await hellosignService.getApplicationForCompany(donorEsignatureAppClientId));

        // update recipient HelloSign app name to temp name - HelloSign does not allow apps with duplicate names
        let helloSignApplication: HelloSignApplication = {
            name: recipientHsApp.api_app.name + ' donor',
        };
        await hellosignService.updateApplicationForCompany(recipientEsignatureAppClientId, helloSignApplication);
        rollbackActions.push(async () => {
            try {
                helloSignApplication = {
                    name: recipientHsApp.api_app.name,
                };
                await hellosignService.updateApplicationForCompany(recipientEsignatureAppClientId, helloSignApplication);
            } catch (error) {
                // Note: we are eating the exception here because the update will not work if the HelloSign application
                // has already been deleted. Just log the error and continue.
                console.error(error);
            }
        });

        // update donor HelloSign app name and domain
        helloSignApplication = {
            name: recipientHsApp.api_app.name,
            domain: recipientHsApp.api_app.domain,
        };
        await hellosignService.updateApplicationForCompany(donorEsignatureAppClientId, helloSignApplication);
        rollbackActions.push(async () => {
            helloSignApplication = {
                name: donorHsApp.api_app.name,
                domain: donorHsApp.api_app.domain,
            };
            await hellosignService.updateApplicationForCompany(donorEsignatureAppClientId, helloSignApplication);
        });

        // delete recipient HelloSign app
        await hellosignService.deleteApplicationById(recipientEsignatureAppClientId);
        rollbackActions.push(async () => {
            const {
                api_app: { client_id: eSignatureClientId },
            } = await hellosignService.createApplicationForCompany(
                recipientCompanyInfo.id,
                recipientHsApp.api_app.domain,
                recipientHsApp.api_app.callback_url,
            );

            recipientIntegrationConfiguration.integrationDetails.eSignatureAppClientId = eSignatureClientId;
            await integrationsService.updateIntegrationConfigurationById(
                recipientTenantId,
                recipientCompanyInfo.clientId,
                recipientCompanyInfo.id,
                recipientIntegrationConfiguration,
                adminToken,
            );
        });

        // delete donor integration configuration
        await integrationsService.deleteIntegrationConfigurationbyId(
            donorTenantId,
            donorCompanyInfo.clientId,
            donorCompanyInfo.id,
            donorIntegrationConfiguration,
            adminToken,
        );
        rollbackActions.push(async () => {
            await integrationsService.createIntegrationConfiguration(
                donorTenantId,
                donorCompanyInfo.clientId,
                donorCompanyInfo.id,
                donorCompanyInfo.companyName,
                donorHsApp.api_app.domain,
                donorEsignatureAppClientId,
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

async function handleSsoPatch(
    donorTenantId: string,
    donorCompanyId: string,
    instruction: PatchInstruction,
    token?: string,
): Promise<{ response?: any; rollbackAction: () => void }> {
    console.info('companyService.handleSsoPatch');

    const { tenantId: recipientTenantId, companyId: recipientCompanyId } = instruction.value || {};

    if (!recipientTenantId || !recipientCompanyId) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Expected value to equal object containing recipient tenantId and companyId');
    }

    const supportedOperations = [PatchOperation.Copy, PatchOperation.Remove, PatchOperation.Test];
    if (!supportedOperations.includes(instruction.op)) {
        throw errorService.getErrorResponse(71).setDeveloperMessage(`Supported patch operations: ${supportedOperations.join()}`);
    }

    const rollbackActions = [];
    const skippedUsers = [];

    try {
        const [donorCompanyInfo, recipientCompanyInfo]: any[] = await Promise.all([
            getCompanyInfoByCompanyId(donorTenantId, donorCompanyId),
            getCompanyInfoByCompanyId(recipientTenantId, recipientCompanyId),
        ]);

        // get all hr accounts under a company from recipient database
        const usersQuery = new ParameterizedQuery('GetUserSsoIdByEvoCompanyCode', Queries.getUserSsoIdByEvoCompanyCode);
        usersQuery.setParameter(
            '@companyCode',
            instruction.op === PatchOperation.Remove ? donorCompanyInfo.companyCode : recipientCompanyInfo.companyCode,
        );
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

        const createdAccounts = [];
        const updatedUsers = [];
        const actions = [];

        const donorTenantToken = await utilService.generateAssumedRoleToken(ssoRoles.tenantAdmin, donorTenantId);
        const recipientTenantToken = await utilService.generateAssumedRoleToken(ssoRoles.tenantAdmin, recipientTenantId);

        for (const user of users) {
            if (instruction.op === PatchOperation.Test) {
                const account: SsoAccount = await ssoService.getSsoAccountById(user.key, donorTenantId, donorTenantToken);
                console.log(account.id, account.evoSbUserId);
            } else if (instruction.op === PatchOperation.Copy) {
                const action = async () => {
                    try {
                        const account: SsoAccount = await ssoService.getSsoAccountById(user.key, donorTenantId, donorTenantToken);
                        console.log(account.evoSbUserId);
                        delete account.href;
                        delete account.id;
                        delete account.tenantId;
                        // generate a cryptographically-secure temp password
                        account.password = await crypto.randomBytes(8).toString('hex');
                        if (account.evoSbUserId) {
                            const payrollApiAccessToken: any = await utilService.getEvoTokenWithHrToken(recipientTenantId, token);
                            const tenantObject = await ssoService.getTenantById(recipientTenantId, payrollApiAccessToken);
                            const tenantName = tenantObject.subdomain;
                            const payrollUser = await payrollService.getPayrollUserByUsername(tenantName, account.username, payrollApiAccessToken);
                            account.evoSbUserId = payrollUser.id;
                            account.clients = payrollUser.clients;
                        }

                        const createdAccount: SsoAccount = await ssoService.createSsoAccount(
                            recipientTenantId,
                            account,
                            recipientTenantToken,
                        );
                        createdAccounts.push(user.key);

                        const userSsoRoles = await ssoService.getRoleMemberships(donorTenantId, user.key, donorTenantToken)

                        for (const role of userSsoRoles) {
                            await ssoService.addRoleToAccount(recipientTenantId, createdAccount.id, role.roleId, recipientTenantToken)
                        }

                        // Note: (MJ-8259) We cannot delete right now because the endpoint requires the user to have the asure-admin role.
                        // Previously, we were disabling created accounts as a rollback action. We are now opting to skip rollbacks to allow for smoother migrations.
                        // rollbackActions.push(async () => {
                        //     const account: SsoAccount = { enabled: false };
                        //     await ssoService.updateSsoAccountById(createdAccount.id, recipientTenantId, account, recipientTenantToken);
                        // });

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
                        // Note: (MJ-8259) Opting to skip database update rollbacks to allow for smoother migrations.
                        // rollbackActions.push(async () => {
                        //     const query = new ParameterizedQuery('UpdateUserSsoIdById', Queries.updateUserSsoIdById);
                        //     query.setStringParameter('@ssoId', user.key);
                        //     query.setParameter('@userId', user.id);

                        //     const payload = {
                        //         tenantId: recipientTenantId,
                        //         queryName: query.name,
                        //         query: query.value,
                        //         queryType: QueryType.Simple,
                        //     } as DatabaseEvent;

                        //     await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
                        // });
                        
                        updatedUsers.push(user.key);
                    } catch (e) {
                        console.error(`${user.key}: ${e}`);
                    }
                };
                actions.push(action());
            } else if (instruction.op === PatchOperation.Remove) {
                const action = async () => {
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
                };
                actions.push(action());
            } else {
                return { rollbackAction: Function };
            }
        }

        await Promise.allSettled(actions);
        if (updatedUsers.length !== users.length) {
            if (users.length - updatedUsers.length !== skippedUsers.length) {
                const totalFailedUpdates = users.filter(({ key }) => updatedUsers.indexOf(key) === -1);
                const partialFailedUpdates = createdAccounts.filter((key) => !updatedUsers.includes(key));
                const fullyFailedUpdates = totalFailedUpdates.filter(({ key }) => !partialFailedUpdates.includes(key));
                console.log(`The following user(s) failed to update ${JSON.stringify(totalFailedUpdates)}, attempting rollback`);
                console.log(
                    `The following account(s) were created in SSO but failed to update in the db: ${JSON.stringify(partialFailedUpdates)}`,
                );
                console.log(`The following account(s) completely failed to migrate: ${JSON.stringify(fullyFailedUpdates)}`);
                throw errorService
                    .getErrorResponse(0)
                    .setDeveloperMessage(`Failed to migrate the following user(s): ${JSON.stringify(totalFailedUpdates)}`)
                    .setDeveloperMessage('Error occurred while performing patch operation. Check CloudWatch logs for more info.')
                    .setMoreInfo({
                        totalFailedUpdates,
                        partialFailedUpdates,
                        fullyFailedUpdates,
                    });
            }
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
    return {
        response: { skippedUsers },
        rollbackAction: async () => {
            let action = rollbackActions.shift();
            while (action) {
                await action();
                action = rollbackActions.shift();
            }
        },
    };
}

const s3Client = new AWS.S3({
    region: configService.getAwsRegion(),
    useAccelerateEndpoint: true,
});

async function handleEsignatureDocs(donorTenantId: string, donorCompanyId: string, instruction: PatchInstruction): Promise<() => void> {
    console.info('companyService.handleEsignatureDocs');

    const { tenantId: recipientTenantId, companyId: recipientCompanyId } = instruction.value || {};

    if (!recipientTenantId || !recipientCompanyId) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Expected value to equal object containing recipient tenantId and companyId');
    }

    const supportedOperations = [PatchOperation.Move];
    if (!supportedOperations.includes(instruction.op)) {
        throw errorService.getErrorResponse(71).setDeveloperMessage(`Supported patch operations: ${supportedOperations.join()}`);
    }

    const rollbackActions = [];
    const failedActions = [];

    try {
        const [recipientCompanyInfo]: any[] = await Promise.all([getCompanyInfoByCompanyId(recipientTenantId, recipientCompanyId)]);

        if (instruction.op === PatchOperation.Move) {
            const query = new ParameterizedQuery('listFileMetadataByCompanyId', Queries.listFileMetadataByCompanyId);
            query.setParameter('@companyId', recipientCompanyInfo.id);

            const payload = {
                tenantId: recipientTenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;

            const result: any = await utilService.invokeInternalService(
                'queryExecutor',
                payload,
                utilService.InvocationType.RequestResponse,
            );

            if (result.recordset.length === 0) {
                throw errorService.getErrorResponse(50).setDeveloperMessage('No documents found under this company');
            }

            await Promise.allSettled(
                result.recordset.map(async (file) => {
                    try {
                        const fileName = file.Pointer.split('/').pop();
                        let newKey = `${recipientTenantId}/${recipientCompanyInfo.id}`;
                        newKey = file.EmployeeID ? `${newKey}/${file.EmployeeID}/${fileName}` : `${newKey}/${fileName}`;

                        await s3Client
                            .copyObject({
                                Bucket: configService.getFileBucketName(),
                                CopySource: `${configService.getFileBucketName()}/${file.Pointer}`,
                                Key: newKey,
                            })
                            .promise();
                        rollbackActions.push(async () => {
                            try {
                                await s3Client
                                    .deleteObject({
                                        Bucket: configService.getFileBucketName(),
                                        Key: newKey,
                                    })
                                    .promise();
                            } catch (error) {
                                console.error(error);
                            }
                        });

                        // update pointer in db
                        const metadataQuery = new ParameterizedQuery(
                            'updateFileMetadataPointerById',
                            Queries.updateFileMetadataPointerById,
                        );
                        metadataQuery.setStringParameter('@pointer', newKey);
                        metadataQuery.setParameter('@id', file.ID);

                        const metadataPayload = {
                            tenantId: recipientTenantId,
                            queryName: metadataQuery.name,
                            query: metadataQuery.value,
                            queryType: QueryType.Simple,
                        } as DatabaseEvent;

                        await utilService.invokeInternalService(
                            'queryExecutor',
                            metadataPayload,
                            utilService.InvocationType.RequestResponse,
                        );
                        rollbackActions.push(async () => {
                            const rollbackQuery = new ParameterizedQuery(
                                'updateFileMetadataPointerById',
                                Queries.updateFileMetadataPointerById,
                            );
                            rollbackQuery.setStringParameter('@pointer', file.Pointer);
                            rollbackQuery.setParameter('@id', file.ID);

                            const internalPayload = {
                                tenantId: recipientTenantId,
                                queryName: rollbackQuery.name,
                                query: rollbackQuery.value,
                                queryType: QueryType.Simple,
                            } as DatabaseEvent;

                            await utilService.invokeInternalService(
                                'queryExecutor',
                                internalPayload,
                                utilService.InvocationType.RequestResponse,
                            );
                        });

                        // Note: preserve donor s3 docs for now in the event they need to be accessed
                        // await s3Client.deleteObject({
                        //     Bucket: configService.getFileBucketName(),
                        //     Key: file.Pointer,
                        // }).promise();
                        // rollbackActions.push(async () => {
                        //     try {
                        //         await s3Client.copyObject({
                        //             Bucket: configService.getFileBucketName(),
                        //             CopySource: `${configService.getFileBucketName()}/${newKey}`,
                        //             Key: file.Pointer,
                        //         }).promise();
                        //     } catch (error) {
                        //         console.error(error);
                        //     }
                        // });
                    } catch (error) {
                        console.error(`${file.ID}: ${error}`);
                        failedActions.push(file.ID);
                    }
                }),
            );
        }

        if (failedActions.length > 0) {
            console.log(`The following user(s) failed to update ${JSON.stringify(failedActions)}, attempting rollback`);
            throw errorService
                .getErrorResponse(0)
                .setMoreInfo('Error occurred while performing patch operation. Check CloudWatch logs for more info.');
        }
    } catch (error) {
        console.log('Updating e-signature docs failed, rolling back');
        console.error(error);
        let action = rollbackActions.pop();
        while (action) {
            await action();
            action = rollbackActions.pop();
        }
        if (error instanceof ErrorMessage) {
            throw error;
        }
        throw errorService.getErrorResponse(0);
    }

    // return rollback function
    return async () => {
        let action = rollbackActions.pop();
        while (action) {
            await action();
            action = rollbackActions.pop();
        }
    };
}

/**
 * Updates a company or that company's integrations
 * @param {string} tenantId: The unique identifier (SSO tenantId GUID) for the tenant
 * @param {string} companyId: The unique identifier for the company.
 * @param {PatchInstruction[]} patch: The list of instructions the patch is should attempt to execute
 * @param {string} token: access token
 * The patch instructions will be executed in the order provided.
 * The array as a whole is atomic, if an instruction fails, all previous instructions will be rolled back.
 */
export async function companyUpdate(tenantId: string, companyId: string, patch: PatchInstruction[], token?: string): Promise<any> {
    console.info('companyService.companyUpdate');

    const rollbackActions = [];

    try {
        let response = {};
        for (const instruction of patch) {
            switch (instruction.path) {
                case '/platform/integration':
                    rollbackActions.push(await updateHelloSignConfigurations(tenantId, companyId, instruction));
                    break;
                case '/sso/account':
                    const ssoResponse = await handleSsoPatch(tenantId, companyId, instruction, token);
                    rollbackActions.push(ssoResponse.rollbackAction);
                    response = { ...response, ...ssoResponse.response };
                    break;
                case '/esignature':
                    rollbackActions.push(await handleEsignatureDocs(tenantId, companyId, instruction));
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
        return response;
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

/**
 * Lists all company announcements
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of company's announcements.
 */
export async function listCompanyAnnouncements(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('companyService.listCompanyAnnouncements');

    const validQueryStringParameters = ['pageToken', 'expiring', 'indefinite'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query = new ParameterizedQuery('listCompanyAnnouncements', Queries.listCompanyAnnouncements);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            const expiring = queryParams.expiring && utilService.parseQueryParamsBoolean(queryParams, 'expiring');
            const indefinite = queryParams.indefinite && utilService.parseQueryParamsBoolean(queryParams, 'indefinite');

            if (expiring && indefinite)
                query = new ParameterizedQuery('listIndefiniteCompanyAnnouncements', Queries.listExpiringAndIndefiniteCompanyAnnouncements);
            else if (expiring) query = new ParameterizedQuery('listExpiringCompanyAnnouncements', Queries.listExpiringCompanyAnnouncements);
            else if (indefinite)
                query = new ParameterizedQuery('listIndefiniteCompanyAnnouncements', Queries.listIndefiniteCompanyAnnouncements);
        }

        query.setParameter('@companyId', companyId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordsets[1].length === 0) {
            return undefined;
        }

        const totalCount = result.recordsets[0][0].totalCount;

        const announcements: CompanyAnnouncement[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                companyId: record.CompanyID,
                postDate: record.PostDate,
                postTitle: record.PostTitle,
                postDetail: record.PostDetail,
                expiresDate: record.ExpiresDate,
                isOn: record.IsOn,
                isHighPriority: record.IsHighPriority,
                imageIDs: record.imageIDs
            };
        });

        return await paginationService.createPaginatedResult(announcements, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Lists company open-enrollments
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the specified company.
 * @param {any} queryParams: The query parameters that were specified by the user.
 * @param {string} domainName: The domain name of the request.
 * @param {string} path: The path of the endpoint.
 * @returns {PaginatedResult}: A Promise of a paginated collection of company's open enrollments
 */
export async function listCompanyOpenEnrollments(
    tenantId: string,
    companyId: string,
    queryParams: any,
    domainName: string,
    path: string,
): Promise<PaginatedResult> {
    console.info('companyService.listCompanyOpenEnrollments');

    const validQueryStringParameters = ['pageToken', 'current'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        let query = new ParameterizedQuery('listCompanyOpenEnrollments', Queries.listCompanyOpenEnrollments);

        if (queryParams) {
            utilService.validateQueryParams(queryParams, validQueryStringParameters);

            const current = queryParams.current && utilService.parseQueryParamsBoolean(queryParams, 'current');

            if (current) query = new ParameterizedQuery('listCompanyCurrentOpenEnrollments', Queries.listCompanyCurrentOpenEnrollments);
        }

        query.setParameter('@companyId', companyId);

        const paginatedQuery = await paginationService.appendPaginationFilter(query, page);

        const payload = {
            tenantId,
            queryName: paginatedQuery.name,
            query: paginatedQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);

        if (result.recordsets[1].length === 0) {
            return undefined;
        }

        const totalCount = result.recordsets[0][0].totalCount;

        const openEnrollments: CompanyOpenEnrollment[] = result.recordsets[1].map((record) => {
            return {
                id: record.ID,
                companyId: record.CompanyID,
                name: record.Name,
                startDate: record.StartDate,
                endDate: record.EndDate,
                introduction: record.Introduction,
                currentlyOpen: record.CurrentlyOpen,
            };
        });

        return await paginationService.createPaginatedResult(openEnrollments, baseUrl, totalCount, page);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

/**
 * migrates company HR data from a donor to a recipient
 * @param {string} donorTenantId: The unique identifier for the donor tenant
 * @param {string} donorCompanyId: The unique identifier for the donor company
 * @param {string} recipientTenantId: The unique identifier for the recipient tenant
 * @param {string} recipientCompanyId: The unique identifier for the recipient company
 * @param {string} migrationId: The unique identifier for the migration
 */
export async function createCompanyMigration(
    donorTenantId,
    donorCompanyId,
    recipientTenantId,
    recipientCompanyId,
    migrationId,
): Promise<any> {
    console.info('company.service.createCompanyMigration');
    console.info(`migrationId: ${migrationId}`);

    const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

    try {
        //step 1 has been moved to runCompanyMigration function below

        //2-linked server connection creation
        const { rdsEndpoint } = await databaseService.findConnectionString(recipientTenantId);
        const { username, password } = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        const connectionQuery = new ParameterizedQuery('createLinkedServerConnection', Queries.createLinkedServerConnection);

        connectionQuery.setParameter('@password', password);
        connectionQuery.setParameter('@username', username);
        connectionQuery.setParameter('@rdsEndpoint', rdsEndpoint);
        connectionQuery.setParameter('@migrationId', migrationId);

        const connectionPayload = {
            tenantId: donorTenantId,
            queryName: connectionQuery.name,
            query: connectionQuery.value,
            queryType: QueryType.StoredProcedure,
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', connectionPayload, utilService.InvocationType.RequestResponse, true);

        //3-running premigration scripts
        const preMigrationPayload = {
            tenantId: donorTenantId,
            queryType: QueryType.Batched,
        } as DatabaseEvent;

        //getting the list of premigration scripts into in array
        const scripts = fs.readdirSync(pathGlobal.join(basePath, 'companyMigrationScripts'));

        //rearranging the scripts array to execute 'usp_EIN_Cons_Dynamic_V1.sql' first
        const tmp = scripts[scripts.indexOf('usp_EIN_Cons_Dynamic_V1.sql')];
        scripts[scripts.indexOf('usp_EIN_Cons_Dynamic_V1.sql')] = scripts[0];
        scripts[0] = tmp;

        for (let i = 0; i < scripts.length; i++) {
            const preMigrationQuery = new ParameterizedQuery(scripts[i].split('.')[0], Queries[scripts[i].split('.')[0]]);
            preMigrationPayload.queryName = preMigrationQuery.name;
            preMigrationPayload.query = preMigrationQuery.value;

            await utilService.invokeInternalService('queryExecutor', preMigrationPayload, utilService.InvocationType.RequestResponse, true);
        }

        //execute stored procedure for disabling and enabled audit outbox trigger
        const createAuditOutboxTriggerScheduledTask = new Query('createAuditOutboxTriggerScheduledTask', Queries.createAuditOutboxTriggerScheduledTask);
        const payload = {
            tenantId: recipientTenantId,
            queryName: createAuditOutboxTriggerScheduledTask.name,
            query: createAuditOutboxTriggerScheduledTask.value,
            queryType: QueryType.Batched,
        } as DatabaseEvent;
         await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse, true);

         //execute stored procedure
         const createAuditOutboxTriggerScheduledTaskExecute = new ParameterizedQuery('executeCreateAuditOutboxTrigger', Queries.executeCreateAuditOutboxTrigger);

         createAuditOutboxTriggerScheduledTaskExecute.setParameter('@recipTenantId', recipientTenantId)
         const executePayload = {
             tenantId: recipientTenantId,
             queryName: createAuditOutboxTriggerScheduledTaskExecute.name,
             query: createAuditOutboxTriggerScheduledTaskExecute.value,
             queryType: QueryType.StoredProcedure,
         } as DatabaseEvent;
          await utilService.invokeInternalService('queryExecutor', executePayload, utilService.InvocationType.RequestResponse, true);
    

        //4-migration creation
        const migrationQuery = new ParameterizedQuery('createCompanyMigration', Queries.createCompanyMigration);

        migrationQuery.setParameter('@donorTenantId', donorTenantId);
        migrationQuery.setParameter('@donorCompanyId', donorCompanyId);
        migrationQuery.setParameter('@recipTenantId', recipientTenantId);
        migrationQuery.setParameter('@recipCompanyId', recipientCompanyId);
        migrationQuery.setParameter('@migrationId', migrationId);
        
        const migrationPayload = {
            tenantId: donorTenantId,
            queryName: migrationQuery.name,
            query: migrationQuery.value,
            queryType: QueryType.StoredProcedure,
        } as DatabaseEvent;
        await utilService.invokeInternalService(
            'queryExecutorAsync',
            migrationPayload,
            utilService.InvocationType.RequestResponse,
            true,
            900000, // set sdk timeout to 15 minutes to accommodate for long queries
            0, // set retries 0 as the migration is not an idempotent process
        );

        //5-updating migration table to 'Success' if migration done successfully
        const updateParams = {
            TableName: 'HrCompanyMigrations',
            Key: { ID: migrationId },
            UpdateExpression: 'set #a = :x',
            ExpressionAttributeNames: { '#a': 'Status' },
            ExpressionAttributeValues: {
                ':x': 'Success',
            },
        };
        await dynamoDbClient.update(updateParams).promise();
    } catch (error) {
        const updateParams = {
            TableName: 'HrCompanyMigrations',
            Key: { ID: migrationId },
            UpdateExpression: 'set #a = :x, #b.#c = :y',
            ExpressionAttributeNames: {
                '#a': 'Status',
                '#b': 'Details',
                '#c': 'errorMessage',
            },
            ExpressionAttributeValues: {
                ':x': 'Failed',
                ':y': JSON.stringify(error),
            },
        };
        await dynamoDbClient.update(updateParams).promise();

        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    } finally {
        //6-dropping linked server connection
        const dropConnectionQuery = new ParameterizedQuery('dropLinkedServerConnection', Queries.dropLinkedServerConnection);
        
        dropConnectionQuery.setParameter('@migrationId', migrationId)
        
        const dropConnectionPayload = {
            tenantId: donorTenantId,
            queryName: dropConnectionQuery.name,
            query: dropConnectionQuery.value,
            queryType: QueryType.StoredProcedure,
        } as DatabaseEvent;

        await utilService.invokeInternalService('queryExecutor', dropConnectionPayload, utilService.InvocationType.RequestResponse, true);
    }
}

//executes the step function to create the company migration
export async function runCompanyMigration(donorTenantId, donorCompanyId, recipientTenantId, recipientCompanyId, accessToken) {
    console.info('company.service.runCompanyMigration');
    const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
    const migrationId = uniqueifier();
    console.info(`migrationId: ${migrationId}`);

    try {
        const donorCompanyNameQuery = new ParameterizedQuery('companyInfo', Queries.companyInfo);
        donorCompanyNameQuery.setParameter('@companyId', donorCompanyId);

        const recipientCompanyNameQuery = new ParameterizedQuery('companyInfo', Queries.companyInfo);
        recipientCompanyNameQuery.setParameter('@companyId', recipientCompanyId);

        const payload = {
            tenantId: donorTenantId,
            queryName: donorCompanyNameQuery.name,
            query: donorCompanyNameQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const donorCompanyName: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );

        if (donorCompanyName.recordset.length === 0) {
            throw errorService.notFound().setDeveloperMessage(`Company with ID ${donorCompanyId} not found.`);
        }

        payload.tenantId = recipientTenantId;
        payload.queryName = recipientCompanyNameQuery.name;
        payload.query = recipientCompanyNameQuery.value;

        const recipientCompanyName: any = await utilService.invokeInternalService(
            'queryExecutor',
            payload,
            utilService.InvocationType.RequestResponse,
        );

        if (recipientCompanyName.recordset.length === 0) {
            throw errorService.notFound().setDeveloperMessage(`Company with ID ${recipientCompanyId} not found.`);
        }

        const pendingParams = {
            TableName: 'HrCompanyMigrations',
            Item: {
                ID: migrationId,
                Status: 'Pending',
                Details: {
                    source: {
                        tenantId: donorTenantId,
                        companyId: donorCompanyId,
                        companyName: donorCompanyName.recordset[0].CompanyName,
                    },
                    destination: {
                        tenantId: recipientTenantId,
                        companyId: recipientCompanyId,
                        companyName: recipientCompanyName.recordset[0].CompanyName,
                    },
                },
                Timestamp: new Date().toISOString(),
            },
        };

        //1-updating the DB migration table with 'Pending' status
        await dynamoDbClient.put(pendingParams).promise();

        // running 'createCompanyMigration'
        const stepFunctions = new AWS.StepFunctions();
        const params = {
            stateMachineArn: configService.getHrCompanyMigratorStateMachineArn(),
            input: JSON.stringify({
                donorTenantId,
                donorCompanyId,
                recipientTenantId,
                recipientCompanyId,
                migrationId,
                accessToken,
            }),
        };
        await stepFunctions.startExecution(params).promise();

    } catch (error) {
        //updating migration table to 'Failed' if migration failed
        const updateParams = {
            TableName: 'HrCompanyMigrations',
            Key: { ID: migrationId },
            UpdateExpression: 'set #a = :x, #b.#c = :y',
            ExpressionAttributeNames: {
                '#a': 'Status',
                '#b': 'Details',
                '#c': 'errorMessage',
            },
            ExpressionAttributeValues: {
                ':x': 'Failed',
                ':y': JSON.stringify(error),
            },
        };
        await dynamoDbClient.update(updateParams).promise();

        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(JSON.stringify(error));
        throw errorService.getErrorResponse(0);
    }
}

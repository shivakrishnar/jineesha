import * as AWS from 'aws-sdk';
import { Queries } from '../../../queries/queries';
import * as crypto from 'crypto';

import { ErrorMessage } from '../../../errors/errorMessage';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
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
import { CompanyAnnouncement } from './CompanyAnnouncement';
import { CompanyOpenEnrollment } from './CompanyOpenEnrollment';

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

    const validQueryStringParameters = ['pageToken', 'search'];

    // Pagination validation
    const { page, baseUrl } = await paginationService.retrievePaginationData(validQueryStringParameters, domainName, path, queryParams);

    try {
        if (queryParams) utilService.validateQueryParams(queryParams, validQueryStringParameters);

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
            throw errorService.notFound().setDeveloperMessage(`Could not find user with email ${email}`);
        }

        const isGaOrSuperAdmin = userResult.recordset[0].IsGA === true || userResult.recordset[0].IsSuperAdmin === true;
        const userId = userResult.recordset[0].ID;

        const query = new ParameterizedQuery('ListCompanies', Queries.listCompanies);

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

        const searchString = queryParams?.search || '';
        query.setStringParameter('@search', searchString);

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

        const companies: Company[] = recordSet.map(
            ({ ID: id, CompanyName: name, PRIntegrationCompanyCode: code, CreateDate: createDate }) => {
                return { id, name, code, createDate } as Company;
            },
        );

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

    const companyInfo: CompanyDetail = result.recordset.map((entry) => {
        return {
            id: entry.ID,
            clientId: entry.PRIntegration_ClientID,
            companyName: entry.CompanyName,
        };
    })[0];

    return companyInfo;
}

/**
 * Updates a company's HelloSign configurations
 * @param {string} oldTenantId: The unique identifier (SSO tenantId GUID) for the old (donor) tenant
 * @param {string} evoCompanyCode: The unique code for the company
 * @param {PatchInstruction} patch: The instruction the patch should attempt to execute
 * @returns {Promise<() => void>}: A Promise of a rollback function
 */
async function updateHelloSignConfigurations(oldTenantId: string, oldCompanyCode: string, patch: PatchInstruction): Promise<() => void> {
    console.info('companyService.updateHelloSignConfigurations');

    const { tenantId: newTenantId, companyCode: newCompanyCode } = patch.value || {};

    if (!newTenantId || !newCompanyCode) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Expected value to equal object containing recipient tenantId and companyCode');
    }

    const rollbackActions = [];

    try {
        const [oldCompanyInfo, newCompanyInfo, adminToken]: any[] = await Promise.all([
            getCompanyInfoByEvoCompanyCode(oldTenantId, oldCompanyCode),
            getCompanyInfoByEvoCompanyCode(newTenantId, newCompanyCode),
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

async function handleSsoPatch(
    donorTenantId: string,
    donorCompanyCode: string,
    instruction: PatchInstruction,
): Promise<{ response?: any; rollbackAction: () => void }> {
    console.info('companyService.handleSsoPatch');

    const { tenantId: recipientTenantId, companyCode: recipientCompanyCode } = instruction.value || {};

    if (!recipientTenantId || !recipientCompanyCode) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Expected value to equal object containing recipient tenantId and companyCode');
    }

    const supportedOperations = [PatchOperation.Copy, PatchOperation.Remove, PatchOperation.Test];
    if (!supportedOperations.includes(instruction.op)) {
        throw errorService.getErrorResponse(71).setDeveloperMessage(`Supported patch operations: ${supportedOperations.join()}`);
    }

    const rollbackActions = [];
    const skippedUsers = [];

    try {
        await Promise.all([
            getCompanyInfoByEvoCompanyCode(donorTenantId, donorCompanyCode),
            getCompanyInfoByEvoCompanyCode(recipientTenantId, recipientCompanyCode),
        ]);

        // get all hr accounts under a company from recipient database
        const usersQuery = new ParameterizedQuery('GetUserSsoIdByEvoCompanyCode', Queries.getUserSsoIdByEvoCompanyCode);
        usersQuery.setStringParameter('@companyCode', instruction.op === PatchOperation.Remove ? donorCompanyCode : recipientCompanyCode);

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

                        if (!account.evoSbUserId) {
                            const createdAccount: SsoAccount = await ssoService.createSsoAccount(
                                recipientTenantId,
                                account,
                                recipientTenantToken,
                            );
                            createdAccounts.push(user.key);

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
                        } else {
                            console.log(`Skipping user with id ${account.id} and evoSbUserId ${account.evoSbUserId}`);
                            skippedUsers.push(user.key);
                        }
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

async function handleEsignatureDocs(donorTenantId: string, donorCompanyCode: string, instruction: PatchInstruction): Promise<() => void> {
    console.info('companyService.handleEsignatureDocs');

    const { tenantId: recipientTenantId, companyCode: recipientCompanyCode } = instruction.value || {};

    if (!recipientTenantId || !recipientCompanyCode) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Expected value to equal object containing recipient tenantId and companyCode');
    }

    const supportedOperations = [PatchOperation.Move];
    if (!supportedOperations.includes(instruction.op)) {
        throw errorService.getErrorResponse(71).setDeveloperMessage(`Supported patch operations: ${supportedOperations.join()}`);
    }

    const rollbackActions = [];
    const failedActions = [];

    try {
        // company code validation & retrieve hr company ids
        const [recipientCompanyInfo]: CompanyDetail[] = await Promise.all([
            getCompanyInfoByEvoCompanyCode(recipientTenantId, recipientCompanyCode),
            getCompanyInfoByEvoCompanyCode(donorTenantId, donorCompanyCode),
        ]);

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

                        // Note: preserve old s3 docs for now in the event they need to be accessed
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
 * @param {string} companyCode: The unique code for the company
 * @param {PatchInstruction[]} patch: The list of instructions the patch is should attempt to execute
 * The patch instructions will be executed in the order provided.
 * The array as a whole is atomic, if an instruction fails, all previous instructions will be rolled back.
 */
export async function companyUpdate(tenantId: string, companyCode: string, patch: PatchInstruction[]): Promise<any> {
    console.info('companyService.companyUpdate');

    const rollbackActions = [];

    try {
        let response = {};
        for (const instruction of patch) {
            switch (instruction.path) {
                case '/platform/integration':
                    rollbackActions.push(await updateHelloSignConfigurations(tenantId, companyCode, instruction));
                    break;
                case '/sso/account':
                    const ssoResponse = await handleSsoPatch(tenantId, companyCode, instruction);
                    rollbackActions.push(ssoResponse.rollbackAction);
                    response = { ...response, ...ssoResponse.response };
                    break;
                case '/esignature':
                    rollbackActions.push(await handleEsignatureDocs(tenantId, companyCode, instruction));
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

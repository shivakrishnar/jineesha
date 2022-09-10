export const getAwsRegion = () => process.env.awsRegion;

export const getApiDomain = () => process.env.apiDomain;

export const getDomain = () => process.env.domain;

export const getPageLimitDefault = () => Number(process.env.pageLimitDefault);

export const getPageLimitMax = () => Number(process.env.pageLimitMax);

export const getEvoHrUserTypeSuperAdmin = () => process.env.evoHrUserTypeSuperAdmin;

export const getEvoHrUserTypeSBAdmin = () => process.env.evoHrUserTypeSBAdmin;

export const getEvoHrGroupEmployee = () => process.env.evoHrGroupEmployee;

export const getEvoHrGroupPayroll = () => process.env.evoHrGroupPayroll;

export const getEvoHrGroupCompany = () => process.env.evoHrGroupCompany;

export const getEvoHrGlobalAdmin = () => process.env.evoHrGlobalAdmin;

export const getTlmReadRole = () => process.env.tlmReadRole;

export const getTlmWriteRole = () => process.env.tlmWriteRole;

export const getApiSecretId = () => process.env.apiSecretId;

export const getSecretsAwsEndpoint = () => process.env.secretsAwsEndPoint;

export const getRdsCredentials = () => process.env.rdsCredentialsId;

export const getPayrollApiCredentials = () => process.env.payrollApiCredentialsId;

export const getStage = () => process.env.stage;

export const getFromEmailAddress = () => process.env.fromEmail;

export const getSesSmtpCredentials = () => process.env.sesSmtpCredentialsId;

export const getSesSmtpServerHost = () => process.env.sesSmtpServerHost;

export const getSesSmtpServerPort = () => process.env.sesSmtpServerPort;

export const getEsignatureApiCredentials = () => process.env.eSignatureApiCredentialsId;

export const eSignatureApiDevModeOn = () => {
    return process.env.eSignatureApiDevModeOn === 'true';
};

export const getIntegrationId = () => process.env.integrationId;

export const getGoldilocksApplicationId = () => process.env.goldilocksApplicationId;

export const getGoldilocksTenantId = () => process.env.goldilocksTenantId;

export const getAsureAdminRoleId = () => process.env.asureAdminRoleId;

export const getSsoCredentialsId = () => process.env.ssoCredentialsId;

export const getHrDatabaseCreatorStateMachineArn = () => process.env.hrDatabaseCreatorStateMachineArn;

export const getHrCompanyMigratorStateMachineArn = () => process.env.hrCompanyMigratorStateMachineArn;

export const getTeamNotificationTopicArn = () => process.env.teamNotificationTopicArn;

export const getHrCredentialsId = () => process.env.hrCredentialsId;

export const getFileBucketName = () => process.env.fileBucketName;

export const getHrServicesDomain = () => process.env.hrServicesDomain;

export const getEsignatureCallbackPath = () => process.env.eSignatureCallbackPath;

export const getScopeBaseDomain = () => process.env.scopeBaseDomain;

export const getHrApplicationId = () => process.env.hrApplicationId;

export const getSaltId = () => process.env.saltId;

export const lambdaPerfMonitorApiKey = () => process.env.lambdaPerfMonitorApiKey;

export const getAuditLogGroupName = () => process.env.AuditLogGroupName;

export const getTenantAdminCredentialsId = () => process.env.tenantAdminCredentialsId;

export const getBillingRecipient = () => process.env.billingRecipient;

export const getLegacyClientCutOffDate = () => process.env.legacyClientCutOffDate;

export const getDirectClientPricingData = () => process.env.directClientPricingData;

export const getIndirectClientPricingData = () => process.env.indirectClientPricingData;

// We need to support at least two keys concurrently, and each has keyId / publicKey attributes.
// If/when config moves to dynamo, this can be stored as an array of objects. But env vars must
// be strings, so for now this method converts two delimited strings into an array of objects.
export const getSsoPublicKeys = () => {
    const key1 = process.env.ssoPublicKey1.split('|');
    const key2 = process.env.ssoPublicKey2.split('|');
    return [{ keyId: key1[0], publicKey: key1[1] }, { keyId: key2[0], publicKey: key2[1] }];
};

export const getSignaturePageFontUrl = () => process.env.signaturePageFontUrl;

export const getPayrollBaseUrl = () => process.env.payrollBaseUrl;

export const getDbBackupBucket = () => process.env.dbBackupBucket;

export const getBranchName = () => process.env.branchName;
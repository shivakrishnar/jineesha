export const getAwsRegion = () => process.env.awsRegion;

export const getApiDomain = () => process.env.apiDomain;

export const getPageLimitDefault = () => Number(process.env.pageLimitDefault);

export const getPageLimitMax = () => Number(process.env.pageLimitMax);

export const getEvoHrUserTypeSuperAdmin = () => process.env.evoHrUserTypeSuperAdmin;

export const getEvoHrUserTypeSBAdmin = () => process.env.evoHrUserTypeSBAdmin;

export const getEvoHrGroupEmployee = () => process.env.evoHrGroupEmployee;

export const getEvoHrGroupPayroll = () => process.env.evoHrGroupPayroll;

export const getEvoHrGroupCompany = () => process.env.evoHrGroupCompany;

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

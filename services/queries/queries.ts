import * as fs from 'fs';
import * as path from 'path';

// Note: The queries are bundled into the deployed service package and since multiple services reference
//       them, the path to the files differ depending upon the invocation context - that is, whether within
//       the AWS Lambda container or a regular Node process. This provides a sanity check for the
//       directory to these files.
//       Service packages deployed to AWS Lambda are executed within the /var/task directory in the container.
const basePath = process.cwd() === '/var/task' ? path.join(process.cwd(), 'queries') : __dirname;

export const Queries = {
    // Security
    checkSecurityRoles: fs.readFileSync(path.join(basePath, 'security/checkSecurityRoles.sql')).toString(),

    // Direct Deposits
    directDepositList: fs.readFileSync(path.join(basePath, 'direct-deposits/listDirectDepositsByEmployeeId.sql')).toString(),
    getDirectDeposit: fs.readFileSync(path.join(basePath, 'direct-deposits/getDirectDepositById.sql')).toString(),
    directDepositCreate: fs.readFileSync(path.join(basePath, 'direct-deposits/createDirectDeposit.sql')).toString(),
    directDepositUpdate: fs.readFileSync(path.join(basePath, 'direct-deposits/updateDirectDeposit.sql')).toString(),
    directDepositDelete: fs.readFileSync(path.join(basePath, 'direct-deposits/deleteDirectDepositById.sql')).toString(),
    updateDirectDepositEndDate: fs.readFileSync(path.join(basePath, 'direct-deposits/updateDirectDepositEndDateById.sql')).toString(),
    checkForDuplicateBankAccounts: fs.readFileSync(path.join(basePath, 'direct-deposits/checkForDuplicateBankAccounts.sql')).toString(),
    checkForDuplicateRemainderOfPay: fs.readFileSync(path.join(basePath, 'direct-deposits/checkForDuplicateRemainderOfPay.sql')).toString(),
    getEmployeeDirectDepositById: fs.readFileSync(path.join(basePath, 'direct-deposits/getEmployeeDirectDepositById.sql')).toString(),
    getEvoData: fs.readFileSync(path.join(basePath, 'direct-deposits/getEvoData.sql')).toString(),

    // Miscellaneous
    databaseList: fs.readFileSync(path.join(basePath, 'miscellaneous/database.sql')).toString(),
    tenantInfo: fs.readFileSync(path.join(basePath, 'miscellaneous/tenantInfo.sql')).toString(),
    companyInfo: fs.readFileSync(path.join(basePath, 'miscellaneous/companyInfo.sql')).toString(),
    apiServiceAccount: fs.readFileSync(path.join(basePath, 'miscellaneous/apiServiceAccount.sql')).toString(),

    // Alerts
    alertEventList: fs.readFileSync(path.join(basePath, 'alerts/listAlertEventsByCompanyId.sql')).toString(),
    listAlertRecipients: fs.readFileSync(path.join(basePath, 'alerts/listDirectDepositEventRecipientEmailAddresses.sql')).toString(),
    smtpCredentials: fs.readFileSync(path.join(basePath, 'alerts/getSmtpCredentials.sql')).toString(),
    directDepositMetadata: fs.readFileSync(path.join(basePath, 'alerts/directDepositMetadata.sql')).toString(),

    // Audit
    createAuditEntry: fs.readFileSync(path.join(basePath, 'audit/createAuditEntry.sql')).toString(),
    createAuditDetailEntry: fs.readFileSync(path.join(basePath, 'audit/createAuditDetailEntry.sql')).toString(),
    getEmployeeDisplayNameById: fs.readFileSync(path.join(basePath, 'audit/getEmployeeDisplayNameById.sql')).toString(),

    // E-Signatures
    checkForDuplicateFileMetadata: fs.readFileSync(path.join(basePath, 'esignatures/checkForDuplicateFileMetadata.sql')).toString(),
    createEsignatureMetadata: fs.readFileSync(path.join(basePath, 'esignatures/createEsignatureMetadata.sql')).toString(),
    createFileMetadata: fs.readFileSync(path.join(basePath, 'esignatures/createFileMetadata.sql')).toString(),
    getConsolidatedCompanyDocumentsByCompanyId: fs
        .readFileSync(path.join(basePath, 'esignatures/getConsolidatedCompanyDocumentsByCompanyId.sql'))
        .toString(),
    getConsolidatedEmployeeDocumentsByCompanyId: fs
        .readFileSync(path.join(basePath, 'esignatures/getConsolidatedEmployeeDocumentsByCompanyId.sql'))
        .toString(),
    getConsolidatedEmployeeDocumentsByEE: fs
        .readFileSync(path.join(basePath, 'esignatures/getConsolidatedEmployeeDocumentsByEE.sql'))
        .toString(),
    getEmployeeEmailsByManager: fs.readFileSync(path.join(basePath, 'esignatures/getEmployeeEmailsByManager.sql')).toString(),
    getEsignatureMetadataByCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/getEsignatureMetadataByCompanyId.sql')).toString(),
    getEsignatureMetadataByEE: fs.readFileSync(path.join(basePath, 'esignatures/getEsignatureMetadataByEE.sql')).toString(),
    getEsignatureMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/getEsignatureMetadataById.sql')).toString(),
    getTaskListDocuments: fs.readFileSync(path.join(basePath, 'esignatures/getTaskListDocuments.sql')).toString(),
    updateEsignatureMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/updateEsignatureMetadataById.sql')).toString(),
    getEmployeeLegacyAndSignedDocuments: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocuments.sql'))
        .toString(),
    getEmployeeLegacyAndSignedDocumentsByCompanyId: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentsByCompanyId.sql'))
        .toString(),
    getEmployeeLegacyAndSignedDocumentsByCompanyForManager: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentsByCompanyForManager.sql'))
        .toString(),
    getEmployeeLegacyAndSignedDocumentsByEmployeeId: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentsByEmployeeId.sql'))
        .toString(),

    // Companies
    getUserCompaniesById: fs.readFileSync(path.join(basePath, 'companies/getUserCompaniesById.sql')).toString(),
    listCompanies: fs.readFileSync(path.join(basePath, 'companies/listCompanies.sql')).toString(),

    // Employees
    listEmployeesByEmailAddresses: fs.readFileSync(path.join(basePath, 'employees/listEmployeesByEmailAddresses.sql')).toString(),

    // Users
    getUserById: fs.readFileSync(path.join(basePath, 'users/getUserById.sql')).toString(),
};

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
    companyAccess: fs.readFileSync(path.join(basePath, 'security/companyAccess.sql')).toString(),

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
    esignatureMetadata: fs.readFileSync(path.join(basePath, 'alerts/esignatureMetadata.sql')).toString(),

    // Audit
    createAuditEntry: fs.readFileSync(path.join(basePath, 'audit/createAuditEntry.sql')).toString(),
    createAuditDetailEntry: fs.readFileSync(path.join(basePath, 'audit/createAuditDetailEntry.sql')).toString(),
    getEmployeeInfoById: fs.readFileSync(path.join(basePath, 'audit/getEmployeeInfoById.sql')).toString(),
    createEmailRecordListEntry: fs.readFileSync(path.join(basePath, 'audit/createEmailRecordListEntry.sql')).toString(),

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
    updateEsignatureMetadataSignatureStatusById: fs
        .readFileSync(path.join(basePath, 'esignatures/updateEsignatureMetadataSignatureStatusById.sql'))
        .toString(),
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
    getFileMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/getFileMetadataById.sql')).toString(),
    getDocumentById: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentById.sql')).toString(),
    getEmployeeLegacyAndSignedDocumentCategories: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentCategories.sql'))
        .toString(),
    getEmployeeLegacyAndSignedDocumentCategoriesByCompanyId: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentCategoriesByCompanyId.sql'))
        .toString(),
    getEmployeeLegacyAndSignedDocumentCategoriesByCompanyForManager: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentCategoriesByCompanyForManager.sql'))
        .toString(),
    getEmployeeLegacyAndSignedDocumentCategoriesByEmployeeId: fs
        .readFileSync(path.join(basePath, 'esignatures/getEmployeeLegacyAndSignedDocumentCategoriesByEmployeeId.sql'))
        .toString(),
    getDocumentCategoriesByCompany: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentCategoryByCompany.sql')).toString(),
    getOnboardingDocumentsByCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/getOnboardingDocumentsByCompanyId.sql')).toString(),
    updateFileMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/updateFileMetadataById.sql')).toString(),
    updateDocumentMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/updateDocumentMetadataById.sql')).toString(),
    updateDocumentById: fs.readFileSync(path.join(basePath, 'esignatures/updateDocumentById.sql')).toString(),
    updateDocumentPointerById: fs.readFileSync(path.join(basePath, 'esignatures/updateDocumentPointerById.sql')).toString(),
    getDocumentMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentMetadataById.sql')).toString(),
    deleteFileMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/deleteFileMetadataById.sql')).toString(),
    deleteEsignatureMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/deleteEsignatureMetadataById.sql')).toString(),
    deleteDocumentById: fs.readFileSync(path.join(basePath, 'esignatures/deleteDocumentById.sql')).toString(),
    getFileMetadataByIdAndCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/getFileMetadataByIdAndCompanyId.sql')).toString(),
    getEsignatureMetadataByIdAndCompanyId: fs
        .readFileSync(path.join(basePath, 'esignatures/getEsignatureMetadataByIdAndCompanyId.sql'))
        .toString(),
    getDocumentByIdAndCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentByIdAndCompanyId.sql')).toString(),
    getDocumentByIdAndEmployeeId: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentByIdAndEmployeeId.sql')).toString(),
    removeDocumentFromTaskList: fs.readFileSync(path.join(basePath, 'esignatures/removeDocumentFromTaskList.sql')).toString(),
    getSignatureStatusByStepNumber: fs.readFileSync(path.join(basePath, 'esignatures/getSignatureStatusByStepNumber.sql')).toString(),

    // Companies
    getUserCompaniesById: fs.readFileSync(path.join(basePath, 'companies/getUserCompaniesById.sql')).toString(),
    listCompanies: fs.readFileSync(path.join(basePath, 'companies/listCompanies.sql')).toString(),
    getCompanyLogo: fs.readFileSync(path.join(basePath, 'companies/getCompanyLogo.sql')).toString(),
    listEmployeeCompaniesBySsoAccount: fs.readFileSync(path.join(basePath, 'companies/listEmployeeCompaniesBySsoAccount.sql')).toString(),

    // Employees
    getEmployeeByCompanyIdAndId: fs.readFileSync(path.join(basePath, 'employees/getEmployeeByCompanyIdAndId.sql')).toString(),
    getEmployeeByCompanyIdAndCode: fs.readFileSync(path.join(basePath, 'employees/getEmployeeByCompanyIdAndCode.sql')).toString(),
    listEmployeesByEmailAddresses: fs.readFileSync(path.join(basePath, 'employees/listEmployeesByEmailAddresses.sql')).toString(),
    listEmployeesByTenant: fs.readFileSync(path.join(basePath, 'employees/listEmployeesByTenant.sql')).toString(),
    listEmployeesForSbAdminByTenant: fs.readFileSync(path.join(basePath, 'employees/listEmployeesForSbAdminByTenant.sql')).toString(),
    listEmployeesByCompany: fs.readFileSync(path.join(basePath, 'employees/listEmployeesByCompany.sql')).toString(),
    listEmployeesForAdminByCompany: fs.readFileSync(path.join(basePath, 'employees/listEmployeesForAdminByCompany.sql')).toString(),
    listEmployeesForManagerByCompany: fs.readFileSync(path.join(basePath, 'employees/listEmployeesForManagerByCompany.sql')).toString(),
    listEmployeesForSbAdminByCompany: fs.readFileSync(path.join(basePath, 'employees/listEmployeesForSbAdminByCompany.sql')).toString(),
    getEmployeeById: fs.readFileSync(path.join(basePath, 'employees/getEmployeeById.sql')).toString(),
    getEmployeeForAdminById: fs.readFileSync(path.join(basePath, 'employees/getEmployeeForAdminById.sql')).toString(),
    getEmployeeForManagerById: fs.readFileSync(path.join(basePath, 'employees/getEmployeeForManagerById.sql')).toString(),
    getEmployeeForSbAdminById: fs.readFileSync(path.join(basePath, 'employees/getEmployeeForSbAdminById.sql')).toString(),

    // Users
    getUserById: fs.readFileSync(path.join(basePath, 'users/getUserById.sql')).toString(),
};

import * as fs from 'fs';
import * as path from 'path';

// Note: The queries are bundled into the deployed service package and since multiple services reference
//       them, the path to the files differ depending upon the invocation context - that is, whether within
//       the AWS Lambda container or a regular Node process. This provides a sanity check for the
//       directory to these files.
//       Service packages deployed to AWS Lambda are executed within the /var/task directory in the container.
export const basePath = process.cwd() === '/var/task' ? path.join(process.cwd(), 'queries') : __dirname;

export const Queries = {
    // Database
    backupDatabase: fs.readFileSync(path.join(basePath, 'database/backupDatabase.sql')).toString(),
    dropDatabase: fs.readFileSync(path.join(basePath, 'database/dropDatabase.sql')).toString(),
    getBackupStatus: fs.readFileSync(path.join(basePath, 'database/getBackupStatus.sql')).toString(),

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
    checkNachaBetaFlagIsOn: fs.readFileSync(path.join(basePath, 'direct-deposits/checkNachaBetaFlagIsOn.sql')).toString(),
    listBetaFlags: fs.readFileSync(path.join(basePath, 'direct-deposits/listBetaFlags.sql')).toString(),

    // Miscellaneous
    databaseList: fs.readFileSync(path.join(basePath, 'miscellaneous/database.sql')).toString(),
    tenantInfo: fs.readFileSync(path.join(basePath, 'miscellaneous/tenantInfo.sql')).toString(),
    companyInfo: fs.readFileSync(path.join(basePath, 'miscellaneous/companyInfo.sql')).toString(),
    apiServiceAccount: fs.readFileSync(path.join(basePath, 'miscellaneous/apiServiceAccount.sql')).toString(),
    companyExistsInTenant: fs.readFileSync(path.join(basePath, 'miscellaneous/companyExistsInTenant.sql')).toString(),
    employeeExistsInCompany: fs.readFileSync(path.join(basePath, 'miscellaneous/employeeExistsInCompany.sql')).toString(),
    userExistsInCompany: fs.readFileSync(path.join(basePath, 'miscellaneous/userExistsInCompany.sql')).toString(),
    integrationUserExists: fs.readFileSync(path.join(basePath, 'miscellaneous/integrationUserExists.sql')).toString(),
    addIntegrationUserCredentials: fs.readFileSync(path.join(basePath, 'miscellaneous/addIntegrationUserCredentials.sql')).toString(),

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
    createSimpleSignMetadata: fs.readFileSync(path.join(basePath, 'esignatures/createSimpleSignMetadata.sql')).toString(),
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
    updateEsignatureMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/updateEsignatureMetadataById.sql')).toString(),
    updateEsignatureMetadataTitleCategoryById: fs
        .readFileSync(path.join(basePath, 'esignatures/updateEsignatureMetadataTitleCategoryById.sql'))
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
    getIncompleteOnboardingsByCompanyIdAndKey: fs
        .readFileSync(path.join(basePath, 'esignatures/getIncompleteOnboardingsByCompanyIdAndKey.sql'))
        .toString(),
    updateFileMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/updateFileMetadataById.sql')).toString(),
    updateDocumentMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/updateDocumentMetadataById.sql')).toString(),
    updateDocumentById: fs.readFileSync(path.join(basePath, 'esignatures/updateDocumentById.sql')).toString(),
    updateDocumentPointerById: fs.readFileSync(path.join(basePath, 'esignatures/updateDocumentPointerById.sql')).toString(),
    getDocumentMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentMetadataById.sql')).toString(),
    deleteFileMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/deleteFileMetadataById.sql')).toString(),
    deleteEsignatureMetadataById: fs.readFileSync(path.join(basePath, 'esignatures/deleteEsignatureMetadataById.sql')).toString(),
    deleteEsignatureMetadataByIdList: fs.readFileSync(path.join(basePath, 'esignatures/deleteEsignatureMetadataByIdList.sql')).toString(),
    deleteDocumentById: fs.readFileSync(path.join(basePath, 'esignatures/deleteDocumentById.sql')).toString(),
    cancelSignatureRequestById: fs.readFileSync(path.join(basePath, 'esignatures/cancelSignatureRequestById.sql')).toString(),
    getFileMetadataByIdAndCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/getFileMetadataByIdAndCompanyId.sql')).toString(),
    getEsignatureMetadataByIdAndCompanyId: fs
        .readFileSync(path.join(basePath, 'esignatures/getEsignatureMetadataByIdAndCompanyId.sql'))
        .toString(),
    getDocumentByIdAndCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentByIdAndCompanyId.sql')).toString(),
    getDocumentByIdAndEmployeeId: fs.readFileSync(path.join(basePath, 'esignatures/getDocumentByIdAndEmployeeId.sql')).toString(),
    removeDocumentFromTaskList: fs.readFileSync(path.join(basePath, 'esignatures/removeDocumentFromTaskList.sql')).toString(),
    getSignatureStatusByStepNumber: fs.readFileSync(path.join(basePath, 'esignatures/getSignatureStatusByStepNumber.sql')).toString(),
    getBillableSignRequests: fs.readFileSync(path.join(basePath, 'esignatures/getBillableSignRequests.sql')).toString(),
    getFileMetadataByEsignatureMetadataId: fs
        .readFileSync(path.join(basePath, 'esignatures/getFileMetadataByEsignatureMetadataId.sql'))
        .toString(),
    updateOnboardingStatusForEsignatureMetadata: fs
        .readFileSync(path.join(basePath, 'esignatures/updateOnboardingStatusForEsignatureMetadata.sql'))
        .toString(),
    getOnboardingSimpleSignDocuments: fs.readFileSync(path.join(basePath, 'esignatures/getOnboardingSimpleSignDocuments.sql')).toString(),
    getOnboardingByKey: fs.readFileSync(path.join(basePath, 'esignatures/getOnboardingByKey.sql')).toString(),
    getOnboardingByEmployeeIDAndKey: fs.readFileSync(path.join(basePath, 'esignatures/getOnboardingByEmployeeIDAndKey.sql')).toString(),
    getOnboardingSignedSimpleSignDocuments: fs
        .readFileSync(path.join(basePath, 'esignatures/getOnboardingSignedSimpleSignDocuments.sql'))
        .toString(),
    updateFileMetadataPointerById: fs.readFileSync(path.join(basePath, 'esignatures/updateFileMetadataPointerById.sql')).toString(),
    getNonApprovedOnboardingByKey: fs.readFileSync(path.join(basePath, 'esignatures/getNonApprovedOnboardingByKey.sql')).toString(),
    updateCompanyEsignatureProductTier: fs
        .readFileSync(path.join(basePath, 'esignatures/updateCompanyEsignatureProductTier.sql'))
        .toString(),
    getEsignatureProductTierById: fs.readFileSync(path.join(basePath, 'esignatures/getEsignatureProductTierById.sql')).toString(),
    removeHelloSignTemplatesFromTaskList: fs
        .readFileSync(path.join(basePath, 'esignatures/removeHelloSignTemplatesFromTaskList.sql'))
        .toString(),
    listFileMetadataByCompanyId: fs.readFileSync(path.join(basePath, 'esignatures/listFileMetadataByCompanyId.sql')).toString(),
    createBillingEventForCompany: fs.readFileSync(path.join(basePath, 'esignatures/createBillingEventForCompany.sql')).toString(),
    getBillingEventTypeByName: fs.readFileSync(path.join(basePath, 'esignatures/getBillingEventTypeByName.sql')).toString(),

    // Companies
    getUserCompaniesById: fs.readFileSync(path.join(basePath, 'companies/getUserCompaniesById.sql')).toString(),
    listCompanies: fs.readFileSync(path.join(basePath, 'companies/listCompanies.sql')).toString(),
    getCompanyLogo: fs.readFileSync(path.join(basePath, 'companies/getCompanyLogo.sql')).toString(),
    listEmployeeCompaniesBySsoAccount: fs.readFileSync(path.join(basePath, 'companies/listEmployeeCompaniesBySsoAccount.sql')).toString(),
    getCompanyById: fs.readFileSync(path.join(basePath, 'companies/getCompanyById.sql')).toString(),
    getCompanyInfoByCompanyId: fs.readFileSync(path.join(basePath, 'companies/getCompanyInfoByCompanyId.sql')).toString(),
    listCompanyAnnouncements: fs.readFileSync(path.join(basePath, 'companies/listCompanyAnnouncements.sql')).toString(),
    listExpiringCompanyAnnouncements: fs.readFileSync(path.join(basePath, 'companies/listExpiringCompanyAnnouncements.sql')).toString(),
    listIndefiniteCompanyAnnouncements: fs.readFileSync(path.join(basePath, 'companies/listIndefiniteCompanyAnnouncements.sql')).toString(),
    listExpiringAndIndefiniteCompanyAnnouncements: fs
        .readFileSync(path.join(basePath, 'companies/listExpiringAndIndefiniteCompanyAnnouncements.sql'))
        .toString(),
    listCompanyOpenEnrollments: fs.readFileSync(path.join(basePath, 'companies/listCompanyOpenEnrollments.sql')).toString(),
    listCompanyCurrentOpenEnrollments: fs.readFileSync(path.join(basePath, 'companies/listCompanyCurrentOpenEnrollments.sql')).toString(),
    //company migrations scripts
    usp_EIN_Cons_Dynamic_V1: fs.readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_Dynamic_V1.sql')).toString(),
    usp_EIN_Cons_ApplTrack_V1: fs.readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_ApplTrack_V1.sql')).toString(),
    usp_EIN_Cons_Benefits_V1: fs.readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_Benefits_V1.sql')).toString(),
    usp_EIN_Cons_CompanyUpdates: fs.readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_CompanyUpdates.sql')).toString(),
    usp_EIN_Cons_CompanyWrapper_V1: fs
        .readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_CompanyWrapper_V1.sql'))
        .toString(),
    usp_EIN_Cons_CompensationDataSet_V1: fs
        .readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_CompensationDataSet_V1.sql'))
        .toString(),
    usp_EIN_Cons_Documents_V1: fs.readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_Documents_V1.sql')).toString(),
    usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1: fs
        .readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1.sql'))
        .toString(),
    usp_EIN_Cons_EmployeeOnboard_V1: fs
        .readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_EmployeeOnboard_V1.sql'))
        .toString(),
    usp_EIN_Cons_HRNext_Sec_DataSet_V1: fs
        .readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_HRNext_Sec_DataSet_V1.sql'))
        .toString(),
    usp_EIN_Cons_PreCheck_V1: fs.readFileSync(path.join(basePath, 'companyMigrationScripts/usp_EIN_Cons_PreCheck_V1.sql')).toString(),
    createLinkedServerConnection: fs.readFileSync(path.join(basePath, 'companies/createLinkedServerConnection.sql')).toString(),
    createCompanyMigration: fs.readFileSync(path.join(basePath, 'companies/createCompanyMigration.sql')).toString(),
    dropLinkedServerConnection: fs.readFileSync(path.join(basePath, 'companies/dropLinkedServerConnection.sql')).toString(),
    
    
    // Employees
    getEmployeeByCompanyIdAndId: fs.readFileSync(path.join(basePath, 'employees/getEmployeeByCompanyIdAndId.sql')).toString(),
    getEmployeeByCompanyIdAndCode: fs.readFileSync(path.join(basePath, 'employees/getEmployeeByCompanyIdAndCode.sql')).toString(),
    getEmployeesByEmailAddress: fs.readFileSync(path.join(basePath, 'employees/getEmployeesByEmailAddress.sql')).toString(),
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
    getEmployeeForEmployeeById: fs.readFileSync(path.join(basePath, 'employees/getEmployeeForEmployeeById.sql')).toString(),
    getEmployeeInfoByOnboardingKey: fs.readFileSync(path.join(basePath, 'employees/getEmployeeInfoByOnboardingKey.sql')).toString(),
    listLicensesByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listLicensesByEmployeeId.sql')).toString(),
    listExpiringLicensesByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listExpiringLicensesByEmployeeId.sql')).toString(),
    updateEmployeeLicenseById: fs.readFileSync(path.join(basePath, 'employees/updateEmployeeLicenseById.sql')).toString(),
    listCertificatesByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listCertificatesByEmployeeId.sql')).toString(),
    listExpiringCertificatesByEmployeeId: fs
        .readFileSync(path.join(basePath, 'employees/listExpiringCertificatesByEmployeeId.sql'))
        .toString(),
    updateEmployeeCertificateById: fs.readFileSync(path.join(basePath, 'employees/updateEmployeeCertificateById.sql')).toString(),
    listReviewsByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listReviewsByEmployeeId.sql')).toString(),
    listUpcomingReviewsByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listUpcomingReviewsByEmployeeId.sql')).toString(),
    updateEmployeeReviewById: fs.readFileSync(path.join(basePath, 'employees/updateEmployeeReviewById.sql')).toString(),
    listEmployeeAbsenceByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listEmployeeAbsenceByEmployeeId.sql')).toString(),
    listClassesByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listClassesByEmployeeId.sql')).toString(),
    listUpcomingClassesByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listUpcomingClassesByEmployeeId.sql')).toString(),
    listBenefitsByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listBenefitsByEmployeeId.sql')).toString(),
    updateEmployeeClassById: fs.readFileSync(path.join(basePath, 'employees/updateEmployeeClassById.sql')).toString(),
    listCoveredDependentsByEmployeeId: fs.readFileSync(path.join(basePath, 'employees/listCoveredDependentsByEmployeeId.sql')).toString(),
    listCoveredBeneficiariesByEmployeeId: fs
        .readFileSync(path.join(basePath, 'employees/listCoveredBeneficiariesByEmployeeId.sql'))
        .toString(),
    listEmployeeBeneficiariesByEmployeeIdAndRelationshipType: fs.readFileSync(path.join(basePath, 'employees/listEmployeeBeneficiariesByEmployeeIdAndRelationshipType.sql')).toString(),
    getAgeBandPremiumByAgeAndPlanId: fs.readFileSync(path.join(basePath, 'employees/getAgeBandPremiumByAgeAndPlanId.sql')).toString(),
    getDirectReportOfManagerByEmailAddressAndEmployeeId: fs
        .readFileSync(path.join(basePath, 'employees/getDirectReportOfManagerByEmailAddressAndEmployeeId.sql'))
        .toString(),
    createAuditOutboxTriggerScheduledTask: fs.readFileSync(path.join(basePath, 'companies/createAuditOutboxTriggerScheduledTask.sql')).toString(),
    executeCreateAuditOutboxTrigger: fs.readFileSync(path.join(basePath, 'companies/executeCreateAuditOutboxTrigger.sql')).toString(),

    // Group Term Life
    createGtlRecord: fs.readFileSync(path.join(basePath, 'gtl/createGtlRecord.sql')).toString(),
    listGtlRecordsByEmployee: fs.readFileSync(path.join(basePath, 'gtl/listGtlRecordsByEmployee.sql')).toString(),
    updateGtlRecord: fs.readFileSync(path.join(basePath, 'gtl/updateGtlRecord.sql')).toString(),
    deleteGtlRecord: fs.readFileSync(path.join(basePath, 'gtl/deleteGtlRecord.sql')).toString(),

    // Users
    getUserById: fs.readFileSync(path.join(basePath, 'users/getUserById.sql')).toString(),
    getUserSsoIdByEvoCompanyCode: fs.readFileSync(path.join(basePath, 'users/getUserSsoIdByEvoCompanyCode.sql')).toString(),
    updateUserSsoIdById: fs.readFileSync(path.join(basePath, 'users/updateUserSsoIdById.sql')).toString(),

    // JazzHR Applicant Tracking
    applicantCreate: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplicant.sql')).toString(),
    documentCreate: fs.readFileSync(path.join(basePath, 'applicant-tracking/createDocument.sql')).toString(),
    getJazzhrSecretKeyByCompanyId: fs.readFileSync(path.join(basePath, 'applicant-tracking/getJazzhrSecretKeyByCompanyId.sql')).toString(),

    // SecResources
    listSecResourcesBySubGroupId: fs.readFileSync(path.join(basePath, 'sec-resource/listSecResourcesBySubGroupId.sql')).toString(),
    getSecResourceSubGroupById: fs.readFileSync(path.join(basePath, 'sec-resource/getSecResourceSubGroupById.sql')).toString(),
    listSecResourceSubGroups: fs.readFileSync(path.join(basePath, 'sec-resource/listSecResourceSubGroups.sql')).toString(),
    getQuickLinkVisibilityByUsername: fs.readFileSync(path.join(basePath, 'sec-resource/getQuickLinkVisibilityByUsername.sql')).toString(),

    // Employee Import
    getCompanyIdByCompanyCode: fs.readFileSync(path.join(basePath, 'employee-import/getCompanyIdByCompanyCode.sql')).toString(),
    listDataImportTypes: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportTypes.sql')).toString(),
    listDataImportByCompany: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportByCompany.sql')).toString(),
    listDataImportByCompanyAndDataImportType: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportByCompanyAndType.sql')).toString(),
    listDataImportByCompanyWithSearch: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportByCompanyWithSearch.sql')).toString(),
    listDataImportEventDetail: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportEventDetail.sql')).toString(),
    getDataImportTypeById: fs.readFileSync(path.join(basePath, 'employee-import/getDataImportTypeById.sql')).toString(),
    insertDataImportEvent: fs.readFileSync(path.join(basePath, 'employee-import/insertDataImportEvent.sql')).toString(),
    insertDataImportEventDetail: fs.readFileSync(path.join(basePath, 'employee-import/insertDataImportEventDetail.sql')).toString(),
    updateDataImportEventError: fs.readFileSync(path.join(basePath, 'employee-import/updateDataImportEventError.sql')).toString(),
    updateDataImportEventStatus: fs.readFileSync(path.join(basePath, 'employee-import/updateDataImportEventStatus.sql')).toString(),
    getDataImportEventDetailSummary: fs.readFileSync(path.join(basePath, 'employee-import/getDataImportEventDetailSummary.sql')).toString(),
    getUserFromDataImportEventID: fs.readFileSync(path.join(basePath, 'employee-import/getUserFromDataImportEventID.sql')).toString(),
    updateEmployee: fs.readFileSync(path.join(basePath, 'employee-import/updateEmployee.sql')).toString(),
    updateEmployeeInBulk: fs.readFileSync(path.join(basePath, 'employee-import/updateEmployeeInBulk.sql')).toString(),
    validateEmployeeDetails: fs.readFileSync(path.join(basePath, 'employee-import/validateEmployeeDetails.sql')).toString(),
    validateEmployeeDetailsInBulk: fs.readFileSync(path.join(basePath, 'employee-import/validateEmployeeDetailsInBulk.sql')).toString(),
    getEmployeeByEmployeeCode: fs.readFileSync(path.join(basePath, 'employee-import/getEmployeeByEmployeeCode.sql')).toString(),
    getPositionTypeEvoIdByCode: fs.readFileSync(path.join(basePath, 'employee-import/getPositionTypeEvoIdByCode.sql')).toString(),
    getWorkerCompTypeEvoIdByCode: fs.readFileSync(path.join(basePath, 'employee-import/getWorkerCompTypeEvoIdByCode.sql')).toString(),
    getImportTypeAndImportedFilePathByImportEventID: fs.readFileSync(path.join(basePath, 'employee-import/getImportTypeAndImportedFilePathByImportEventID.sql')).toString(),
    getCSVRowsByStatus: fs.readFileSync(path.join(basePath, 'employee-import/getCSVRowsByStatus.sql')).toString(),
    updateDataImportEventDetailError: fs.readFileSync(path.join(basePath, 'employee-import/updateDataImportEventDetailError.sql')).toString(),
    validateCompensation: fs.readFileSync(path.join(basePath, 'employee-import/validateCompensation.sql')).toString(),
    validateCompensationInBulk: fs.readFileSync(path.join(basePath, 'employee-import/validateCompensationInBulk.sql')).toString(),
    insertCompensation: fs.readFileSync(path.join(basePath, 'employee-import/insertCompensation.sql')).toString(),
    insertCompensationInBulk: fs.readFileSync(path.join(basePath, 'employee-import/insertCompensationInBulk.sql')).toString(),
    getEmployeeCompensationByEmployeeID: fs.readFileSync(path.join(basePath, 'employee-import/getEmployeeCompensationByEmployeeID.sql')).toString(),
    updateDataImportEventDetailProcessed: fs.readFileSync(path.join(basePath, 'employee-import/updateDataImportEventDetailProcessed.sql')).toString(),
    updateCompensation: fs.readFileSync(path.join(basePath, 'employee-import/updateCompensation.sql')).toString(),
    validateAlternateRate: fs.readFileSync(path.join(basePath, 'employee-import/validateAlternateRate.sql')).toString(),
    validateAlternateRateInBulk: fs.readFileSync(path.join(basePath, 'employee-import/validateAlternateRateInBulk.sql')).toString(),
    insertAlternateRate: fs.readFileSync(path.join(basePath, 'employee-import/insertAlternateRate.sql')).toString(),
    isEVOIntegratedCompany: fs.readFileSync(path.join(basePath, 'employee-import/isEVOIntegratedCompany.sql')).toString(),
    getAlternateRatesByEmployee: fs.readFileSync(path.join(basePath, 'employee-import/getAlternateRatesByEmployee.sql')).toString(),
    updateAlternateRate: fs.readFileSync(path.join(basePath, 'employee-import/updateAlternateRate.sql')).toString(),
    getAllFieldsForUpdateEmployee: fs.readFileSync(path.join(basePath, 'employee-import/getAllFieldsForUpdateEmployee.sql')).toString(),
    listDataImport: fs.readFileSync(path.join(basePath, 'employee-import/listDataImport.sql')).toString(),
    listDataImportByType: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportByType.sql')).toString(),
    listDataImportWithSearch: fs.readFileSync(path.join(basePath, 'employee-import/listDataImportWithSearch.sql')).toString(),
    checksNewEmployeeCodeIsInUse: fs.readFileSync(path.join(basePath, 'employee-import/checksNewEmployeeCodeIsInUse.sql')).toString(),
    deleteAlternateRate: fs.readFileSync(path.join(basePath, 'employee-import/deleteAlternateRate.sql')).toString(),
    deleteCompensation: fs.readFileSync(path.join(basePath, 'employee-import/deleteCompensation.sql')).toString(),

    // Aplicant Tracking
    getQuestionTypeByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionTypeByTenant.sql')).toString(),

    getQuestionBankById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankById.sql')).toString(),
    getQuestionBankByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankByTenant.sql')).toString(),
    getQuestionBankByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankByCompany.sql')).toString(),
    createQuestionBank: fs.readFileSync(path.join(basePath, 'applicant-tracking/createQuestionBank.sql')).toString(),
    updateQuestionBank: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateQuestionBank.sql')).toString(),
    deleteQuestionBank: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteQuestionBank.sql')).toString(),
    
    getHardStatusTypeByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getHardStatusTypeByTenant.sql')).toString(),    
    
    getSoftStatusTypeByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getSoftStatusTypeByTenant.sql')).toString(),
    getSoftStatusTypeByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getSoftStatusTypeByCompany.sql')).toString(),
    getSoftStatusTypeById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getSoftStatusTypeById.sql')).toString(),
    getSoftStatusTypesByCompanyAndHardStatusType: fs.readFileSync(path.join(basePath, 'applicant-tracking/getSoftStatusTypesByCompanyAndHardStatusType.sql')).toString(),
    getSoftStatusTypeByHardStatusType: fs.readFileSync(path.join(basePath, 'applicant-tracking/getSoftStatusTypeByHardStatusType.sql')).toString(),

    getApplicationVersionByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationVersionByTenant.sql')).toString(),
    getApplicationVersionByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationVersionByCompany.sql')).toString(),
    getApplicationVersionById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationVersionById.sql')).toString(),
    createApplicationVersion: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplicationVersion.sql')).toString(),
    updateApplicationVersion: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateApplicationVersion.sql')).toString(),
    deleteApplicationVersion: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteApplicationVersion.sql')).toString(),

    getAppVersionCustomQuestionByAppVersionQuestionBank: fs.readFileSync(path.join(basePath, 'applicant-tracking/getAppVersionCustomQuestionByAppVersionQuestionBank.sql')).toString(),
    createApplicationVersionCustomQuestion: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplicationVersionCustomQuestion.sql')).toString(),
    deleteApplicationVersionCustomQuestion: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteApplicationVersionCustomQuestion.sql')).toString(),

    getQuestionBankMultipleChoiceAnswersById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankMultipleChoiceAnswersById.sql')).toString(),
    getQuestionBankMultipleChoiceAnswersByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankMultipleChoiceAnswersByTenant.sql')).toString(),
    getQuestionBankMultipleChoiceAnswersByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankMultipleChoiceAnswersByCompany.sql')).toString(),
    createQuestionBankMultipleChoiceAnswers: fs.readFileSync(path.join(basePath, 'applicant-tracking/createQuestionBankMultipleChoiceAnswers.sql')).toString(),
    updateQuestionBankMultipleChoiceAnswers: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateQuestionBankMultipleChoiceAnswers.sql')).toString(),
    deleteQuestionBankMultipleChoiceAnswers: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteQuestionBankMultipleChoiceAnswers.sql')).toString(),

    getJobPostingByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getJobPostingByTenant.sql')).toString(),
    getJobPostingByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getJobPostingByCompany.sql')).toString(),
    getJobPostingById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getJobPostingById.sql')).toString(),
    createJobPosting: fs.readFileSync(path.join(basePath, 'applicant-tracking/createJobPosting.sql')).toString(),
    updateJobPosting: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateJobPosting.sql')).toString(),
    deleteJobPosting: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteJobPosting.sql')).toString(),
    
    getJobPostingResponsibleUserByJobPostingAndUser: fs.readFileSync(path.join(basePath, 'applicant-tracking/getJobPostingResponsibleUserByJobPostingAndUser.sql')).toString(),
    createJobPostingResponsibleUser: fs.readFileSync(path.join(basePath, 'applicant-tracking/createJobPostingResponsibleUser.sql')).toString(),
    deleteJobPostingResponsibleUser: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteJobPostingResponsibleUser.sql')).toString(),

    getApplicationByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationByCompany.sql')).toString(),
    getApplicationByKey: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationByKey.sql')).toString(),
    createApplication: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplication.sql')).toString(),
    updateApplication: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateApplication.sql')).toString(),

    getApplicationQuestionBankAnswerById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationQuestionBankAnswerById.sql')).toString(),
    getApplicationQuestionBankAnswerByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationQuestionBankAnswerByTenant.sql')).toString(),
    getApplicationQuestionBankAnswerByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationQuestionBankAnswerByCompany.sql')).toString(),
    createApplicationQuestionBankAnswer: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplicationQuestionBankAnswer.sql')).toString(),
    updateApplicationQuestionBankAnswer: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateApplicationQuestionBankAnswer.sql')).toString(),
    deleteApplicationQuestionBankAnswer: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteApplicationQuestionBankAnswer.sql')).toString(),

    getApplicationNoteByApplicationId: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationNoteByApplicationId.sql')).toString(),
    getApplicationNoteById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationNoteById.sql')).toString(),
    createApplicationNote: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplicationNote.sql')).toString(),
    updateApplicationNote: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateApplicationNote.sql')).toString(),
    deleteApplicationNote: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteApplicationNote.sql')).toString(),

    getApplicationStatusHistoryById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationStatusHistoryById.sql')).toString(),
    getApplicationStatusHistoryByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationStatusHistoryByTenant.sql')).toString(),
    getApplicationStatusHistoryByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getApplicationStatusHistoryByCompany.sql')).toString(),
    createApplicationStatusHistory: fs.readFileSync(path.join(basePath, 'applicant-tracking/createApplicationStatusHistory.sql')).toString(),
    updateApplicationStatusHistory: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateApplicationStatusHistory.sql')).toString(),
    deleteApplicationStatusHistory: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteApplicationStatusHistory.sql')).toString(),

    getQuestionBankGroupById: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankGroupById.sql')).toString(),
    getQuestionBankGroupByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankGroupByTenant.sql')).toString(),
    getQuestionBankGroupByCompany: fs.readFileSync(path.join(basePath, 'applicant-tracking/getQuestionBankGroupByCompany.sql')).toString(),
    createQuestionBankGroup: fs.readFileSync(path.join(basePath, 'applicant-tracking/createQuestionBankGroup.sql')).toString(),
    updateQuestionBankGroup: fs.readFileSync(path.join(basePath, 'applicant-tracking/updateQuestionBankGroup.sql')).toString(),
    deleteQuestionBankGroup: fs.readFileSync(path.join(basePath, 'applicant-tracking/deleteQuestionBankGroup.sql')).toString(),

    getUserPermissions: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getUserPermissions.sql')).toString(),
    getSystemsById: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getSystemsById.sql')).toString(),
    getSystemsByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getSystemsByTenant.sql')).toString(),
    createSystems: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/createSystems.sql')).toString(),
    updateSystems: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/updateSystems.sql')).toString(),
    deleteSystems: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/deleteSystems.sql')).toString(),

    getRolesById: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getRolesById.sql')).toString(),
    getRolesByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getRolesByTenant.sql')).toString(),
    createRoles: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/createRoles.sql')).toString(),
    updateRoles: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/updateRoles.sql')).toString(),
    deleteRoles: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/deleteRoles.sql')).toString(),

    getClaimsById: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getClaimsById.sql')).toString(),
    getClaimsByTenant: fs.readFileSync(path.join(basePath, 'applicant-tracking/security-user-access/getClaimsByTenant.sql')).toString(),
};

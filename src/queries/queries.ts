import * as fs from 'fs';
import * as path from 'path';

export const Queries = {
    // Security
    checkSecurityRoles: fs.readFileSync(path.join(__dirname, 'security/checkSecurityRoles.sql')).toString(),

    // Direct Deposits
    directDepositList: fs.readFileSync(path.join(__dirname, 'direct-deposits/listDirectDepositsByEmployeeId.sql')).toString(),
    getDirectDeposit: fs.readFileSync(path.join(__dirname, 'direct-deposits/getDirectDepositById.sql')).toString(),
    directDepositCreate: fs.readFileSync(path.join(__dirname, 'direct-deposits/createDirectDeposit.sql')).toString(),
    directDepositUpdate: fs.readFileSync(path.join(__dirname, 'direct-deposits/updateDirectDeposit.sql')).toString(),
    directDepositDelete: fs.readFileSync(path.join(__dirname, 'direct-deposits/deleteDirectDepositById.sql')).toString(),
    updateDirectDepositEndDate: fs.readFileSync(path.join(__dirname, 'direct-deposits/updateDirectDepositEndDateById.sql')).toString(),
    checkForDuplicateBankAccounts: fs.readFileSync(path.join(__dirname, 'direct-deposits/checkForDuplicateBankAccounts.sql')).toString(),
    checkForDuplicateRemainderOfPay: fs
        .readFileSync(path.join(__dirname, 'direct-deposits/checkForDuplicateRemainderOfPay.sql'))
        .toString(),
    getEmployeeDirectDepositById: fs.readFileSync(path.join(__dirname, 'direct-deposits/getEmployeeDirectDepositById.sql')).toString(),
    getEvoData: fs.readFileSync(path.join(__dirname, 'direct-deposits/getEvoData.sql')).toString(),

    // Miscellaneous
    databaseList: fs.readFileSync(path.join(__dirname, 'miscellaneous/database.sql')).toString(),

    // Alerts
    alertEventList: fs.readFileSync(path.join(__dirname, 'alerts/listAlertEventsByCompanyId.sql')).toString(),
    listAlertRecipients: fs.readFileSync(path.join(__dirname, 'alerts/listDirectDepositEventRecipientEmailAddresses.sql')).toString(),
    smtpCredentials: fs.readFileSync(path.join(__dirname, 'alerts/getSmtpCredentials.sql')).toString(),
    directDepositMetadata: fs.readFileSync(path.join(__dirname, 'alerts/directDepositMetadata.sql')).toString(),

    // Audit
    createAuditEntry: fs.readFileSync(path.join(__dirname, 'audit/createAuditEntry.sql')).toString(),
    createAuditDetailEntry: fs.readFileSync(path.join(__dirname, 'audit/createAuditDetailEntry.sql')).toString(),
    getEmployeeDisplayNameById: fs.readFileSync(path.join(__dirname, 'audit/getEmployeeDisplayNameById.sql')).toString(),
};

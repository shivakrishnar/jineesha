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
    checkForDuplicateBankAccounts: fs.readFileSync(path.join(__dirname, 'direct-deposits/checkForDuplicateBankAccounts.sql')).toString(),
    checkForDuplicateRemainderOfPay: fs
        .readFileSync(path.join(__dirname, 'direct-deposits/checkForDuplicateRemainderOfPay.sql'))
        .toString(),
    getEmployeeDirectDepositById: fs.readFileSync(path.join(__dirname, 'direct-deposits/getEmployeeDirectDepositById.sql')).toString(),
    getEvoData: fs.readFileSync(path.join(__dirname, 'direct-deposits/getEvoData.sql')).toString(),

    // Miscellaneous
    databaseList: fs.readFileSync(path.join(__dirname, 'miscellaneous/database.sql')).toString(),
};

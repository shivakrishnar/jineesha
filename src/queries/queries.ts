import * as fs from 'fs-extra';
import * as path from 'path';

export const Queries = {
  // Direct Deposits
  directDepositList: fs.readFileSync(path.join(__dirname, 'direct-deposits/listDirectDepositsByEmployeeId.sql')).toString(),
  getDirectDeposit: fs.readFileSync(path.join(__dirname, 'direct-deposits/getDirectDepositById.sql')).toString(),
  directDepositCreate: fs.readFileSync(path.join(__dirname, 'direct-deposits/createDirectDeposit.sql')).toString(),
  checkForDuplicateDirectDeposits: fs.readFileSync(path.join(__dirname, 'direct-deposits/checkForDuplicates.sql')).toString(),
};
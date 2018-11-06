import * as fs from 'fs-extra';
import * as path from 'path';

export const Queries = {
  // Direct Deposits
  directDepositList: fs.readFileSync(path.join(__dirname, 'direct-deposits/listDirectDepositsByEmployeeId.sql')).toString(),
};
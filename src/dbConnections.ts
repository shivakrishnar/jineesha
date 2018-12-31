import { getErrorResponse } from './errors/error.service';
/**
 * NB: This is an interim approach to determining the RDS instance and
 * database tenant is associated with. Long term, a likely solution
 * will involve deducing the information from the API uri.
 */
export function findConnectionString(tenantId: string): any {
  const connectionString = dbConnectionStrings().find((d) => {
    return d.tenantId === tenantId;
  });

  if (connectionString === undefined) {
    throw getErrorResponse(0);
  }

  return connectionString;
}

function dbConnectionStrings(): any[] {
  return JSON.parse(`[
    {
      "tenantId": "c807d7f9-b391-4525-ac0e-31dbc0cf202b",
      "rdsEndpoint": "hrnext.cvm5cdcqwljp.us-east-1.rds.amazonaws.com",
      "databaseName": "adhr-1"
    }
  ]`);
}

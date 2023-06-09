export const devTenantId = 'e5a19feb-0fca-4b61-9b7a-43a2a6dd7414';

export const validId = '72';
export const devCompanyId = '1';
export const domainName = 'https://test.evolution-software.com';
export const path = '/identity/tenants/1234/companies/1/employees/123/direct-deposits';

export const dataImportTypes = {
  recordsets: [ [ [Object], [Object] ] ],
  recordset: [
    {
      ID: '1',
      Name: 'Employee update1',
      Description: 'Employee update Desc',
      ImportProcess: 'UPDATE',
      LastProgramEvent: ''
    },
    {
      ID: '2',
      Name: 'Alternate Rate update',
      Description: 'Alternate Rate Desc',
      ImportProcess: 'UPDATE',
      LastProgramEvent: ''
    }
  ],
  output: {},
  rowsAffected: [ 2 ]
};

export const dataImportTypeResponse = {
    recordsets: [ [ [Object], [Object] ] ],
    recordset: [
      {
        id: '1',
        name: 'Employee update1',
        description: 'Employee update Desc',
        importProcess: 'UPDATE',
        lastProgramEvent: ''
      },
      {
        id: '2',
        name: 'Alternate Rate update',
        description: 'Alternate Rate Desc',
        importProcess: 'UPDATE',
        lastProgramEvent: ''
      }
    ],
    output: {},
    rowsAffected: [ 2 ]
  };
  
export const dataImports = {
  recordsets: [
      [{ totalCount: 3 }],
      [
          {
              ID: "47",
              CompanyID: "1",
              DataImportTypeID: "1",
              Status: "Completed",
              LastProgramEvent: "",
              CreationDate: "2023-07-17T00:00:00.000Z",
              LastUpdatedDate: "2023-06-01T00:00:00.000Z",
              LastUserID: "1"
          },
          {
              ID: "46",
              CompanyID: "1",
              DataImportTypeID: "1",
              Status: "Completed",
              LastProgramEvent: "",
              CreationDate: "2023-07-16T00:00:00.000Z",
              LastUpdatedDate: "2023-06-01T00:00:00.000Z",
              LastUserID: "1"
          },
          {
              ID: "45",
              CompanyID: "1",
              DataImportTypeID: "1",
              Status: "Completed",
              LastProgramEvent: "",
              CreationDate: "2023-07-15T00:00:00.000Z",
              LastUpdatedDate: "2023-06-01T00:00:00.000Z",
              LastUserID: "1"
          },
      ],
  ],
  recordset: [{ totalCount: 3 }],
  output: {},
  rowsAffected: [1, 1, 3],
};

export const dataImportsResponse = {
  limit: 30,
  count: 3,
  totalCount: 3,
  results: [
      {
          id: "47",
          companyId: "1",
          dataImportTypeId: "1",
          status: "Completed",
          lastProgramEvent: "",
          creationDate: "2023-07-17T00:00:00.000Z",
          lastUpdatedDate: "2023-06-01T00:00:00.000Z",
          lastUserId: "1"
      },
      {
          id: "46",
          companyId: "1",
          dataImportTypeId: "1",
          status: "Completed",
          lastProgramEvent: "",
          creationDate: "2023-07-16T00:00:00.000Z",
          lastUpdatedDate: "2023-06-01T00:00:00.000Z",
          lastUserId: "1"
      },
      {
          id: "45",
          companyId: "1",
          dataImportTypeId: "1",
          status: "Completed",
          lastProgramEvent: "",
          creationDate: "2023-07-15T00:00:00.000Z",
          lastUpdatedDate: "2023-06-01T00:00:00.000Z",
          lastUserId: "1"
      },
  ],
};
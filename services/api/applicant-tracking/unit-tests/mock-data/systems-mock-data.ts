const defaultObj1 = {
    id: 1,
	name: 'ATS',
	description: 'Applicant Tracking System'
  };
  
  const defaultObj2 = {
    id: 2,
	name: 'Payroll',
	description: 'Payroll System'
  };
  
  //
  // getSystemsByTenant
  //
  export const getSystemsByTenantDBResponse = {
      limit: 30,
          count: 2,
      recordsets: [ 
        [
          {
              totalCount: 2
          }
        ],
        [
          {
            ...defaultObj1
          },
          {
            ...defaultObj2
          }
        ]
      ],
      recordset: [
        {
          totalCount: 2
        }
      ],
      output: {},
      rowsAffected: [ 1, 1, 1, 2 ],
  };
  
  export const getSystemsByTenantDBResponseEmpty = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
  };
  
  export const getSystemsByTenantAPIResponse = [
    {
      ...defaultObj1
    },
    {
      ...defaultObj2
    }
  ];
  
  //
  // getSystemsById
  //
  export const SystemsToGetById = '1';
  export const SystemsToGetByIdWithCharacter = '1abc';
  
  export const getSystemsByIdDBResponse = {
    recordset: [{
      ...defaultObj1
    }]
  };
  
  export const getSystemsByIdDBResponseEmpty = {
    recordset: {}
  };
  
  export const getSystemsByIdAPIResponse = {
    ...defaultObj1
  };
  
  //
  // createSystems
  //
  export const createSystemsRequestBody = {
    ...defaultObj1
  };
  
  export const createSystemsDBResponse = {
    recordset: [{ ID: 1 }],
  };
  
  export const createSystemsAPIResponse = {
    ...defaultObj1
  };
  
  //
  // updateSystems
  //
  export const updateSystemsRequestBody = {
    ...defaultObj1
  };
  
  export const updateSystemsAPIResponse = true;
  
  //
  // deleteSystems
  //
  export const SystemsToDeleteId = '1';
  export const SystemsToDeleteAnotherId = '4';
  export const SystemsToDeleteIdWithCharacter = '1abc';
  export const deleteSystemsAPIResponse = true;
  
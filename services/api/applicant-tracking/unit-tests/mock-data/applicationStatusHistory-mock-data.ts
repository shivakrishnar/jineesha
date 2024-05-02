//
// getApplicationStatusHistoryById
//
export const ApplicationStatusHistoryToGetById = '1';
export const ApplicationStatusHistoryToGetByIdWithCharacter = '1abc';

export const getApplicationStatusHistoryByIdDBResponse = {
  recordset: [{
    id: 1,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atApplicationId: 38,
    statusChangedDate: '2024-04-22',
    statusChangedByUsername: 'applicant',
    changedStatusTitle: 'Application Completed'
  }]
};

export const getApplicationStatusHistoryByIdDBResponseEmpty = {
  recordset: {}
};

export const getApplicationStatusHistoryByIdAPIResponse = {
    id: 1,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atApplicationId: 38,
    statusChangedDate: '2024-04-22',
    statusChangedByUsername: 'applicant',
    changedStatusTitle: 'Application Completed'
};

//
// getApplicationStatusHistoryByTenant
//
export const getApplicationStatusHistoryByTenantDBResponse = {
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
            id: 1,
            companyId: 3,
            companyName: 'Artsy Tartsy Bakery',
            atApplicationId: 38,
            statusChangedDate: '2024-04-22',
            statusChangedByUsername: 'applicant',
            changedStatusTitle: 'Application Completed'
        },
        {
            id: 2,
            companyId: 63,
            companyName: 'Better Than Chocolate',
            atApplicationId: 43,
            statusChangedDate: '2024-04-22',
            statusChangedByUsername: 'applicant',
            changedStatusTitle: 'Application Pending'
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

export const getApplicationStatusHistoryByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getApplicationStatusHistoryByTenantAPIResponse = [
    {
        id: 1,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        atApplicationId: 38,
        statusChangedDate: '2024-04-22',
        statusChangedByUsername: 'applicant',
        changedStatusTitle: 'Application Completed'
    },
    {
        id: 2,
        companyId: 63,
        companyName: 'Better Than Chocolate',
        atApplicationId: 43,
        statusChangedDate: '2024-04-22',
        statusChangedByUsername: 'applicant',
        changedStatusTitle: 'Application Pending'
    }
];

//
// getApplicationStatusHistoryByCompany
//
export const getApplicationStatusHistoryByCompanyDBResponse = {
    limit: 30,
    count: 1,
    recordsets: [ 
      [
        {
            totalCount: 1
        }
      ],
      [
        {
            id: 1,
            companyId: 3,
            companyName: 'Artsy Tartsy Bakery',
            atApplicationId: 38,
            statusChangedDate: '2024-04-22',
            statusChangedByUsername: 'applicant',
            changedStatusTitle: 'Application Completed'
        }
      ]
    ],
    recordset: [
      {
        totalCount: 1
      }
    ],
    output: {},
    rowsAffected: [ 1, 1, 1, 1 ],
  };
  
  export const getApplicationStatusHistoryByCompanyDBResponseEmpty = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
  };
  
  export const getApplicationStatusHistoryByCompanyAPIResponse = [
    {
        id: 1,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        atApplicationId: 38,
        statusChangedDate: '2024-04-22',
        statusChangedByUsername: 'applicant',
        changedStatusTitle: 'Application Completed'
    }
  ];

//
// createApplicationStatusHistory
//
export const createApplicationStatusHistoryRequestBody = {
  atApplicationId: 38,
  statusChangedDate: new Date('2024-04-22'),
  statusChangedByUsername: 'applicant',
  changedStatusTitle: 'Application Completed'
};

export const createApplicationStatusHistoryDBResponse = {
  recordset: [{ ID: 1 }],
};

export const createApplicationStatusHistoryAPIResponse = {
  id: 1,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atApplicationId: 38,
  statusChangedDate: '2024-04-22',
  statusChangedByUsername: 'applicant',
  changedStatusTitle: 'Application Completed'
};

//
// updateApplicationStatusHistory
//
export const updateApplicationStatusHistoryRequestBody = {
  id: 1,
  atApplicationId: 38,
  statusChangedDate: new Date('2024-04-28'),
  statusChangedByUsername: 'Marden',
  changedStatusTitle: 'Application Pending'
};

export const updateApplicationStatusHistoryAPIResponse = true;

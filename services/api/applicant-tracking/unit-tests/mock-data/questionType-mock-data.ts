//
// getQuestionTypeByTenant
//
export const getQuestionTypeByTenantDBResponse = {
  recordsets: [ [ [Object], [Object], [Object], [Object] ] ],
  recordset: [
    {
      id: '1',
      code: '1',
      description: 'Yes/No',
      priority: 10,
      active: true
    },
    {
      id: '2',
      code: '2',
      description: 'Free Form Text',
      priority: 20,
      active: true
    },
    {
      id: '3',
      code: '3',
      description: 'Date',
      priority: 30,
      active: true
    },
    {
      id: '4',
      code: '4',
      description: 'Multiple Choice',
      priority: 40,
      active: true
    }
  ],
  output: {},
  rowsAffected: [ 4 ],
};

export const getQuestionTypeByTenantDBResponseEmpty = {
  recordsets: [ [ ] ],
  recordset: [ ],
  output: {},
  rowsAffected: [ ],
};

export const getQuestionTypeByTenantAPIResponse = [
  {
    id: '1',
    code: '1',
    description: 'Yes/No',
    priority: 10,
    active: true
  },
  {
    id: '2',
    code: '2',
    description: 'Free Form Text',
    priority: 20,
    active: true
  },
  {
    id: '3',
    code: '3',
    description: 'Date',
    priority: 30,
    active: true
  },
  {
    id: '4',
    code: '4',
    description: 'Multiple Choice',
    priority: 40,
    active: true
  } 
];

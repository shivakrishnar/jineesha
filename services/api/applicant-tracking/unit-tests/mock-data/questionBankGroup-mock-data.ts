const defaultObjCompany3 = {
    id: 1,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    groupName: 'Group Test 1'
  };
  
  const defaultObjCompany4 = {
    id: 2,
    companyId: 4,
    companyName: 'Another Company',
    groupName: 'Group Test 2'
  };
  
  //
  // getQuestionBankGroupByTenant
  //
  export const getQuestionBankGroupByTenantDBResponse = {
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
            ...defaultObjCompany3
          },
          {
            ...defaultObjCompany4
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
  
  export const getQuestionBankGroupByTenantDBResponseEmpty = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
  };
  
  export const getQuestionBankGroupByTenantAPIResponse = [
    {
      ...defaultObjCompany3
    },
    {
      ...defaultObjCompany4
    }
  ];
  
  //
  // getQuestionBankGroupByCompany
  //
  export const getQuestionBankGroupByCompanyDBResponse = {
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
          ...defaultObjCompany3
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
  
  export const getQuestionBankGroupByCompanyDBResponseEmpty = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
  };
  
  export const getQuestionBankGroupByCompanyAPIResponse = [
    {
      ...defaultObjCompany3
    }
  ];
  
  //
  // getQuestionBankGroupById
  //
  export const QuestionBankGroupToGetById = '1';
  export const QuestionBankGroupToGetByIdWithCharacter = '1abc';
  
  export const getQuestionBankGroupByIdDBResponse = {
    recordset: [{
      ...defaultObjCompany3
    }]
  };
  
  export const getQuestionBankGroupByIdDBResponseEmpty = {
    recordset: {}
  };
  
  export const getQuestionBankGroupByIdAPIResponse = {
    ...defaultObjCompany3
  };
  
  //
  // createQuestionBankGroup
  //
  export const createQuestionBankGroupRequestBody = {
    ...defaultObjCompany3
  };
  
  export const createQuestionBankGroupDBResponse = {
    recordset: [{ ID: 1 }],
  };
  
  export const createQuestionBankGroupAPIResponse = {
    ...defaultObjCompany3
  };
  
  //
  // updateQuestionBankGroup
  //
  export const updateQuestionBankGroupRequestBody = {
    ...defaultObjCompany3
  };
  
  export const updateQuestionBankGroupAPIResponse = true;
  
  //
  // deleteQuestionBankGroup
  //
  export const QuestionBankGroupToDeleteId = '1';
  export const QuestionBankGroupToDeleteAnotherId = '4444';
  export const QuestionBankGroupToDeleteIdWithCharacter = '1abc';
  export const deleteQuestionBankGroupAPIResponse = true;
  
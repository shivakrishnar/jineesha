const defaultObjCompany3 = {
  id: 33,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atQuestionBankGroupId: 1,
  groupName: 'Group Test',
  atQuestionTypeId: 2,
  questionTitle: 'Testing title',
  questionText: 'Testing text',
  active: true,
  sequence: 1,
  isRequired: false
};

const defaultObjCompany4 = {
  id: 17,
  companyId: 4,
  companyName: 'Artsy Tartsy Bakery',
  atQuestionBankGroupId: 2,
  groupName: 'Group Test 2',
  atQuestionTypeId: 4,
  questionTitle: 'Survey Q 3',
  questionText: 'Question 3 seq 1',
  active: false,
  sequence: 1,
  isRequired: false
};

//
// getQuestionBankByTenant
//
export const getQuestionBankByTenantDBResponse = {
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

export const getQuestionBankByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBankByTenantAPIResponse = [
  {
    ...defaultObjCompany3
  },
  {
    ...defaultObjCompany4
  }
];

//
// getQuestionBankByCompany
//
export const getQuestionBankByCompanyDBResponse = {
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

export const getQuestionBankByCompanyDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBankByCompanyAPIResponse = [
  {
    ...defaultObjCompany3
  }
];

//
// getQuestionBankById
//
export const questionBankToGetById = '33';
export const questionBankToGetByIdWithCharacter = '33abc';

export const getQuestionBankByIdDBResponse = {
  recordset: [{
    ...defaultObjCompany3
  }]
};

export const getQuestionBankByIdDBResponseEmpty = {
  recordset: {}
};

export const getQuestionBankByIdAPIResponse = {
  ...defaultObjCompany3
};

//
// createQuestionBank
//
export const createQuestionBankRequestBody = {
  ...defaultObjCompany3
};

export const createQuestionBankDBResponse = {
  recordset: [{ ID: 33 }],
};

export const createQuestionBankAPIResponse = {
  ...defaultObjCompany3
};

//
// updateQuestionBank
//
export const updateQuestionBankRequestBody = {
  ...defaultObjCompany3
};

export const updateQuestionBankAPIResponse = true;

//
// deleteQuestionBank
//
export const questionBankToDeleteId = '33';
export const questionBankToDeleteAnotherId = '4444';
export const questionBankToDeleteIdWithCharacter = '33abc';
export const deleteQuestionBankAPIResponse = true;

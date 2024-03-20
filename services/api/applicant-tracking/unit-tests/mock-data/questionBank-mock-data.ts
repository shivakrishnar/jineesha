//
// getQuestionBanksByTenant
//
export const getQuestionBanksByTenantDBResponse = {
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
          id: 33,
          companyId: 3,
          companyName: 'Artsy Tartsy Bakery',
          atQuestionTypeId: 2,
          questionTitle: 'Testing title',
          questionText: 'Testing text',
          active: true,
          sequence: 1,
          isRequired: false
        },
        {
          id: 17,
          companyId: 4,
          companyName: 'Artsy Tartsy Bakery',
          atQuestionTypeId: 4,
          questionTitle: 'Survey Q 3',
          questionText: 'Question 3 seq 1',
          active: false,
          sequence: 1,
          isRequired: false
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

export const getQuestionBanksByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBanksByTenantAPIResponse = [
  {
    id: 33,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionTypeId: 2,
    questionTitle: 'Testing title',
    questionText: 'Testing text',
    active: true,
    sequence: 1,
    isRequired: false
  },
  {
    id: 17,
    companyId: 4,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionTypeId: 4,
    questionTitle: 'Survey Q 3',
    questionText: 'Question 3 seq 1',
    active: false,
    sequence: 1,
    isRequired: false
  }
];

//
// getQuestionBanksByCompany
//
export const getQuestionBanksByCompanyDBResponse = {
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
        id: 33,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        atQuestionTypeId: 2,
        questionTitle: 'Testing title',
        questionText: 'Testing text',
        active: true,
        sequence: 1,
        isRequired: false
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

export const getQuestionBanksByCompanyDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBanksByCompanyAPIResponse = [
  {
    id: 33,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionTypeId: 2,
    questionTitle: 'Testing title',
    questionText: 'Testing text',
    active: true,
    sequence: 1,
    isRequired: false
  }
];

//
// getQuestionBankById
//
export const getQuestionBankByIdDBResponse = {
  recordset: [{
    id: 33,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionTypeId: 2,
    questionTitle: "What's is your name - from postman",
    questionText: "Please tell me your name! - from postman's",
    active: true,
    sequence: 1,
    isRequired: true
  }]
};

export const getQuestionBankByIdDBResponseEmpty = {
  recordset: {}
};

export const getQuestionBankByIdAPIResponse = {
  id: 33,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atQuestionTypeId: 2,
  questionTitle: "What's is your name - from postman",
  questionText: "Please tell me your name! - from postman's",
  active: true,
  sequence: 1,
  isRequired: true
};

//
// createQuestionBank
//
export const createQuestionBankRequestBody = {
  companyId: 3,
  atQuestionTypeId: 2,
  questionTitle: "What's is your name - from postman",
  questionText: "Please tell me your name! - from postman's",
  active: true,
  sequence: 1,
  isRequired: true
};

export const createQuestionBankDBResponse = {
  recordset: [{ ID: 33 }],
};

export const createQuestionBankAPIResponse = {
  id: 33,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atQuestionTypeId: 2,
  questionTitle: "What's is your name - from postman",
  questionText: "Please tell me your name! - from postman's",
  active: true,
  sequence: 1,
  isRequired: true
};

//
// updateQuestionBank
//
export const updateQuestionBankRequestBody = {
  id: 33,
  companyId: 3,
  atQuestionTypeId: 2,
  questionTitle: "What's is your name - from postman",
  questionText: "Please tell me your name! - from postman's",
  active: true,
  sequence: 1,
  isRequired: true
};

export const updateQuestionBankAPIResponse = true;

//
// deleteQuestionBank
//
export const questionBankToDeleteId = '33';
export const questionBankToDeleteAnotherId = '4444';
export const questionBankToDeleteIdWithCharacter = '33abc';
export const deleteQuestionBankAPIResponse = true;

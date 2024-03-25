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

export const getQuestionBankByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBankByTenantAPIResponse = [
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

export const getQuestionBankByCompanyDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBankByCompanyAPIResponse = [
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
export const questionBankToGetById = '33';
export const questionBankToGetByIdWithCharacter = '33abc';

export const getQuestionBankByIdDBResponse = {
  recordset: [{
    id: 33,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionTypeId: 2,
    questionTitle: "What is your name",
    questionText: "My name is Tom",
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
  questionTitle: "What is your name",
  questionText: "My name is Tom",
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
  questionTitle: "What is your name",
  questionText: "My name is Tom",
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
  questionTitle: "What is your name",
  questionText: "My name is Tom",
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
  questionTitle: "What is your name",
  questionText: "My name is Tom",
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

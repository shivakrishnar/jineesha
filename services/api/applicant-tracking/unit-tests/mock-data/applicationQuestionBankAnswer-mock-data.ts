//
// getApplicationQuestionBankAnswerById
//
export const ApplicationQuestionBankAnswerToGetById = '14';
export const ApplicationQuestionBankAnswerToGetByIdWithCharacter = '14abc';

export const getApplicationQuestionBankAnswerByIdDBResponse = {
  recordset: [{
    id: 14,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atApplicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'Testing question text',
    answerDate: '2024-04-08',
    answerYesNo: false,
    answerFreeForm: 'Testing free form',
    answerMultipleChoice: 'Testing multiple choice'
  }]
};

export const getApplicationQuestionBankAnswerByIdDBResponseEmpty = {
  recordset: {}
};

export const getApplicationQuestionBankAnswerByIdAPIResponse = {
  id: 14,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atApplicationId: 3,
  originalATQuestionTypeId: 2,
  originalQuestionText: 'Testing question text',
  answerDate: '2024-04-08',
  answerYesNo: false,
  answerFreeForm: 'Testing free form',
  answerMultipleChoice: 'Testing multiple choice'
};

//
// getApplicationQuestionBankAnswerByTenant
//
export const getApplicationQuestionBankAnswerByTenantDBResponse = {
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
          id: 14,
          companyId: 3,
          companyName: 'Artsy Tartsy Bakery',
          atApplicationId: 3,
          originalATQuestionTypeId: 2,
          originalQuestionText: 'Testing question text',
          answerDate: '2024-04-08',
          answerYesNo: false,
          answerFreeForm: 'Testing free form',
          answerMultipleChoice: 'Testing multiple choice'
        },
        {
          id: 15,
          companyId: 4,
          companyName: 'Another Company',
          atApplicationId: 3,
          originalATQuestionTypeId: 2,
          originalQuestionText: 'some text for question 5 - seq 5',
          answerDate: null,
          answerYesNo: null,
          answerFreeForm: null,
          answerMultipleChoice: null
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

export const getApplicationQuestionBankAnswerByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getApplicationQuestionBankAnswerByTenantAPIResponse = [
  {
    id: 14,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atApplicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'Testing question text',
    answerDate: '2024-04-08',
    answerYesNo: false,
    answerFreeForm: 'Testing free form',
    answerMultipleChoice: 'Testing multiple choice'
  },
  {
    id: 15,
    companyId: 4,
    companyName: 'Another Company',
    atApplicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'some text for question 5 - seq 5',
    answerDate: null,
    answerYesNo: null,
    answerFreeForm: null,
    answerMultipleChoice: null
  }
];

//
// getApplicationQuestionBankAnswerByCompany
//
export const getApplicationQuestionBankAnswerByCompanyDBResponse = {
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
        id: 14,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        atApplicationId: 3,
        originalATQuestionTypeId: 2,
        originalQuestionText: 'Testing question text',
        answerDate: '2024-04-08',
        answerYesNo: false,
        answerFreeForm: 'Testing free form',
        answerMultipleChoice: 'Testing multiple choice'
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

export const getApplicationQuestionBankAnswerByCompanyDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getApplicationQuestionBankAnswerByCompanyAPIResponse = [
  {
    id: 14,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atApplicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'Testing question text',
    answerDate: '2024-04-08',
    answerYesNo: false,
    answerFreeForm: 'Testing free form',
    answerMultipleChoice: 'Testing multiple choice'
  }
];

//
// createApplicationQuestionBankAnswer
//
export const createApplicationQuestionBankAnswerRequestBody = {
  atApplicationId: 3,
  originalATQuestionTypeId: 2,
  originalQuestionText: 'Testing question text',
  answerDate: new Date('2024-04-08'),
  answerYesNo: false,
  answerFreeForm: 'Testing free form',
  answerMultipleChoice: 'Testing multiple choice'
};

export const createApplicationQuestionBankAnswerDBResponse = {
  recordset: [{ ID: 15 }],
};

export const createApplicationQuestionBankAnswerAPIResponse = {
  id: 14,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atApplicationId: 3,
  originalATQuestionTypeId: 2,
  originalQuestionText: 'Testing question text',
  answerDate: '2024-04-08',
  answerYesNo: false,
  answerFreeForm: 'Testing free form',
  answerMultipleChoice: 'Testing multiple choice'
};

//
// updateApplicationQuestionBankAnswer
//
export const updateApplicationQuestionBankAnswerRequestBody = {
  id: 14,
  atApplicationId: 3,
  originalATQuestionTypeId: 2,
  originalQuestionText: 'Testing question text',
  answerDate: new Date('2024-04-08'),
  answerYesNo: false,
  answerFreeForm: 'Testing free form',
  answerMultipleChoice: 'Testing multiple choice'
};

export const updateApplicationQuestionBankAnswerAPIResponse = true;

//
// deleteApplicationQuestionBankAnswer
//
export const ApplicationQuestionBankAnswerToDeleteId = '14';
export const ApplicationQuestionBankAnswerToDeleteAnotherId = '4444';
export const ApplicationQuestionBankAnswerToDeleteIdWithCharacter = '14abc';
export const deleteApplicationQuestionBankAnswerAPIResponse = true;

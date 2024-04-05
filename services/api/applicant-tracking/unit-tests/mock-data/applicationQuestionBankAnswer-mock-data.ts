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
    applicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'some text for question 4 - seq 4',
    answerDate: null,
    answerYesNo: null,
    answerFreeForm: null,
    answerMultipleChoice: null
  }]
};

export const getApplicationQuestionBankAnswerByIdDBResponseEmpty = {
  recordset: {}
};

export const getApplicationQuestionBankAnswerByIdAPIResponse = {
    id: 14,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    applicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'some text for question 4 - seq 4',
    answerDate: null,
    answerYesNo: null,
    answerFreeForm: null,
    answerMultipleChoice: null
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
            applicationId: 3,
            originalATQuestionTypeId: 2,
            originalQuestionText: 'some text for question 4 - seq 4',
            answerDate: null,
            answerYesNo: null,
            answerFreeForm: null,
            answerMultipleChoice: null
        },
        {
            id: 15,
            companyId: 4,
            companyName: 'Another Company',
            applicationId: 3,
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
        applicationId: 3,
        originalATQuestionTypeId: 2,
        originalQuestionText: 'some text for question 4 - seq 4',
        answerDate: null,
        answerYesNo: null,
        answerFreeForm: null,
        answerMultipleChoice: null
    },
    {
        id: 15,
        companyId: 4,
        companyName: 'Another Company',
        applicationId: 3,
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
        applicationId: 3,
        originalATQuestionTypeId: 2,
        originalQuestionText: 'some text for question 4 - seq 4',
        answerDate: null,
        answerYesNo: null,
        answerFreeForm: null,
        answerMultipleChoice: null
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
    applicationId: 3,
    originalATQuestionTypeId: 2,
    originalQuestionText: 'some text for question 4 - seq 4',
    answerDate: null,
    answerYesNo: null,
    answerFreeForm: null,
    answerMultipleChoice: null
  }
];

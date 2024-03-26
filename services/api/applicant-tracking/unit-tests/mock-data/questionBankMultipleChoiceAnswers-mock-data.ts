//
// getQuestionBankMultipleChoiceAnswersByTenant
//
export const getQuestionBankMultipleChoiceAnswersByTenantDBResponse = {
    limit: 30,
	count: 3,
    recordsets: [ 
      [
        {
            totalCount: 3
        }
      ],
      [
        {
            id: 1,
            companyId: 3,
            companyName: 'Artsy Tartsy Bakery',
            atQuestionBankId: 2,
            questionTitle: 'Question 6',
            answer: 'Yes'
        },
        {
            id: 2,
            companyId: 3,
            companyName: 'Artsy Tartsy Bakery',
            atQuestionBankId: 2,
            questionTitle: 'Question 6',
            answer: 'No'
        },
        {
            id: 3,
            companyId: 4,
            companyName: 'Another Company',
            atQuestionBankId: 3,
            questionTitle: 'Question 2',
            answer: 'Need to check'
        }
      ]
    ],
    recordset: [
      {
        totalCount: 3
      }
    ],
    output: {},
    rowsAffected: [ 1, 1, 1, 3 ],
};

export const getQuestionBankMultipleChoiceAnswersByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBankMultipleChoiceAnswersByTenantAPIResponse = [
    {
        id: 1,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        atQuestionBankId: 2,
        questionTitle: 'Question 6',
        answer: 'Yes'
    },
    {
        id: 2,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        atQuestionBankId: 2,
        questionTitle: 'Question 6',
        answer: 'No'
    },
    {
        id: 3,
        companyId: 4,
        companyName: 'Another Company',
        atQuestionBankId: 3,
        questionTitle: 'Question 2',
        answer: 'Need to check'
    }
];

//
// getQuestionBankMultipleChoiceAnswersByCompany
//
export const getQuestionBankMultipleChoiceAnswersByCompanyDBResponse = {
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
          atQuestionBankId: 2,
          questionTitle: 'Question 6',
          answer: 'Yes'
      },
      {
          id: 2,
          companyId: 3,
          companyName: 'Artsy Tartsy Bakery',
          atQuestionBankId: 2,
          questionTitle: 'Question 6',
          answer: 'No'
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

export const getQuestionBankMultipleChoiceAnswersByCompanyDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getQuestionBankMultipleChoiceAnswersByCompanyAPIResponse = [
  {
    id: 1,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionBankId: 2,
    questionTitle: 'Question 6',
    answer: 'Yes'
  },
  {
    id: 2,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionBankId: 2,
    questionTitle: 'Question 6',
    answer: 'No'
  }
];

//
// getQuestionBankMultipleChoiceAnswersById
//
export const QuestionBankMultipleChoiceAnswersToGetById = '1';
export const QuestionBankMultipleChoiceAnswersToGetByIdWithCharacter = '1abc';

export const getQuestionBankMultipleChoiceAnswersByIdDBResponse = {
  recordset: [{
    id: 1,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionBankId: 2,
    questionTitle: 'Question 6',
    answer: 'Yes'
  }]
};

export const getQuestionBankMultipleChoiceAnswersByIdDBResponseEmpty = {
  recordset: {}
};

export const getQuestionBankMultipleChoiceAnswersByIdAPIResponse = {
  id: 1,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atQuestionBankId: 2,
  questionTitle: 'Question 6',
  answer: 'Yes'
};
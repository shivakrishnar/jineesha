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

export const getQuestionBankMultipleChoiceAnswersByIdDBResponseFromAnotherCompany = {
  recordset: [{
    id: 1,
    companyId: 444,
    companyName: 'Another Company',
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

//
// getQuestionBank
//
export const getQuestionBankByIdDBResponseFromAnotherCompany = {
  recordset: [{
    id: 9999,
    companyId: 44,
    companyName: 'Artsy Tartsy Bakery',
    atQuestionTypeId: 2,
    questionTitle: "What is your name",
    questionText: "My name is Tom",
    active: true,
    sequence: 1,
    isRequired: true
  }]
};

export const getQuestionBankByIdDBResponse = {
  recordset: [{
    id: 25,
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

//
// createQuestionBankMultipleChoiceAnswers
//
export const QuestionBankMultipleChoiceAnswersToPostWithWrongQuestionBankId = 9999;

export const createQuestionBankMultipleChoiceAnswersRequestBody = {
  atQuestionBankId: 2,
  answer: "Yes"
};

export const createQuestionBankMultipleChoiceAnswersDBResponse = {
  recordset: [{ ID: 1 }],
};

export const createQuestionBankMultipleChoiceAnswersAPIResponse = {
  id: 1,
  companyId: 3,
  companyName: 'Artsy Tartsy Bakery',
  atQuestionBankId: 2,
  questionTitle: 'Question 6',
  answer: 'Yes'
};

//
// updateQuestionBankMultipleChoiceAnswers
//
export const updateQuestionBankMultipleChoiceAnswersRequestBody = {
  id: 1,
  atQuestionBankId: 14,
  answer: "Test 3 updated"
};

export const updateQuestionBankMultipleChoiceAnswersAPIResponse = true;

//
// deleteQuestionBankMultipleChoiceAnswers
//
export const QuestionBankMultipleChoiceAnswersToDeleteId = '1';
export const QuestionBankMultipleChoiceAnswersToDeleteAnotherId = '4444';
export const QuestionBankMultipleChoiceAnswersToDeleteIdWithCharacter = '1abc';
export const deleteQuestionBankMultipleChoiceAnswersAPIResponse = true;

export const questionBankResponse = {
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
          id: '7',
          companyId: '3',
          companyName: 'Artsy Tartsy Bakery',
          atQuestionTypeId: '4',
          questionTitle: 'Question 6',
          questionText: 'some text for question 6 - seq 1',
          active: true,
          sequence: 1,
          isRequired: true
        },
        {
          id: '17',
          companyId: '3',
          companyName: 'Artsy Tartsy Bakery',
          atQuestionTypeId: '4',
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

export const questionBankResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};
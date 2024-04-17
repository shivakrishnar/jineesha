//
// getApplicationNoteByApplicationId
//

export const applicationIdWithCharacter = '3abc';
export const applicationId = '1';

export const getApplicationNoteByApplicationIdDBResponse = {
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
            id: "1",
            atApplicationId: "10",
            noteEntryDate: "2024-04-17T00:00:00.000Z",
            noteEnteredByUserName: "bdyer@sharklaser.com",
            note: "Test 1"
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
  
export const getApplicationNoteByApplicationIdDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getApplicationNoteByApplicationIdAPIResponse = [
    {
      id: "1",
      atApplicationId: "10",
      noteEntryDate: "2024-04-17T00:00:00.000Z",
      noteEnteredByUserName: "bdyer@sharklaser.com",
      note: "Test 1"
    }
];

//
// getApplicationNoteById
//
export const applicationNoteToGetById = '33';
export const applicationNoteToGetByIdWithCharacter = '33abc';

export const getApplicationNoteByIdDBResponse = {
  recordset: [{
    id: "1",
      atApplicationId: "10",
      noteEntryDate: "2024-04-17T00:00:00.000Z",
      noteEnteredByUserName: "bdyer@sharklaser.com",
      note: "Test 1"
  }]
};

export const getApplicationNoteByIdDBResponseEmpty = {
  recordset: {}
};

export const getApplicationNoteByIdAPIResponse = {
  id: "1",
  atApplicationId: "10",
  noteEntryDate: "2024-04-17T00:00:00.000Z",
  noteEnteredByUserName: "bdyer@sharklaser.com",
  note: "Test 1"
};
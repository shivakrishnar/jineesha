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
            noteEntryDate: null,
            noteEnteredByUsername: "bdyer@sharklaser.com",
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
      noteEntryDate: null,
      noteEnteredByUsername: "bdyer@sharklaser.com",
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
      noteEntryDate: null,
      noteEnteredByUsername: "bdyer@sharklaser.com",
      note: "Test 1"
  }]
};

export const getApplicationNoteByIdDBResponseEmpty = {
  recordset: {}
};

export const getApplicationNoteByIdAPIResponse = {
  id: "1",
  atApplicationId: "10",
  noteEntryDate: null,
  noteEnteredByUsername: "bdyer@sharklaser.com",
  note: "Test 1"
};

//
// updateApplicationNote
//
export const updateApplicationNoteRequestBody = {
  id: 1,
  atApplicationId: 10,
  noteEntryDate: null,
  noteEnteredByUsername: "bdyer@sharklaser.com",
  note: "Test 1"
};

//
// createApplicationNote
//
export const createApplicationNoteRequestBody = {
  atApplicationId: 1,
  noteEnteredByUsername: "bdyer@sharklaser.com",
  note: "Test 1"
};

export const createApplicationNoteDBResponse = {
  recordset: [{ ID: 33 }],
};

export const createApplicationNoteAPIResponse = {
  id: "1",
  atApplicationId: "10",
  noteEntryDate: null,
  noteEnteredByUsername: "bdyer@sharklaser.com",
  note: "Test 1"
};

export const updateApplicationNoteAPIResponse = true;

//
// deleteApplicationNote
//
export const applicationNoteToDeleteId = '33';
export const applicationNoteToDeleteAnotherId = '4444';
export const applicationNoteToDeleteIdWithCharacter = '33abc';
export const deleteApplicationNoteAPIResponse = true;
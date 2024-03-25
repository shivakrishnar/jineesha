//
// createApplicationVersionCustomQuestion
//
export const createAppVersionCustomQuestionRequestBody = {
    aTApplicationVersionId: 11,
    aTQuestionBankId: 33,
};

export const createAppVersionCustomQuestionDBResponse = {
    rowsAffected: [ 1 ],
};

export const createAppVersionCustomQuestionDBResponseEmpty = {
    rowsAffected: [ 0 ],
};

export const getApplicationVersionCustomQuestionDBResponse = {
    recordset: [{ 
        aTApplicationVersionId: 11,
        aTQuestionBankId: 33
    }],
};

//
// deleteApplicationVersionCustomQuestion
//

export const applicationVersionIdWithCharacter = '1abc';
export const questionBankIdWithCharacter = '1abc';

export const applicationVersionId = '11';
export const questionBankId = '33';

export const applicationVersionCustomQuestionResponseEmpty = {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [],
};

export const deleteApplicationVersionCustomQuestionResponse = true;
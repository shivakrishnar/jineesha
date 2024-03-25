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
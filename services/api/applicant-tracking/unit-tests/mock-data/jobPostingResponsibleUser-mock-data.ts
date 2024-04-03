//
// createJobPostingResponsibleUser
//
export const createJobPostingResponsibleUserRequestBody = {
    aTJobPostingId: 11,
    hrNextUserId: 33,
};

export const createJobPostingResponsibleUserDBResponse = {
    rowsAffected: [ 1 ],
};

export const createJobPostingResponsibleUserDBResponseEmpty = {
    rowsAffected: [ 0 ],
};

export const getJobPostingResponsibleUserDBResponse = {
    recordset: [{ 
        aTJobPostingId: 11,
        hrNextUserId: 33
    }],
};
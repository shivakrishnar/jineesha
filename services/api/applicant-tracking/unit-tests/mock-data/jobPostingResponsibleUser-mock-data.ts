//
// createJobPostingResponsibleUser
//
export const createJobPostingResponsibleUserRequestBody = {
    atJobPostingId: 11,
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
        atJobPostingId: 11,
        hrNextUserId: 33
    }],
};

//
// deleteJobPostingResponsibleUser
//

export const jobPostingIdWithCharacter = '1abc';
export const hrNextUserIdWithCharacter = '1abc';

export const jobPostingId = '11';
export const hrNextUserId = '33';

export const jobPostingResponsibleUserResponseEmpty = {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [],
};

export const deleteJobPostingResponsibleUserResponse = true;
export const atApplicationVersionId = '1';

export const applicationVersionResponse = {
    recordsets: [[[Object], [Object]]],
    recordset: [
        {
            id: 1,
            companyId: 3,
            companyName: 'Artsy',
            title: 'Admin Officer',
            description: 'Admin Officer',
            keywordList: 'Good Skill',
            aTApplicationVersionDate: '2023-11-01',
            isSectionOnEmploymentHistory: true,
            isSectionOnEducationHistory: true,
            isSectionOnWorkConditions: true,
            isSectionOnKeywords: true,
            isSectionOnDocuments: true,
            isSectionOnCertification: true,
            isSectionOnPayHistory: true,
            jazzHrPositionOpeningID: null,
        },
        {
            id: 2,
            companyId: 3,
            companyName: 'Artsy',
            title: 'Sales Officer',
            description: 'Sales Officer',
            keywordList: 'keyword one, keyword two, etc...',
            aTApplicationVersionDate: '2024-02-01',
            isSectionOnEmploymentHistory: true,
            isSectionOnEducationHistory: true,
            isSectionOnWorkConditions: true,
            isSectionOnKeywords: true,
            isSectionOnDocuments: true,
            isSectionOnCertification: true,
            isSectionOnPayHistory: true,
            jazzHrPositionOpeningID: null,
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const applicationVersionResponseEmpty = {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [],
};

export const singleApplicationVersionResponse = {
    recordsets: [[[Object]]],
    recordset: [
        {
            id: 1,
            companyId: 3,
            companyName: 'Artsy',
            title: 'Admin Officer',
            description: 'Admin Officer',
            keywordList: 'Good Skill',
            aTApplicationVersionDate: '2023-11-01',
            isSectionOnEmploymentHistory: true,
            isSectionOnEducationHistory: true,
            isSectionOnWorkConditions: true,
            isSectionOnKeywords: true,
            isSectionOnDocuments: true,
            isSectionOnCertification: true,
            isSectionOnPayHistory: true,
            jazzHrPositionOpeningID: null,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const singleApplicationVersionResponseWrongCompany = {
    recordsets: [[[Object]]],
    recordset: [
        {
            id: 1,
            companyId: 1,
            companyName: 'Artsy',
            title: 'Admin Officer',
            description: 'Admin Officer',
            keywordList: 'Good Skill',
            aTApplicationVersionDate: '2023-11-01',
            isSectionOnEmploymentHistory: true,
            isSectionOnEducationHistory: true,
            isSectionOnWorkConditions: true,
            isSectionOnKeywords: true,
            isSectionOnDocuments: true,
            isSectionOnCertification: true,
            isSectionOnPayHistory: true,
            jazzHrPositionOpeningID: null,
        },
    ],
    output: {},
    rowsAffected: [1],
};

//
// createQuestionBank
//
export const createApplicationVersionRequestBody = {
    companyId: 3,
    title: 'Admin Officer',
    description: 'Admin Officer',
    keywordList: 'Good Skill',
    aTApplicationVersionDate: new Date('2023-11-01'),
    isSectionOnEmploymentHistory: true,
    isSectionOnEducationHistory: true,
    isSectionOnWorkConditions: true,
    isSectionOnKeywords: true,
    isSectionOnDocuments: true,
    isSectionOnCertification: true,
    isSectionOnPayHistory: true,
    jazzHrPositionOpeningID: null,
};

export const createApplicationVersionDBResponse = {
    recordset: [{ ID: 1 }],
};

export const createApplicationVersionAPIResponse = {
    id: 1,
    companyId: 3,
    companyName: 'Artsy',
    title: 'Admin Officer',
    description: 'Admin Officer',
    keywordList: 'Good Skill',
    aTApplicationVersionDate: '2023-11-01',
    isSectionOnEmploymentHistory: true,
    isSectionOnEducationHistory: true,
    isSectionOnWorkConditions: true,
    isSectionOnKeywords: true,
    isSectionOnDocuments: true,
    isSectionOnCertification: true,
    isSectionOnPayHistory: true,
    jazzHrPositionOpeningID: null,
};

//
// updateApplicationVersion
//
export const updateApplicationVersionRequestBody = {
    id: 1,
    companyId: 3,
    companyName: 'Artsy',
    title: 'Admin Officer',
    description: 'Admin Officer',
    keywordList: 'Good Skill',
    aTApplicationVersionDate: new Date('2023-11-01'),
    isSectionOnEmploymentHistory: true,
    isSectionOnEducationHistory: true,
    isSectionOnWorkConditions: true,
    isSectionOnKeywords: true,
    isSectionOnDocuments: true,
    isSectionOnCertification: true,
    isSectionOnPayHistory: true,
    jazzHrPositionOpeningID: null,
};

export const updateApplicationVersionAPIResponse = true;

//
// deleteQuestionBank
//
export const applicationVersionToDeleteId = '1';
export const applicationVersionToDeleteAnotherId = '4444';
export const applicationVersionToDeleteIdWithCharacter = '33abc';
export const deleteApplicationVersionAPIResponse = true;

export const dataImportTypes = {
    recordsets: [[[Object], [Object]]],
    recordset: [
        {
            ID: '1',
            Name: 'Employee update1',
            Description: 'Employee update Desc',
            ImportProcess: 'UPDATE',
            LastProgramEvent: '',
        },
        {
            ID: '2',
            Name: 'Alternate Rate update',
            Description: 'Alternate Rate Desc',
            ImportProcess: 'UPDATE',
            LastProgramEvent: '',
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const dataImportTypeResponse = {
    recordsets: [[[Object], [Object]]],
    recordset: [
        {
            id: '1',
            name: 'Employee update1',
            description: 'Employee update Desc',
            importProcess: 'UPDATE',
            lastProgramEvent: '',
        },
        {
            id: '2',
            name: 'Alternate Rate update',
            description: 'Alternate Rate Desc',
            importProcess: 'UPDATE',
            lastProgramEvent: '',
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const dataImports = {
    recordsets: [
        [{ totalCount: 3 }],
        [
            {
                ID: '47',
                CompanyID: '1',
                DataImportTypeID: '1',
                Status: 'Completed',
                LastProgramEvent: '',
                CreationDate: '2023-07-17T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
                LastUserID: '1',
            },
            {
                ID: '46',
                CompanyID: '1',
                DataImportTypeID: '1',
                Status: 'Completed',
                LastProgramEvent: '',
                CreationDate: '2023-07-16T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
                LastUserID: '1',
            },
            {
                ID: '45',
                CompanyID: '1',
                DataImportTypeID: '1',
                Status: 'Completed',
                LastProgramEvent: '',
                CreationDate: '2023-07-15T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
                LastUserID: '1',
            },
        ],
    ],
    recordset: [{ totalCount: 3 }],
    output: {},
    rowsAffected: [1, 1, 3],
};

export const dataImportsByDataImportTypeId = {
    recordsets: [
        [{ totalCount: 3 }],
        [
            {
                ID: '47',
                CompanyID: '1',
                DataImportTypeID: '2',
                Status: 'Completed',
                LastProgramEvent: '',
                CreationDate: '2023-07-17T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
                LastUserID: '1',
            },
            {
                ID: '45',
                CompanyID: '1',
                DataImportTypeID: '2',
                Status: 'Completed',
                LastProgramEvent: '',
                CreationDate: '2023-07-15T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
                LastUserID: '1',
            },
        ],
    ],
    recordset: [{ totalCount: 3 }],
    output: {},
    rowsAffected: [1, 1, 3],
};

export const dataImportsResponse = {
    limit: 30,
    count: 3,
    totalCount: 3,
    results: [
        {
            id: '47',
            companyId: '1',
            dataImportTypeId: '1',
            status: 'Completed',
            lastProgramEvent: '',
            creationDate: '2023-07-17T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
            lastUserId: '1',
        },
        {
            id: '46',
            companyId: '1',
            dataImportTypeId: '1',
            status: 'Completed',
            lastProgramEvent: '',
            creationDate: '2023-07-16T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
            lastUserId: '1',
        },
        {
            id: '45',
            companyId: '1',
            dataImportTypeId: '1',
            status: 'Completed',
            lastProgramEvent: '',
            creationDate: '2023-07-15T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
            lastUserId: '1',
        },
    ],
};

export const dataImportsByDataImportTypeResponse = {
    limit: 30,
    count: 3,
    totalCount: 3,
    results: [
        {
            id: '47',
            companyId: '1',
            dataImportTypeId: '2',
            status: 'Completed',
            lastProgramEvent: '',
            creationDate: '2023-07-17T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
            lastUserId: '1',
        },
        {
            id: '45',
            companyId: '1',
            dataImportTypeId: '2',
            status: 'Completed',
            lastProgramEvent: '',
            creationDate: '2023-07-15T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
            lastUserId: '1',
        },
    ],
};

export const dataImportEventDetails = {
    recordsets: [
        [{ totalCount: 3 }],
        [
            {
                ID: '47',
                DataImportEventID: '1',
                CSVRowStatus: 'Ready',
                CSVRowNumber: '1',
                CSVRowNotes: 'Notes 1',
                CSVRowData: 'xxx',
                LastUserID: '1',
                LastProgramEvent: '',
                CreationDate: '2023-07-17T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
            },
            {
                ID: '48',
                DataImportEventID: '1',
                CSVRowStatus: 'Ready',
                CSVRowNumber: '2',
                CSVRowNotes: 'Notes 2',
                CSVRowData: 'yyy',
                LastUserID: '1',
                LastProgramEvent: '',
                CreationDate: '2023-07-17T00:00:00.000Z',
                LastUpdatedDate: '2023-06-01T00:00:00.000Z',
            },
        ],
    ],
    recordset: [{ totalCount: 3 }],
    output: {},
    rowsAffected: [1, 1, 3],
};

export const dataImportEventDetailsResponse = {
    limit: 30,
    count: 3,
    totalCount: 3,
    results: [
        {
            id: '47',
            dataImportEventId: '1',
            csvRowStatus: 'Ready',
            csvRowNumber: '1',
            csvRowNotes: 'Notes 1',
            csvRowData: 'xxx',
            lastUserId: '1',
            lastProgramEvent: '',
            creationDate: '2023-07-17T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
        },
        {
            id: '48',
            dataImportEventId: '1',
            csvRowStatus: 'Ready',
            csvRowNumber: '2',
            csvRowNotes: 'Notes 2',
            csvRowData: 'yyy',
            lastUserId: '1',
            lastProgramEvent: '',
            creationDate: '2023-07-17T00:00:00.000Z',
            lastUpdatedDate: '2023-06-01T00:00:00.000Z',
        },
    ],
};

export const queryReturnedDataImportTypeById = {
    recordsets: [[]],
    recordset: [
        {
        S3TemplatePath: 'TemplateAR.xlsx'
        }
    ],
    output: {},
    rowsAffected: [1],
};

export const resultCSVAlternateRate = '"Employee Identifier","Rate Number","Start Date","End Date","Hourly Rate","Job Number","Worker Comp Code","Organization Level 1","Organization Level 2","Organization Level 3","Organization Level 4"\n"999888902","150","2023-10-16","2023-12-31","60","","","","","",""';

export const resultInsertDataImportEvent = {
    recordsets: [[]],
    recordset: [
        {
            DataImportEventID: 123
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultDataImportTypeById = {
    recordsets: [[]],
    recordset: [
        {
            Name: 'Update Compensation'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultConnectionsToNotify = {
    Items: [
        {
            ConnectionId: 123
        },
        {
            ConnectionId: 321
        }
    ]
}

export const resultDataImportDetailFailed = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            CSVRowStatus: 'Failed'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultDataImportDetailPartiallyProcessed = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            CSVRowStatus: 'Failed'
        },
        {
            CSVRowStatus: 'Processed'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultUserToNotify = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            Email: 'test@test.com',
            CreationDate: '2023-07-15T00:00:00.000Z'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultImportTypeAndImportedFilePath = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            FileName: '16549.csv',
            CSVHeader: 'Employee Code,Birthdate,Time Clock Number,Email,Home Phone,Work Phone,Cell Phone,Gender,Ethnicity,Education Level,Tobacco User,Disabled,Military Reserve,Veteran,Memo 1,Memo 2,Memo 3,Pay Frequency,Standard Payroll Hours,FLSA Classification,Position,Reports To 1,Reports To 2,Reports To 3,Supervisor (SC),Benefit Class/Eligibility Group,EEO Category,Worker Comp Code,Change Reason,Comment'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultCSVRowsAndNotes = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            CSVRowData: '"501","2/28/85","","minalp@sharklasers.com","705-111-1183","805-111-1134","803-111-1154","M","W","","0","0","Declined to disclose - N/A","Declined to disclose - N/A","","","","Weekly","","","TR02","","","","0","","","8810(NY)","",""',
            CSVRowNotes: 'Incorrect Employee Identifier\nInvalid Pay Frequency\nInvalid Position\nInvalid Worker Comp Code\n'
        }
    ],
    output: {},
    rowsAffected: [1],
}
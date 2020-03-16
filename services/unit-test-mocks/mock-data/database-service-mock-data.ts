export const documentDBResponse: any = {
    recordset: [
        {
            ID: 123,
            CompanyID: 123,
            EmployeeID: 123,
            EmployeeName: 'Test User',
            EmployeeCode: '01',
            Filename: 'vim.pdf',
            FSDocument: 'abcdefg',
            ContentType: 'application/pdf',
            Extension: '.pdf',
            Title: 'vim',
            IsPrivateDocument: false,
            UploadByUsername: 'Test',
            IsPublishedToEmployee: true,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const fileExistenceResponseArray = ['test.png', 'path/to/object'];

export const expectedS3ObjectResponse = {
    key: 'path/to/object',
    extension: '.pdf',
};

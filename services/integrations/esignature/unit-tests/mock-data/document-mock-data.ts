export const s3DocumentEncodedId = 'wZiB';
export const legacyDocumentEncodedId = 'dxi1';

export const documentQueryParams = {
    category: 'onboarding',
    categoryId: 12,
    docType: 'original',
};

export const originalDocsTaskListDBResponse = {
    recordsets: [
        [
            [
                {
                    totalCount: 3,
                },
            ],
        ],
        [
            {
                ID: 1,
                Filename: 'file-1.png',
                Title: 'Title',
                Description: 'Description',
            },
            {
                ID: 2,
                Filename: 'file-2.jpg',
                Title: 'Title',
                Description: 'Description',
            },
            {
                ID: 3,
                Filename: 'file-3.jpg',
                Title: 'Title',
                Description: 'Description',
            },
            {
                ID: 4,
                Filename: '123456',
            },
        ],
    ],
    recordset: [
        {
            totalCount: 3,
        },
    ],
    output: {},
    rowsAffected: [3],
};

export const hellosignDocsTaskListDBResponse = {
    recordsets: [
        [
            [
                {
                    totalCount: 2,
                },
            ],
        ],
        [
            {
                ID: 4,
                Filename: '12345',
                Title: 'Title',
                Description: 'Description',
            },
            {
                ID: 5,
                Filename: '67890',
                Title: 'Title',
                Description: 'Description',
            },
            {
                ID: 6,
                Filename: 'test.pdf',
                Title: 'Title',
                Description: 'Description',
            },
        ],
    ],
    recordset: [
        {
            totalCount: 2,
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const employeeDocumentsDBResponse = {
    recordsets: [
        [
            [
                {
                    totalCount: 3,
                },
            ],
        ],
        [
            {
                id: 1,
                isLegacyDocument: true,
                isPublishedToEmployee: false,
                isPrivateDocument: false,
                uploadedBy: 'Test User',
                category: 'onboarding',
                employeeCode: '1',
                title: 'Document 1',
                fileName: 'test.png',
                uploadDate: '10/1/2019',
                esignDate: '10/1/2019',
                employeeId: 1,
                firstName: 'Test',
                lastName: 'User',
                companyId: 1,
                companyName: 'Test Company',
            },
            {
                id: 2,
                isLegacyDocument: false,
                isPublishedToEmployee: false,
                isPrivateDocument: false,
                uploadedBy: 'Test User',
                category: 'announcement',
                employeeCode: undefined,
                title: 'Document 2',
                fileName: 'test2.png',
                uploadDate: '10/1/2019',
                esignDate: '10/1/2019',
                employeeId: 1,
                firstName: 'Test',
                lastName: 'User',
                companyId: 1,
                companyName: 'Test Company',
            },
            {
                id: 3,
                isLegacyDocument: false,
                isPublishedToEmployee: false,
                isPrivateDocument: true,
                uploadedBy: 'Manager User',
                category: 'review',
                employeeCode: '2',
                title: 'Review for employee',
                fileName: 'review.pdf',
                uploadDate: '10/3/2019',
                esignDate: '10/3/2019',
                employeeId: 2,
                firstName: 'Employee',
                lastName: 'User',
                companyId: 2,
                companyName: 'Other Test Company',
            },
        ],
    ],
    recordset: [
        {
            totalCount: 3,
        },
    ],
    output: {},
    rowsAffected: [3],
};

export const companyOriginalDocumentListResponse = [
    {
        id: 1,
        filename: 'file-1.png',
        title: 'Title',
        description: 'Description',
    },
    {
        id: 2,
        filename: 'file-2.jpg',
        title: 'Title',
        description: 'Description',
    },
    {
        id: 3,
        filename: 'file-3.jpg',
        title: 'Title',
        description: 'Description',
    },
];

export const companyHellosignDocumentListResponse = [
    {
        id: 4,
        filename: 'test.pdf',
        title: 'hi',
        description: 'Description',
    },
    {
        id: 5,
        filename: 'test.pdf',
        title: 'hi',
        description: 'Description',
    },
];

export const employeeDocumentListResponse = [
    {
        id: 'dxi1',
        title: 'Document 1',
        fileName: 'test.png',
        category: 'onboarding',
        uploadDate: '10/1/2019',
        esignDate: '10/1/2019',
        isPrivate: false,
        isPublishedToEmployee: false,
        employeeId: 1,
        employeeCode: '1',
        employeeName: 'Test User',
        companyId: 1,
        companyName: 'Test Company',
        isSignedDocument: false,
        uploadedBy: 'Test User',
    },
    {
        id: 'nMua',
        title: 'Document 2',
        fileName: 'test2.png',
        category: 'announcement',
        uploadDate: '10/1/2019',
        esignDate: '10/1/2019',
        isPrivate: false,
        isPublishedToEmployee: false,
        employeeId: 1,
        employeeCode: undefined,
        employeeName: 'Test User',
        companyId: 1,
        companyName: 'Test Company',
        isSignedDocument: false,
        uploadedBy: 'Test User',
    },
    {
        id: 'qOUd',
        title: 'Review for employee',
        fileName: 'review.pdf',
        category: 'review',
        uploadDate: '10/3/2019',
        esignDate: '10/3/2019',
        isPrivate: true,
        isPublishedToEmployee: false,
        employeeId: 2,
        employeeCode: '2',
        employeeName: 'Employee User',
        companyId: 2,
        companyName: 'Other Test Company',
        isSignedDocument: false,
        uploadedBy: 'Manager User',
    },
];

export const companyDocumentRequest = {
    file: 'data:image/png;base64,file',
    fileName: 'test.png',
    title: 'Title',
    category: 'onboarding',
    isPublishedToEmployee: false,
};

export const companyDocumentResponse = {
    id: 'wZiB',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isEsignatureDocument: false,
    category: 'onboarding',
    isPublishedToEmployee: false,
};

export const employeeDocumentRequest = {
    file: 'data:image/png;base64,file',
    fileName: 'test.png',
    title: 'Title',
    isPrivate: false,
};

export const documentFileMetadataDBResponse = {
    recordset: [
        {
            ID: 1,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const documentFileMetadataByIdDBResponse = {
    recordset: [
        {
            Title: 'Title',
            Category: 'other',
            DocumentCategory: 'other',
            Pointer: 'test/folder/file.png',
            IsPublishedToEmployee: false,
            IsPrivateDocument: false,
            UploadDate: '10/01/2019',
            UploadedBy: 'Test User',
            UploadedByUsername: 'Test User',
            Extension: 'png',
            Filename: 'file',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const employeeDocumentResponse = {
    id: 'wZiB',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isEsignatureDocument: false,
    employeeId: 113,
    employeeName: 'Test User',
    companyId: 600013,
    companyName: 'HRN IT Services',
    isSignedDocument: false,
    isPrivate: false,
    isPublishedToEmployee: false,
};

export const updateCompanyDocumentRequest = {
    fileObject: {
        file: 'data:image/png;base64,file',
        fileName: 'test.png',
    },
    title: 'Title',
    category: 'other',
    isPublishedToEmployee: false,
};

export const updateNonLegacyCompanyDocumentResponse = {
    id: 'wZiB',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isEsignatureDocument: false,
    category: 'other',
    isPublishedToEmployee: false,
};

export const updateLegacyCompanyDocumentResponse = {
    id: 'dxi1',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isEsignatureDocument: false,
    category: 'other',
    isPublishedToEmployee: false,
};

export const updateEmployeeDocumentRequest = {
    fileObject: {
        file: 'data:image/png;base64,file',
        fileName: 'test.png',
    },
    title: 'Title',
    isPrivate: false,
};

export const updateNonLegacyEmployeeDocumentResponse = {
    id: 'wZiB',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isPrivate: false,
};

export const updateLegacyEmployeeDocumentResponse = {
    id: 'dxi1',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isPrivate: false,
};

export const documentDBResponse = {
    recordset: [
        {
            FSDocument: 'abcd',
            Extension: 'pdf',
        },
    ],
    output: {},
    rowsAffected: [1],
};

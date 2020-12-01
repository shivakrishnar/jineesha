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
                Type: 'Template'
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
                Type: 'Template',
            },
            {
                ID: 5,
                Filename: '67890',
                Title: 'Title',
                Description: 'Description',
                Type: 'Template',
            },
            {
                ID: 6,
                Filename: 'test.pdf',
                Title: 'Title',
                Description: 'Description',
                Type: 'SimpleSignatureRequest'
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
                    totalCount: 5,
                },
            ],
        ],
        [
            {
                id: '1',
                isLegacyDocument: true,
                isSignedOrUploadedDocument: false,
                isEsignatureDocument: false,
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
                signatureStatusName: 'Not required',
                signatureStatusPriority: 3,
            },
            {
                id: '2',
                isLegacyDocument: true,
                isSignedOrUploadedDocument: false,
                isEsignatureDocument: false,
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
                signatureStatusName: 'Not required',
                signatureStatusPriority: 3,
            },
            {
                id: '3',
                isLegacyDocument: true,
                isSignedOrUploadedDocument: false,
                isEsignatureDocument: false,
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
                signatureStatusName: 'Not required',
                signatureStatusPriority: 3,
            },
            {
                id: '0949cdc8-fc4f-496d-b27f-cfbc03c08df1',
                isLegacyDocument: false,
                isSignedOrUploadedDocument: false,
                isEsignatureDocument: true,
                isPublishedToEmployee: false,
                isPrivateDocument: true,
                uploadedBy: 'Manager User',
                category: 'review',
                employeeCode: '2',
                title: 'ESign Doc Pending',
                fileName: 'review.pdf',
                uploadDate: '10/3/2019',
                esignDate: '10/3/2019',
                employeeId: 2,
                firstName: 'Employee',
                lastName: 'User',
                companyId: 2,
                companyName: 'Other Test Company',
                signatureStatusName: 'Pending',
                signatureStatusPriority: 2,
            },
            {
                id: '1511c0cd-75f5-403a-92bc-18181abf367c',
                isLegacyDocument: false,
                isSignedOrUploadedDocument: true,
                isEsignatureDocument: false,
                isPublishedToEmployee: false,
                isPrivateDocument: true,
                uploadedBy: 'Manager User',
                category: 'review',
                employeeCode: '2',
                title: 'ESign Doc Signed',
                fileName: 'review.pdf',
                uploadDate: '10/3/2019',
                esignDate: '10/3/2019',
                employeeId: 2,
                firstName: 'Employee',
                lastName: 'User',
                companyId: 2,
                companyName: 'Other Test Company',
                signatureStatusName: 'Signed',
                signatureStatusPriority: 1,
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
        type: 'Template',
    },
    {
        id: 5,
        filename: 'test.pdf',
        title: 'hi',
        description: 'Description',
        type: 'Template',
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
        isEsignatureDocument: false,
        employeeId: 1,
        employeeCode: '1',
        employeeName: 'Test User',
        companyId: 1,
        companyName: 'Test Company',
        isSignedDocument: true,
        uploadedBy: 'Test User',
        isLegacyDocument: true,
        status: {
            name: 'Not required',
            priority: 3,
        },
    },
    {
        id: 'wJuv',
        title: 'Document 2',
        fileName: 'test2.png',
        category: 'announcement',
        uploadDate: '10/1/2019',
        esignDate: '10/1/2019',
        isPrivate: false,
        isPublishedToEmployee: false,
        isEsignatureDocument: false,
        employeeId: 1,
        employeeCode: undefined,
        employeeName: 'Test User',
        companyId: 1,
        companyName: 'Test Company',
        isSignedDocument: true,
        uploadedBy: 'Test User',
        isLegacyDocument: true,
        status: {
            name: 'Not required',
            priority: 3,
        },
    },
    {
        id: 'nbUl',
        title: 'Review for employee',
        fileName: 'review.pdf',
        category: 'review',
        uploadDate: '10/3/2019',
        esignDate: '10/3/2019',
        isPrivate: true,
        isPublishedToEmployee: false,
        isEsignatureDocument: false,
        employeeId: 2,
        employeeCode: '2',
        employeeName: 'Employee User',
        companyId: 2,
        companyName: 'Other Test Company',
        isSignedDocument: true,
        uploadedBy: 'Manager User',
        isLegacyDocument: true,
        status: {
            name: 'Not required',
            priority: 3,
        },
    },
    {
        id: '0949cdc8-fc4f-496d-b27f-cfbc03c08df1',
        title: 'ESign Doc Pending',
        fileName: 'review.pdf',
        category: 'review',
        uploadDate: '10/3/2019',
        esignDate: '10/3/2019',
        isPrivate: false,
        isPublishedToEmployee: false,
        isEsignatureDocument: true,
        employeeId: 2,
        employeeCode: '2',
        employeeName: 'Employee User',
        companyId: 2,
        companyName: 'Other Test Company',
        isSignedDocument: false,
        uploadedBy: 'Manager User',
        isLegacyDocument: false,
        status: {
            name: 'Pending',
            priority: 2,
        },
    },
    {
        id: '1511c0cd-75f5-403a-92bc-18181abf367c',
        title: 'ESign Doc Signed',
        fileName: 'review.pdf',
        category: 'review',
        uploadDate: '10/3/2019',
        esignDate: '10/3/2019',
        isPrivate: true,
        isPublishedToEmployee: false,
        isEsignatureDocument: false,
        employeeId: 2,
        employeeCode: '2',
        employeeName: 'Employee User',
        companyId: 2,
        companyName: 'Other Test Company',
        isSignedDocument: true,
        uploadedBy: 'Manager User',
        isLegacyDocument: false,
        status: {
            name: 'Signed',
            priority: 1,
        },
    },
];

export const companyDocumentRequest = {
    file: 'data:image/png;base64,file',
    fileName: 'test.png',
    title: 'Title',
    category: 'onboarding',
    isPublishedToEmployee: false,
    isOnboardingDocument: true,
};

export const companyDocumentResponse = {
    id: 'wZiB',
    title: 'Title',
    fileName: 'test.png',
    extension: 'png',
    isEsignatureDocument: false,
    category: 'onboarding',
    isPublishedToEmployee: false,
    isOnboardingDocument: true,
};

export const fileExistenceResponseArray = ['test.png', 'path/to/object'];

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
    fileName: 'file',
    extension: 'png',
    isEsignatureDocument: false,
    category: 'other',
    isPublishedToEmployee: false,
};

export const updateEmployeeDocumentRequest = {
    title: 'Title',
    isPrivate: false,
    category: 'test',
};

export const updateNonLegacyEmployeeDocumentResponse = {
    id: 'wZiB',
    title: 'Title',
    fileName: 'file.png',
    extension: 'png',
    isPrivate: false,
    category: 'test',
};

export const updateLegacyEmployeeDocumentResponse = {
    id: 'dxi1',
    title: 'Title',
    fileName: 'file',
    extension: 'png',
    isPrivate: false,
    category: 'test',
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

export const documentSavedToS3Response = {
    s3Key: 'path/to/object.pdf',
    extension: '.pdf',
};

export const documentMetadataDBResponse = {
    recordset: [
        {
            Title: 'vim',
            DocumentCategory: 'vim',
            IsPublishedToEmployee: true,
            IsPrivateDocument: false,
            UploadDate: '10/01/2019',
            Extension: '.pdf',
            Filename: 'vim.pdf',
            UploadByUsername: 'Test',
            Pointer: 'path/to/object',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const uploadUrlGenerationRequest = {
    employeeId: 12,
    fileName: 'A17_FlightPlan.pdf',
    title: 'Flight Of the Intruder',
    isPrivate: false,
    documentId: 'XGia',
};

export const uploadUrlGenerationResponse = {
    url: 'www.mysignedurl.com',
    uploadFilename: 'test.png',
};

export const documentMetadataS3Response = {
    tenantid: '123',
    companyid: '123',
    employeeid: '123',
    employeecode: '123',
    uploadedby: 'test user',
    title: 'title',
    documentid: '123',
    islegacydocument: true,
    isprivate: false,
    isesigneddocument: false,
};

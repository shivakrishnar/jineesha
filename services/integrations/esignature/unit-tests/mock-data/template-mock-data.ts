export const templateId = '12345';

export const templateDBResponse = {
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
                Type: 'non-signature',
                Filename: 'one/two/three.png',
                FirstName: 'Hugh Jass',
                ID: 123,
                Title: 'Document title',
                UploadDate: '10/16/2019',
                Category: 'tests',
                IsPublishedToEmployee: true,
                ExistsInTaskList: true,
            },
            {
                Type: 'legacy',
                Filename: 'three.png',
                FirstName: 'Hugh',
                LastName: 'Jass',
                ID: 456,
                Title: 'Legacy document title',
                UploadDate: '10/17/2019',
                Category: 'tests',
                IsPublishedToEmployee: false,
                ExistsInTaskList: false,
            },
            {
                Type: 'esignature',
                ID: 1,
                ExistsInTaskList: true,
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
export const helloSignTemplate = {
    template_id: 1,
    title: 'hi',
    message: 'template',
    can_edit: true,
    is_locked: true,
    signer_roles: [{ name: 'Hugh' }],
    cc_roles: [{ name: 'Hugh' }],
    custom_fields: [{ name: 'money', type: 'text' }],
    documents: [{ name: 'test.pdf' }],
    metadata: { uploadDate: '12/31/2019', uploadedBy: 'Hugh', category: 'test' },
};
export const helloSignTemplateDraft = {
    template_id: 1,
    edit_url: 'editurl.com',
    expires_at: 12345,
};
export const templateListResponse = [
    {
        id: 1,
        title: 'hi',
        message: 'template',
        editable: true,
        isLocked: true,
        signerRoles: [{ name: 'Hugh' }],
        ccRoles: [{ name: 'Hugh' }],
        customFields: [{ name: 'money', type: 'text' }],
        filename: 'test.pdf',
        uploadDate: '12/31/2019',
        uploadedBy: 'Hugh',
        isEsignatureDocument: true,
        category: 'test',
        existsInTaskList: true,
    },
    {
        id: 'z6etP',
        title: 'Legacy document title',
        filename: 'three.png',
        uploadDate: '10/17/2019',
        isEsignatureDocument: false,
        uploadedBy: 'Hugh Jass',
        category: 'tests',
        isPublishedToEmployee: false,
        existsInTaskList: false,
    },
    {
        id: 'N57UV',
        title: 'Document title',
        filename: 'three.png',
        uploadDate: '10/16/2019',
        isEsignatureDocument: false,
        uploadedBy: 'Hugh Jass',
        category: 'tests',
        isPublishedToEmployee: true,
        existsInTaskList: true,
    },
];

export const helloSignEditUrl = {
    template_id: 'abcd',
    edit_url: 'editurl.com',
    expires_at: 12345,
};

export const templatePostRequest = {
    file: 'abcd,efgh',
    fileName: 'test.pdf',
    signerRoles: ['Hugh'],
    category: 'Onboarding',
    ccRoles: ['Employee'],
    customFields: [{ name: 'money', type: 'text' }],
    title: 'Template request',
    message: 'Message',
};

export const searchQueryParam = {
    search: 'onboarding',
};

export const consolidatedQueryParam = {
    consolidated: 'true',
};

export const onboardingQueryParam = {
    onboarding: 'true',
};

export const queryParams = {
    consolidated: 'true',
    onboarding: 'true',
};

export const editUrlResponse = {
    url: 'editUrl',
    expiration: '123',
    clientId: '1234',
};

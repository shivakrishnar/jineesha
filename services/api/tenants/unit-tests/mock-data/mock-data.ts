import { EsignatureAppConfiguration } from '../../../../remote-services/integrations.service';
import { SsoAccount } from '../../../../remote-services/sso.service';
import { PatchInstruction, PatchOperation } from '../../src/patchInstruction';

export const oldTenantId = '1234';
export const newTenantId = '5678';
export const oldCompanyCode = '1';
export const newCompanyCode = '2';

export const getUserDBResponse = (IsGA = true, IsSuperAdmin = false) => {
    return {
        recordset: [
            {
                ID: 1,
                IsGA,
                IsSuperAdmin,
                FirstName: 'Bobby',
                LastName: 'Bob',
            },
        ],
        output: {},
        rowsAffected: [1],
    };
}

export const platformIntegrationPatchInstructions: PatchInstruction[] = [
    {
        op: PatchOperation.Test,
        path: '/platform/integration',
        value: {
            tenantId: newTenantId,
            companyCode: newCompanyCode,
        },
    },
];

export const ssoAccountCopyPatchInstructions: PatchInstruction[] = [
    {
        op: PatchOperation.Copy,
        path: '/sso/account',
        value: {
            tenantId: newTenantId,
            companyCode: newCompanyCode,
        },
    },
];

export const ssoAccountRemovePatchInstructions: PatchInstruction[] = [
    {
        op: PatchOperation.Remove,
        path: '/sso/account',
        value: {
            tenantId: newTenantId,
            companyCode: newCompanyCode,
        },
    },
];

export const esignatureMovePatchInstructions: PatchInstruction[] = [
    {
        op: PatchOperation.Move,
        path: '/esignature',
        value: {
            tenantId: newTenantId,
            companyCode: newCompanyCode,
        },
    },
];

export const testPatchInstruction: PatchInstruction = {
    op: PatchOperation.Test,
    path: '/test',
};

export const oldIntegrationConfiguration: EsignatureAppConfiguration = {
    id: '1234',
    integrationId: '1234',
    tenantId: '1234',
    clientId: 1234,
    companyId: 1234,
    companyName: 'Old Company',
    integrationDetails: {
        domainName: 'old.test.com',
        eSignatureAppClientId: '1234',
        enabled: true,
    },
    createAt: '2019-09-26T03:14:23.141Z',
    createdBy: {
        id: '1234',
        username: 'olduser',
    },
};

export const newIntegrationConfiguration: EsignatureAppConfiguration = {
    id: '5678',
    integrationId: '5678',
    tenantId: '5678',
    clientId: 5678,
    companyId: 5678,
    companyName: 'New Company',
    integrationDetails: {
        domainName: 'new.test.com',
        eSignatureAppClientId: '5678',
        enabled: true,
    },
    createAt: '2019-09-26T03:14:23.141Z',
    createdBy: {
        id: '5678',
        username: 'newuser',
    },
};

export const oldHsApp = JSON.stringify({
    api_app: {
        name: 'oldapp',
        domain: 'old.test.com',
    },
});

export const newHsApp = JSON.stringify({
    api_app: {
        name: 'newapp',
        domain: 'new.test.com',
    },
});

export const oldCompanyDBResponse = {
    recordset: [
        {
            ID: 1234,
            PRIntegration_ClientID: '1234',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const newCompanyDBResponse = {
    recordset: [
        {
            ID: 5678,
            PRIntegration_ClientID: '5678',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const usersDBResponse = {
    recordset: [
        {
            ID: 1,
            PR_Integration_PK: '1',
        },
        {
            ID: 2,
            PR_Integration_PK: '2',
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const fileMetadataListDBResponse = {
    recordset: [
        {
            ID: 1,
            CompanyID: 5678,
            EmployeeCode: '1',
            Pointer: '5678/5678/1/eedoc1.pdf',
            EmployeeID: 1,
        },
        {
            ID: 2,
            CompanyID: 5678,
            EmployeeCode: '2',
            Pointer: '5678/5678/2/eedoc2.pdf',
            EmployeeID: 2,
        },
        {
            ID: 3,
            CompanyID: 5678,
            EmployeeCode: '1',
            Pointer: '5678/5678/companydoc.pdf',
            EmployeeID: null,
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const ssoAccountResponse: SsoAccount = {
    modifiedAt: '123',
    tenantId: '123',
    createdAt: '123',
    clients: [81],
    email: 'test@test.com',
    createdBy: 'test',
    enabled: true,
    surname: 'test',
    username: 'test@test.com',
    id: '123',
    givenName: 'test',
    modifiedBy: 'test',
    href: 'test.com',
};
export const createdSsoAccountResponse: SsoAccount = {
    modifiedAt: '123',
    tenantId: '456',
    createdAt: '123',
    clients: [81],
    email: 'test@test.com',
    createdBy: 'test',
    enabled: true,
    surname: 'test',
    username: 'test@test.com',
    id: '456',
    givenName: 'test',
    modifiedBy: 'test',
    href: 'test.com',
};

export const emptyDBResponse = {
    recordset: [],
    output: {},
    rowsAffected: [0],
};

export const emptyPaginatedDBResponse = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [],
    output: {},
    rowsAffected: [0],
};

export const expiringLicensesResult = {
    recordsets: [
        [
            {
                totalCount: 4,
            },
        ],
        [
            {
                ID: '69',
                EmployeeID: '35109',
                LicenseTypeID: '31',
                LicenseNumber: 'HUHOHNO999',
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-07-26T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600215',
                Code: 'DL',
                Description: 'Drivers License',
                Priority: null,
                Active: true,
            },
            {
                ID: '70',
                EmployeeID: '35109',
                LicenseTypeID: '31',
                LicenseNumber: 'HUHWOW999',
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-08-26T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600215',
                Code: 'DL',
                Description: 'Drivers License',
                Priority: null,
                Active: true,
            },
            {
                ID: '71',
                EmployeeID: '35109',
                LicenseTypeID: '31',
                LicenseNumber: 'HUHNOWAY999',
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-09-14T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600215',
                Code: 'DL',
                Description: 'Drivers License',
                Priority: null,
                Active: true,
            },
            {
                ID: '74',
                EmployeeID: '35109',
                LicenseTypeID: '31',
                LicenseNumber: 'HUHNOWAY999',
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-07-16T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600215',
                Code: 'DL',
                Description: 'Drivers License',
                Priority: null,
                Active: true,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 4,
        },
    ],
    output: {},
    rowsAffected: [1, 1, 1, 4],
};

export const expiringLicensesResponse = [
    {
        id: '69',
        employeeId: '35109',
        licenseTypeId: '31',
        licenseNumber: 'HUHOHNO999',
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-07-26T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        licenseTypeCompanyId: '600215',
        licenseTypeCode: 'DL',
        licenseTypeDescription: 'Drivers License',
        licenseTypePriority: null,
        licenseTypeActive: true,
    },
    {
        id: '70',
        employeeId: '35109',
        licenseTypeId: '31',
        licenseNumber: 'HUHWOW999',
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-08-26T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        licenseTypeCompanyId: '600215',
        licenseTypeCode: 'DL',
        licenseTypeDescription: 'Drivers License',
        licenseTypePriority: null,
        licenseTypeActive: true,
    },
    {
        id: '71',
        employeeId: '35109',
        licenseTypeId: '31',
        licenseNumber: 'HUHNOWAY999',
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-09-14T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        licenseTypeCompanyId: '600215',
        licenseTypeCode: 'DL',
        licenseTypeDescription: 'Drivers License',
        licenseTypePriority: null,
        licenseTypeActive: true,
    },
    {
        id: '74',
        employeeId: '35109',
        licenseTypeId: '31',
        licenseNumber: 'HUHNOWAY999',
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-07-16T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        licenseTypeCompanyId: '600215',
        licenseTypeCode: 'DL',
        licenseTypeDescription: 'Drivers License',
        licenseTypePriority: null,
        licenseTypeActive: true,
    },
];

export const emptyExpiringLicensesResult = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
};

export const emptyResult = {
    recordsets: [[], []],
    recordset: [],
    output: {},
    rowsAffected: [1, 0, 0, 0],
};

export const validUpdateEmailAcknowledgedResult = {
    recordsets: [[{ EmailAcknowledged: '0' }], [{ EmailAcknowledged: '1' }]],
    recordset: [{ EmailAcknowledged: '1' }],
    output: {},
    rowsAffected: [1, 1, 1, 1],
};

export const updateEmailAcknowledgedBody = {
    emailAcknowledged: true,
};

export const expiringCertificatesResult = {
    recordsets: [
        [
            {
                totalCount: 4,
            },
        ],
        [
            {
                ID: '80',
                EmployeeID: '35109',
                CertificateTypeID: '6',
                CertificateNumber: null,
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-08-15T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600013',
                Code: 'CPA',
                Description: 'Certified Public Accountant',
                Priority: null,
                Active: true,
            },
            {
                ID: '81',
                EmployeeID: '35109',
                CertificateTypeID: '6',
                CertificateNumber: null,
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-09-26T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600013',
                Code: 'CPA',
                Description: 'Certified Public Accountant',
                Priority: null,
                Active: true,
            },
            {
                ID: '79',
                EmployeeID: '35109',
                CertificateTypeID: '6',
                CertificateNumber: null,
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-10-03T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600013',
                Code: 'CPA',
                Description: 'Certified Public Accountant',
                Priority: null,
                Active: true,
            },
            {
                ID: '77',
                EmployeeID: '35109',
                CertificateTypeID: '6',
                CertificateNumber: null,
                IssuedBy: 'St of Huh',
                IssuedDate: '2021-06-15T00:00:00.000Z',
                ExpirationDate: '2021-10-04T00:00:00.000Z',
                Notes: null,
                EmailAcknowledged: false,
                CompanyID: '600013',
                Code: 'CPA',
                Description: 'Certified Public Accountant',
                Priority: null,
                Active: true,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 4,
        },
    ],
    output: {},
    rowsAffected: [1, 1, 1, 4],
};

export const expiringCertificatesResponse = [
    {
        id: '80',
        employeeId: '35109',
        certificateTypeId: '6',
        certificateNumber: null,
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-08-15T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        certificateTypeCompanyId: '600013',
        certificateTypeCode: 'CPA',
        certificateTypeDescription: 'Certified Public Accountant',
        certificateTypePriority: null,
        certificateTypeActive: true,
    },
    {
        id: '81',
        employeeId: '35109',
        certificateTypeId: '6',
        certificateNumber: null,
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-09-26T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        certificateTypeCompanyId: '600013',
        certificateTypeCode: 'CPA',
        certificateTypeDescription: 'Certified Public Accountant',
        certificateTypePriority: null,
        certificateTypeActive: true,
    },
    {
        id: '79',
        employeeId: '35109',
        certificateTypeId: '6',
        certificateNumber: null,
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-10-03T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        certificateTypeCompanyId: '600013',
        certificateTypeCode: 'CPA',
        certificateTypeDescription: 'Certified Public Accountant',
        certificateTypePriority: null,
        certificateTypeActive: true,
    },
    {
        id: '77',
        employeeId: '35109',
        certificateTypeId: '6',
        certificateNumber: null,
        issuedBy: 'St of Huh',
        issuedDate: '2021-06-15T00:00:00.000Z',
        expirationDate: '2021-10-04T00:00:00.000Z',
        notes: null,
        emailAcknowledged: false,
        certificateTypeCompanyId: '600013',
        certificateTypeCode: 'CPA',
        certificateTypeDescription: 'Certified Public Accountant',
        certificateTypePriority: null,
        certificateTypeActive: true,
    },
];

export const emptyExpiringCertificatesResult = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
};

export const emptyCertificateResult = {
    recordsets: [[], []],
    recordset: [],
    output: {},
    rowsAffected: [1, 0, 0, 0],
};

export const upcomingReviewsResult = {
    recordsets: [
        [
            {
                totalCount: 4,
            },
        ],
        [
            {
                ID: '107',
                EmployeeID: '29355',
                ReviewTypeID: '65',
                ScheduledDate: '2021-11-01T00:00:00.000Z',
                CompletedDate: '2021-11-26T00:00:00.000Z',
                ReviewByEmployeeID: null,
                Notes: null,
                PrivateNotes: null,
                ReviewTemplate: null,
                EmailAcknowledged: false,
                CompanyID: '600351',
                Code: 'Annual',
                Description: 'Performance Preview',
                Priority: null,
                Active: true,
            },
            {
                ID: '109',
                EmployeeID: '29355',
                ReviewTypeID: '72',
                ScheduledDate: '2021-10-15T00:00:00.000Z',
                CompletedDate: '2021-11-26T00:00:00.000Z',
                ReviewByEmployeeID: '23304',
                Notes: null,
                PrivateNotes: null,
                ReviewTemplate: null,
                EmailAcknowledged: false,
                CompanyID: '600351',
                Code: 'Annual Exam',
                Description: 'Prove you can still do it',
                Priority: null,
                Active: true,
            },
            {
                ID: '110',
                EmployeeID: '29355',
                ReviewTypeID: '72',
                ScheduledDate: '2021-10-27T00:00:00.000Z',
                CompletedDate: '2021-11-26T00:00:00.000Z',
                ReviewByEmployeeID: '23304',
                Notes: null,
                PrivateNotes: null,
                ReviewTemplate: null,
                EmailAcknowledged: false,
                CompanyID: '600351',
                Code: 'Annual Exam',
                Description: 'Prove you can still do it',
                Priority: null,
                Active: true,
            },
            {
                ID: '111',
                EmployeeID: '29355',
                ReviewTypeID: '72',
                ScheduledDate: '2021-09-15T00:00:00.000Z',
                CompletedDate: '2021-12-26T00:00:00.000Z',
                ReviewByEmployeeID: '23304',
                Notes: null,
                PrivateNotes: null,
                ReviewTemplate: 'Test template',
                EmailAcknowledged: false,
                CompanyID: '600351',
                Code: 'Annual Exam',
                Description: 'Prove you can still do it',
                Priority: null,
                Active: true,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 4,
        },
    ],
    output: {},
    rowsAffected: [1, 1, 1, 4],
};

export const upcomingReviewsResponse = [
    {
        id: '107',
        employeeId: '29355',
        reviewTypeId: '65',
        scheduledDate: '2021-11-01T00:00:00.000Z',
        completedDate: '2021-11-26T00:00:00.000Z',
        reviewByEmployeeId: null,
        notes: null,
        privateNotes: null,
        reviewTemplate: null,
        emailAcknowledged: false,
        reviewTypeCompanyId: '600351',
        reviewTypeCode: 'Annual',
        reviewTypeDescription: 'Performance Preview',
        reviewTypePriority: null,
        reviewTypeActive: true,
    },
    {
        id: '109',
        employeeId: '29355',
        reviewTypeId: '72',
        scheduledDate: '2021-10-15T00:00:00.000Z',
        completedDate: '2021-11-26T00:00:00.000Z',
        reviewByEmployeeId: '23304',
        notes: null,
        privateNotes: null,
        reviewTemplate: null,
        emailAcknowledged: false,
        reviewTypeCompanyId: '600351',
        reviewTypeCode: 'Annual Exam',
        reviewTypeDescription: 'Prove you can still do it',
        reviewTypePriority: null,
        reviewTypeActive: true,
    },
    {
        id: '110',
        employeeId: '29355',
        reviewTypeId: '72',
        scheduledDate: '2021-10-27T00:00:00.000Z',
        completedDate: '2021-11-26T00:00:00.000Z',
        reviewByEmployeeId: '23304',
        notes: null,
        privateNotes: null,
        reviewTemplate: null,
        emailAcknowledged: false,
        reviewTypeCompanyId: '600351',
        reviewTypeCode: 'Annual Exam',
        reviewTypeDescription: 'Prove you can still do it',
        reviewTypePriority: null,
        reviewTypeActive: true,
    },
    {
        id: '111',
        employeeId: '29355',
        reviewTypeId: '72',
        scheduledDate: '2021-09-15T00:00:00.000Z',
        completedDate: '2021-12-26T00:00:00.000Z',
        reviewByEmployeeId: '23304',
        notes: null,
        privateNotes: null,
        reviewTemplate: null,
        emailAcknowledged: false,
        reviewTypeCompanyId: '600351',
        reviewTypeCode: 'Annual Exam',
        reviewTypeDescription: 'Prove you can still do it',
        reviewTypePriority: null,
        reviewTypeActive: true,
    },
];

export const emptyUpcomingReviewsResult = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
};

export const emptyReviewsResult = {
    recordsets: [[], []],
    recordset: [],
    output: {},
    rowsAffected: [1, 0, 0, 0],
};
export const upcomingClassesResult = {
    recordsets: [
        [
            {
                totalCount: 4,
            },
        ],
        [
            {
                ID: '36',
                EmployeeID: '21',
                ClassID: '20',
                Title: 'not2',
                Description: null,
                Duration: null,
                Instructor: null,
                Location: null,
                Credits: null,
                IsOpen: true,
                ClassTime: '2020-10-13T10:35:00.000Z',
                CompletionDate: null,
                ExpirationDate: null,
                GradeOrResult: null,
                Notes: null,
                EmailAcknowledged: false,
            },
            {
                ID: '35',
                EmployeeID: '21',
                ClassID: '19',
                Title: 'not1',
                Description: null,
                Duration: null,
                Instructor: null,
                Location: null,
                Credits: 3.00,
                IsOpen: true,
                ClassTime: '2020-10-14T10:35:00.000Z',
                CompletionDate: null,
                ExpirationDate: null,
                GradeOrResult: null,
                Notes: null,
                EmailAcknowledged: false,
            },
            {
                ID: '37',
                EmployeeID: '21',
                ClassID: '21',
                Title: 'not3',
                Description: null,
                Duration: null,
                Instructor: null,
                Location: null,
                Credits: null,
                IsOpen: true,
                ClassTime: '2020-10-15T10:35:00.000Z',
                CompletionDate: null,
                ExpirationDate: null,
                GradeOrResult: null,
                Notes: null,
                EmailAcknowledged: false,
            },
            {
                ID: '39',
                EmployeeID: '21',
                ClassID: '22',
                Title: 'Belly Dance',
                Description: null,
                Duration: null,
                Instructor: null,
                Location: null,
                Credits: null,
                IsOpen: null,
                ClassTime: '2022-02-17T00:00:00.000Z',
                CompletionDate: null,
                ExpirationDate: null,
                GradeOrResult: null,
                Notes: null,
                EmailAcknowledged: false,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 4,
        },
    ],
    output: {},
    rowsAffected: [1, 1, 1, 4],
};

export const upcomingClassesResponse = [
    {
        id: '36',
        employeeId: '21',
        classId: '20',
        title: 'not2',
        description: null,
        duration: null,
        instructor: null,
        location: null,
        credits: null,
        isOpen: true,
        classTime: '2020-10-13T10:35:00.000Z',
        completionDate: null,
        expirationDate: null,
        gradeOrResult: null,
        notes: null,
        emailAcknowledged: false,
    },
    {
        id: '35',
        employeeId: '21',
        classId: '19',
        title: 'not1',
        description: null,
        duration: null,
        instructor: null,
        location: null,
        credits: 3.00,
        isOpen: true,
        classTime: '2020-10-14T10:35:00.000Z',
        completionDate: null,
        expirationDate: null,
        gradeOrResult: null,
        notes: null,
        emailAcknowledged: false,
    },
    {
        id: '37',
        employeeId: '21',
        classId: '21',
        title: 'not3',
        description: null,
        duration: null,
        instructor: null,
        location: null,
        credits: null,
        isOpen: true,
        classTime: '2020-10-15T10:35:00.000Z',
        completionDate: null,
        expirationDate: null,
        gradeOrResult: null,
        notes: null,
        emailAcknowledged: false,
    },
    {
        id: '39',
        employeeId: '21',
        classId: '22',
        title: 'Belly Dance',
        description: null,
        duration: null,
        instructor: null,
        location: null,
        credits: null,
        isOpen: null,
        classTime: '2022-02-17T00:00:00.000Z',
        completionDate: null,
        expirationDate: null,
        gradeOrResult: null,
        notes: null,
        emailAcknowledged: false,
    },
];

export const emptyUpcomingClassesResult = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
};

export const emptyClassesResult = {
    recordsets: [[], []],
    recordset: [],
    output: {},
    rowsAffected: [1, 0, 0, 0],
};

export const validId = '72';
export const invalidId = 'abc';
export const domainName = 'https://test.evolution-software.com';
export const path = '/identity/tenants/1234/companies/1/employees/123/direct-deposits';

export const listEmployeeAbsenceByEmployeeIdResult = {
    recordsets: [[[Object], [Object], [Object], [Object], [Object], [Object], [Object]]],
    recordset: [
        {
            SubmitDate: '2021-09-27T00:00:00.000Z',
            StartDate: '2021-10-01T00:00:00.000Z',
            ReturnDate: '2021-10-06T00:00:00.000Z',
            HoursTaken: 16,
            EvoFK_TimeOffCategoryId: '1',
            Description: 'Approved',
        },
        {
            SubmitDate: '2021-09-27T00:00:00.000Z',
            StartDate: '2021-10-22T00:00:00.000Z',
            ReturnDate: '2021-10-30T00:00:00.000Z',
            HoursTaken: 8,
            EvoFK_TimeOffCategoryId: '2',
            Description: 'Pending',
        },
    ],
    output: {},
    rowsAffected: [1, 7],
};

// Do NOT change any of these test values for the time off categories/summary/expected categories.
// These mock data are set to test if the function is properly calculating the hours as a result.
export const getEvolutionTimeOffCategoriesByEmployeeIdResult = {
    results: [
        {
            employeeId: 123,
            categoryDescription: 'Vacation',
            standardHours: null,
            id: 1,
        },
        {
            employeeId: 123,
            categoryDescription: 'Sick',
            standardHours: null,
            id: 2,
        },
    ],
};

export const getEvolutionTimeOffSummariesByEmployeeId = {
    results: [
        {
            employeeId: 123,
            timeOffCategoryId: 1,
            accruedHours: 40,
            usedHours: 18,
            approvedHours: 16,
            id: 1,
        },
        {
            employeeId: 123,
            timeOffCategoryId: 2,
            accruedHours: 48,
            usedHours: 0,
            approvedHours: 0,
            id: 2,
        },
    ],
};

export const getEvolutionCompanyTimeOffCategoriesByCompanyId = [
    {
        "CompanyId": 93,
        "Description": "Vacation",
        "EdsId": 5,
        "EDGroupsId": null,
        "ShowEss": "Y",
        "ShowEDsInEss": false,
        "AutoCreateForStatuses": {
            "NonApplicable": true,
            "FullTime": true,
            "FullTimeTemp": true,
            "PartTime": true,
            "PartTimeTemp": true,
            "HalfTime": true,
            "Seasonal": true,
            "Student": true,
            "I1099": true,
            "Other": true,
            "SeasonalLessThan120Days": true,
            "Variable": true,
            "PerDiem": true
        },
        "AutoCreateOnNewHire": false,
        "Id": 1
    },
    {
        "CompanyId": 93,
        "Description": "Sick",
        "EdsId": 9,
        "EDGroupsId": null,
        "ShowEss": "Y",
        "ShowEDsInEss": false,
        "AutoCreateForStatuses": {
            "NonApplicable": false,
            "FullTime": true,
            "FullTimeTemp": false,
            "PartTime": false,
            "PartTimeTemp": false,
            "HalfTime": false,
            "Seasonal": false,
            "Student": false,
            "I1099": false,
            "Other": false,
            "SeasonalLessThan120Days": false,
            "Variable": false,
            "PerDiem": false
        },
        "AutoCreateOnNewHire": true,
        "Id": 2
    }
]

export const expectedEmployeeAbsenceSummary = {
    totalAvailableBalance: 46,
    categories: [
        {
            category: 'Vacation',
            currentBalance: 22,
            scheduledHours: 16,
            pendingApprovalHours: 0,
            availableBalance: 6,
            timeOffDates: [
                {
                    submitDate: '2021-09-27T00:00:00.000Z',
                    startDate: '2021-10-01T00:00:00.000Z',
                    returnDate: '2021-10-06T00:00:00.000Z',
                    hoursTaken: 16,
                    requestStatus: 'Approved',
                    evoTimeOffCategoryId: "1",
                },
            ]
        },
        {
            category: 'Sick',
            currentBalance: 48,
            scheduledHours: 0,
            pendingApprovalHours: 8,
            availableBalance: 40,
            timeOffDates: [
                {
                    submitDate: '2021-09-27T00:00:00.000Z',
                    startDate: '2021-10-22T00:00:00.000Z',
                    returnDate: '2021-10-30T00:00:00.000Z',
                    hoursTaken: 8,
                    requestStatus: 'Pending',
                    evoTimeOffCategoryId: "2",
                },
            ]
        },
    ],
};
export const expectedApprovedEmployeeAbsenceSummary = {
    totalAvailableBalance: 46,
    categories: [
        {
            category: 'Vacation',
            currentBalance: 22,
            scheduledHours: 16,
            pendingApprovalHours: 0,
            availableBalance: 6,
            timeOffDates: [
                {
                    submitDate: '2021-09-27T00:00:00.000Z',
                    startDate: '2021-10-01T00:00:00.000Z',
                    returnDate: '2021-10-06T00:00:00.000Z',
                    hoursTaken: 16,
                    requestStatus: 'Approved',
                    evoTimeOffCategoryId: "1",
                },
            ]
        },
        {
            category: 'Sick',
            currentBalance: 48,
            scheduledHours: 0,
            pendingApprovalHours: 8,
            availableBalance: 40,
            timeOffDates: []
        },
    ],
};
export const expectedUpcomingEmployeeAbsenceSummary = {
    totalAvailableBalance: 46,
    categories: [
        {
            category: 'Vacation',
            currentBalance: 22,
            scheduledHours: 16,
            pendingApprovalHours: 0,
            availableBalance: 6,
            timeOffDates: []
        },
        {
            category: 'Sick',
            currentBalance: 48,
            scheduledHours: 0,
            pendingApprovalHours: 8,
            availableBalance: 40,
            timeOffDates: []
        },
    ],
};
export const expectedApprovedUpcomingEmployeeAbsenceSummary = {
    totalAvailableBalance: 46,
    categories: [
        {
            category: 'Vacation',
            currentBalance: 22,
            scheduledHours: 16,
            pendingApprovalHours: 0,
            availableBalance: 6,
            timeOffDates: []
        },
        {
            category: 'Sick',
            currentBalance: 48,
            scheduledHours: 0,
            pendingApprovalHours: 8,
            availableBalance: 40,
            timeOffDates: []
        },
    ],
};
export const expectedEmptyDBEmployeeAbsenceSummary = {
    totalAvailableBalance: 54,
    categories: [
        {
            category: 'Vacation',
            currentBalance: 22,
            scheduledHours: 16,
            pendingApprovalHours: 0,
            availableBalance: 6,
            timeOffDates: []
        },
        {
            category: 'Sick',
            currentBalance: 48,
            scheduledHours: 0,
            pendingApprovalHours: 0,
            availableBalance: 48,
            timeOffDates: []
        },
    ],
};
export const companyAnnouncements = {
    recordsets: [
        [{ totalCount: 5 }],
        [
            {
                ID: '12',
                CompanyID: '27',
                PostDate: '2021-10-18T00:00:00.000Z',
                PostTitle: 'come get your animal crackers',
                PostDetail: '<p><u>delicious animal crackers</u></p>',
                ExpiresDate: '2021-10-19T00:00:00.000Z',
                IsOn: true,
                IsHighPriority: true,
            },
            {
                ID: '5',
                CompanyID: '27',
                PostDate: '2021-10-15T00:00:00.000Z',
                PostTitle: 'Come get your pie',
                PostDetail: '<p><b>delicious pie wow</b></p>',
                ExpiresDate: '2021-10-20T00:00:00.000Z',
                IsOn: true,
                IsHighPriority: true,
            },
            {
                ID: '8',
                CompanyID: '27',
                PostDate: '2021-10-15T00:00:00.000Z',
                PostTitle: 'come get your yu gi oh cards',
                PostDetail: '<p><b>wow what a delicious yu gi oh card</b></p>',
                ExpiresDate: '2021-10-30T00:00:00.000Z',
                IsOn: true,
                IsHighPriority: true,
            },
            {
                ID: '6',
                CompanyID: '27',
                PostDate: '2021-10-15T00:00:00.000Z',
                PostTitle: 'Come get this deliious cheese cake',
                PostDetail: '<p><b>wow what a delicious cheese cake</b></p>',
                ExpiresDate: '2021-10-20T00:00:00.000Z',
                IsOn: true,
                IsHighPriority: false,
            },
            {
                ID: '7',
                CompanyID: '27',
                PostDate: '2021-10-15T00:00:00.000Z',
                PostTitle: 'come get your croissant',
                PostDetail: '<p><b>wow what a delicious croissant</b></p>',
                ExpiresDate: '2021-10-22T00:00:00.000Z',
                IsOn: true,
                IsHighPriority: false,
            },
        ],
    ],
    recordset: [{ totalCount: 5 }],
    output: {},
    rowsAffected: [1, 1, 5],
};

export const companyAnnouncementsResponse = {
    limit: 30,
    count: 5,
    totalCount: 5,
    results: [
        {
            id: '12',
            companyId: '27',
            postDate: '2021-10-18T00:00:00.000Z',
            postTitle: 'come get your animal crackers',
            postDetail: '<p><u>delicious animal crackers</u></p>',
            expiresDate: '2021-10-19T00:00:00.000Z',
            isOn: true,
            isHighPriority: true,
        },
        {
            id: '5',
            companyId: '27',
            postDate: '2021-10-15T00:00:00.000Z',
            postTitle: 'Come get your pie',
            postDetail: '<p><b>delicious pie wow</b></p>',
            expiresDate: '2021-10-20T00:00:00.000Z',
            isOn: true,
            isHighPriority: true,
        },
        {
            id: '8',
            companyId: '27',
            postDate: '2021-10-15T00:00:00.000Z',
            postTitle: 'come get your yu gi oh cards',
            postDetail: '<p><b>wow what a delicious yu gi oh card</b></p>',
            expiresDate: '2021-10-30T00:00:00.000Z',
            isOn: true,
            isHighPriority: true,
        },
        {
            id: '6',
            companyId: '27',
            postDate: '2021-10-15T00:00:00.000Z',
            postTitle: 'Come get this deliious cheese cake',
            postDetail: '<p><b>wow what a delicious cheese cake</b></p>',
            expiresDate: '2021-10-20T00:00:00.000Z',
            isOn: true,
            isHighPriority: false,
        },
        {
            id: '7',
            companyId: '27',
            postDate: '2021-10-15T00:00:00.000Z',
            postTitle: 'come get your croissant',
            postDetail: '<p><b>wow what a delicious croissant</b></p>',
            expiresDate: '2021-10-22T00:00:00.000Z',
            isOn: true,
            isHighPriority: false,
        },
    ],
};

export const benefitsResult = {
    recordsets: [
        [
            {
                totalCount: 3,
            },
        ],
        [
            {
                ID: '1',
                CompanyID: "12",
                Code: 'Medical 2022',
                Description: 'Medical 2022',
                PolicyNumber: null,
                StartDate: '2022-09-30T00:00:00.000Z',
                EndDate: '2023-12-31T00:00:00.000Z',
                EmployeeBenefitID: '84',
                PlanTypeID: '10001',
                PlanTypeCode: 'Medical',
                PlanTypeDescription: 'Medical Insurance',
                CarrierName: 'BCBS',
                CarrierUrl: null,
                Premium: 500,
                DeductionFrequency: 'EveryPay',
                AnnualHSALimitSingle: null,
                AnnualHSALimitFamily: null,
                AnnualHSAEmployerContributionSingle: null,
                AnnualHSAEmployerContributionFamily: null,
                EmployeeContribution: null,
                AnnualFSALimit: null,
                AnnualDCALimit: null,
                CoverageAmount: null,
                DisabilityPercent: null,
                LifeGuaranteedIssueAmount: null,
                BenefitMinimum: null,
                BenefitMaximum: null,
                Elected: 0,
            },
            {
                ID: '17',
                CompanyID: "12",
                Code: 'Medical 2021',
                Description: 'Medical 2021',
                PolicyNumber: null,
                StartDate: '2021-01-01T00:00:00.000Z',
                EndDate: '2022-03-11T00:00:00.000Z',
                EmployeeBenefitID: '22',
                PlanTypeID: '10001',
                PlanTypeCode: 'Medical',
                PlanTypeDescription: 'Medical Insurance',
                CarrierName: 'BCBS',
                CarrierUrl: null,
                Premium: 500,
                DeductionFrequency: 'EveryPay',
                AnnualHSALimitSingle: null,
                AnnualHSALimitFamily: null,
                AnnualHSAEmployerContributionSingle: null,
                AnnualHSAEmployerContributionFamily: null,
                EmployeeContribution: null,
                AnnualFSALimit: null,
                AnnualDCALimit: null,
                CoverageAmount: null,
                DisabilityPercent: null,
                LifeGuaranteedIssueAmount: null,
                BenefitMinimum: null,
                BenefitMaximum: null,
                Elected: 0,
            },
            {
                ID: '3',
                CompanyID: "12",
                Code: 'Vision 2022',
                Description: 'Vision 2022',
                PolicyNumber: null,
                StartDate: '2022-01-01T00:00:00.000Z',
                EndDate: '2022-12-31T00:00:00.000Z',
                PlanTypeID: "10003",
                PlanTypeCode: 'Vision',
                PlanTypeDescription: 'Vision Insurance',
                CarrierName: 'BCBS',
                CarrierUrl: null,
                Premium: 500,
                DeductionFrequency: 'EveryPay',
                AnnualHSALimitSingle: null,
                AnnualHSALimitFamily: null,
                AnnualHSAEmployerContributionSingle: null,
                AnnualHSAEmployerContributionFamily: null,
                EmployeeContribution: null,
                AnnualFSALimit: null,
                AnnualDCALimit: null,
                CoverageAmount: null,
                DisabilityPercent: null,
                LifeGuaranteedIssueAmount: null,
                BenefitMinimum: null,
                BenefitMaximum: null,
                Elected: 0,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 3,
        },
    ],
    output: {},
    rowsAffected: [1, 1, 1, 3],
};

export const benefitsResponse = [
    {
        id: '1',
        companyId: '12',
        code: 'Medical 2022',
        description: 'Medical 2022',
        policyNumber: null,
        startDate: '2022-09-30T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        planTypeId: '10001',
        planTypeCode: 'Medical',
        planTypeDescription: 'Medical Insurance',
        carrierName: 'BCBS',
        carrierUrl: null,
        elected: 0,
        planInformation: [
            {
                Key: "covered",
                Value: [
                    {
                        "relationship": "Self",
                    },
                ],
            },
            {
                Key: "premium",
                Value: 500,
            },
            {
                Key: "term",
                Value: "EveryPay",
            },
        ],
    },
    {
        id: '17',
        companyId: '12',
        code: 'Medical 2021',
        description: 'Medical 2021',
        policyNumber: null,
        startDate: '2021-01-01T00:00:00.000Z',
        endDate: '2022-03-11T00:00:00.000Z',
        planTypeId: '10001',
        planTypeCode: 'Medical',
        planTypeDescription: 'Medical Insurance',
        carrierName: 'BCBS',
        carrierUrl: null,
        elected: 0,
        planInformation: [
            {
                Key: "covered",
                Value: [
                    {
                        "relationship": "Self",
                    },
                ],
            },
            {
                Key: "premium",
                Value: 500,
            },
            {
                Key: "term",
                Value: "EveryPay",
            },
        ],            
    },
    {
        id: '3',
        companyId: '12',
        code: 'Vision 2022',
        description: 'Vision 2022',
        policyNumber: null,
        startDate: '2022-01-01T00:00:00.000Z',
        endDate: '2022-12-31T00:00:00.000Z',
        planTypeId: '10003',
        planTypeCode: 'Vision',
        planTypeDescription: 'Vision Insurance',
        carrierName: 'BCBS',
        carrierUrl: null,
        elected: 0,
        planInformation: [
            {
                Key: "covered",
                Value: [
                    {
                        "relationship": "Self",
                    },
                ],
            },
            {
                Key: "premium",
                Value: 500,
            },
            {
                Key: "term",
                Value: "EveryPay",
            },
        ],
    },
];

export const coveredDependentsResult = {
    recordset: [
        {
            EmployeeBenefitID: 42,
            FirstName: 'Sally',
            LastName: 'Fields',
            Relationship: 'Child'
        }
    ]
}

export const coveredBeneficiariesResult = {
    recordset: [
        {
            EmployeeBenefitID: 25,
            FirstName: 'John',
            LastName: 'Fields',
            Relationship: 'Spouse',
            IsPrimary: true
        }
    ]
}

export const emptyBenefitsResult = {
    recordsets: [[{ totalCount: 0 }], []],
    recordset: [{ totalCount: 0 }],
    output: {},
    rowsAffected: [1, 1, 1, 0],
};

export const companyOpenEnrollments = {
    recordsets: [
        [{ totalCount: 3 }],
        [
            {
                ID: '50',
                CompanyID: '600351',
                Name: 'Medical',
                StartDate: '2019-04-22T00:00:00.000Z',
                EndDate: '2019-08-15T00:00:00.000Z',
                Introduction: null,
            },
            {
                ID: '52',
                CompanyID: '600351',
                Name: 'Medical 2019',
                StartDate: '2019-06-25T00:00:00.000Z',
                EndDate: '2019-06-27T00:00:00.000Z',
                Introduction: 'Hello this is OE season!',
            },
            {
                ID: '53',
                CompanyID: '600351',
                Name: 'MOJOJOJO',
                StartDate: '2022-02-01T00:00:00.000Z',
                EndDate: '2022-04-15T00:00:00.000Z',
                Introduction: null,
            },
        ],
    ],
    recordset: [{ totalCount: 3 }],
    output: {},
    rowsAffected: [1, 1, 3],
};

export const companyOpenEnrollmentResponse = {
    limit: 30,
    count: 3,
    totalCount: 3,
    results: [
        {
            id: '50',
            companyId: '600351',
            name: 'Medical',
            startDate: '2019-04-22T00:00:00.000Z',
            endDate: '2019-08-15T00:00:00.000Z',
            introduction: null,
        },
        {
            id: '52',
            companyId: '600351',
            name: 'Medical 2019',
            startDate: '2019-06-25T00:00:00.000Z',
            endDate: '2019-06-27T00:00:00.000Z',
            introduction: 'Hello this is OE season!',
        },
        {
            id: '53',
            companyId: '600351',
            name: 'MOJOJOJO',
            startDate: '2022-02-01T00:00:00.000Z',
            endDate: '2022-04-15T00:00:00.000Z',
            introduction: null,
        },
    ],
};

import { EsignatureAppConfiguration } from '../../../../remote-services/integrations.service';
import { SsoAccount } from '../../../../remote-services/sso.service';
import { PatchInstruction, PatchOperation } from '../../src/patchInstruction';

export const oldTenantId = '1234';
export const newTenantId = '5678';
export const oldCompanyCode = '1';
export const newCompanyCode = '2';

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
export const validId = '72';
export const invalidId = 'abc';
export const domainName = 'https://test.evolution-software.com';
export const path = '/identity/tenants/1234/companies/1/employees/123/direct-deposits';

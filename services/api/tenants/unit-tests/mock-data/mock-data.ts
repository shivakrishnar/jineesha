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
        }
    },
];

export const ssoAccountCopyPatchInstructions: PatchInstruction[] = [
    {
        op: PatchOperation.Copy,
        path: '/sso/account',
        value: {
            tenantId: newTenantId,
            companyCode: newCompanyCode,
        }
    },
];

export const ssoAccountRemovePatchInstructions: PatchInstruction[] = [
    {
        op: PatchOperation.Remove,
        path: '/sso/account',
        value: {
            tenantId: newTenantId,
            companyCode: newCompanyCode,
        }
    },
];
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

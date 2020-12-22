import { SignatureRequestListResponse } from '../../src/signature-requests/signatureRequestListResponse';
import { SignatureRequestResponseStatus } from '../../src/signature-requests/signatureRequestResponse';

export const onboardingRequestBody = {
    onboardingKey: '123',
    taskListId: 1,
    emailAddress: 'user@test.com',
    name: 'Test User',
    employeeCode: '1',
};

export const obKey = 'BDDB913D-231F-4F0F-A33D-66E057686DD8';

export const obKeyOneResult = '00000000-0000-0000-0000-000000000001';

export const onboardingDocumentPreviewRequest = {
    onboardingKey: obKey,
};

export const saveOnboardingDocumentRequest = {
    taskListId: 1,
};

export const onboardingResponse: SignatureRequestListResponse = {
    results: [
        {
            id: '1234',
            title: 'Sig Request',
            status: SignatureRequestResponseStatus.Pending,
            type: 'SignatureRequest',
            isHelloSignDocument: true,
            signatures: [
                {
                    id: '1',
                    status: 'Pending',
                    signer: {
                        emailAddress: 'hugh@jass.com',
                        name: 'Hugh',
                        role: 'Employee',
                    },
                } as any,
            ],
        },
        {
            id: '1234',
            title: 'Sig Request',
            status: SignatureRequestResponseStatus.Pending,
            type: 'SignatureRequest',
            isHelloSignDocument: true,
            signatures: [
                {
                    id: '1',
                    status: 'Pending',
                    signer: {
                        emailAddress: 'hugh@jass.com',
                        name: 'Hugh',
                        role: 'Employee',
                    },
                } as any,
            ],
        },
        {
            id: '1234',
            title: 'Title',
            status: SignatureRequestResponseStatus.Pending,
            type: 'SignatureRequest',
            isHelloSignDocument: false,
            signatures: [
                {
                    id: '',
                    signer: {
                        emailAddress: 'user@test.com',
                        employeeCode: '1',
                        name: 'Test User',
                    },
                } as any,
            ],
        },
    ],
};

export const existingOnboardingResponse: SignatureRequestListResponse = {
    results: [
        {
            id: '1234',
            title: 'Sig Request',
            status: SignatureRequestResponseStatus.Complete,
            type: 'SignatureRequest',
            isHelloSignDocument: true,
            signatures: [
                {
                    id: '1',
                    status: SignatureRequestResponseStatus.Complete,
                    signer: {
                        emailAddress: 'hugh@jass.com',
                        name: 'Hugh',
                        role: 'Employee',
                    },
                } as any,
                {
                    id: '2',
                    status: SignatureRequestResponseStatus.Unknown,
                    signer: {
                        emailAddress: 'matt.yoga@gmail.com',
                        name: 'Matt',
                        role: 'Manager',
                    },
                } as any,
            ],
        },
        {
            id: '1235',
            title: 'Sig Request 2',
            status: SignatureRequestResponseStatus.Pending,
            type: 'SignatureRequest',
            isHelloSignDocument: true,
            signatures: [
                {
                    id: '1',
                    status: SignatureRequestResponseStatus.Pending,
                    signer: {
                        emailAddress: 'mike@pizza.com',
                        name: 'Mike',
                        role: 'OnboardingSignatory',
                    },
                } as any,
                {
                    id: '2',
                    status: SignatureRequestResponseStatus.Declined,
                    signer: {
                        emailAddress: 'several@ponchos.com',
                        name: 'Several',
                        role: 'OnboardingSignatory',
                    },
                } as any,
            ],
        },
        {
            id: '1234',
            isHelloSignDocument: false,
            signatures: [
                {
                    id: '',
                    signer: {
                        emailAddress: 'user@test.com',
                        employeeCode: '1',
                        name: 'Test User',
                    } as any,
                },
            ],
            status: SignatureRequestResponseStatus.Complete,
            title: 'Test',
            type: 'SignatureRequest',
        },
    ],
};

export const onboardingDBResponse = {
    recordset: [
        {
            IsOn: 1,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const onboardingCompanyDocsSectionOffDBResponse = {
    recordset: [
        {
            IsOn: 0,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const onboardingSimpleSignDocumentDBResponse = {
    recordset: [
        {
            SignatureStatusID: 1,
            ID: '1234',
            Title: 'Test',
        },
    ],
    output: {},
    rowsAffected: [1],
};

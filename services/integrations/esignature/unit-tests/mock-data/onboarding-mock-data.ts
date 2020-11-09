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

export const onboardingResponse: SignatureRequestListResponse = {
    results: [
        {
            id: '1234',
            title: 'Sig Request',
            status: SignatureRequestResponseStatus.Pending,
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
    ],
};

export const existingOnboardingResponse: SignatureRequestListResponse = {
    results: [
        {
            id: '1234',
            title: 'Sig Request',
            status: SignatureRequestResponseStatus.Complete,
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
    ],
};

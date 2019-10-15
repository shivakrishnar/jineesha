export const onboardingRequestBody = {
    onboardingKey: '123',
    taskListId: 1,
    emailAddress: 'user@test.com',
    name: 'Test User',
    employeeCode: '1',
};

export const onboardingResponse = [
    {
        id: '1234',
        title: 'Sig Request',
        status: 'Pending',
        signatures: [
            {
                id: 1,
                status: 'Pending',
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                },
            },
            {
                id: 2,
                status: 'Pending',
                signer: {
                    emailAddress: 'matt.yoga@gmail.com',
                    name: 'Matt',
                    role: 'Employee',
                },
            },
        ],
    },
    {
        id: '1234',
        title: 'Sig Request',
        status: 'Pending',
        signatures: [
            {
                id: 1,
                status: 'Pending',
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                },
            },
            {
                id: 2,
                status: 'Pending',
                signer: {
                    emailAddress: 'matt.yoga@gmail.com',
                    name: 'Matt',
                    role: 'Employee',
                },
            },
        ],
    },
];

export const existingOnboardingResponse = [
    {
        id: '1234',
        title: 'Sig Request',
        status: 'Complete',
        signatures: [
            {
                id: 1,
                status: 'Complete',
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                },
            },
            {
                id: 2,
                status: 'Unknown',
                signer: {
                    emailAddress: 'matt.yoga@gmail.com',
                    name: 'Matt',
                    role: 'Manager',
                },
            },
        ],
    },
    {
        id: '1235',
        title: 'Sig Request 2',
        status: 'Pending',
        signatures: [
            {
                id: 1,
                status: 'Pending',
                signer: {
                    emailAddress: 'mike@pizza.com',
                    name: 'Mike',
                    role: 'OnboardingSignatory',
                },
            },
            {
                id: 2,
                status: 'Declined',
                signer: {
                    emailAddress: 'several@ponchos.com',
                    name: 'Several',
                    role: 'OnboardingSignatory',
                },
            },
        ],
    },
];

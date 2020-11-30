export const signatureRequestId = '1234';

export const signatureStatusDBResponse = {
    recordset: [
        {
            Name: 'Signed',
            Priority: 1,
            StepNumber: 2,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const updateSignatureRequestStatusRequestBody = {
    stepNumber: 1,
};

export const updateSignatureRequestStatusResponse = {
    id: '1234',
    status: {
        name: 'Signed',
        priority: 1,
        isProcessing: true,
        stepNumber: 2,
    },
};

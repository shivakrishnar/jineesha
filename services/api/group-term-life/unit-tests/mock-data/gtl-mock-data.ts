export const tenantId = 'c807d7f9-b391-4525-ac0e-31dbc0cf202b';
export const employeeId = '42242';
export const companyId = '600424';
export const flatCoverage = 1;
export const flatAmount = 200000;
export const earningsMultiplier = null;
export const workHours = null;
export const emailAddress = 'test@test.com';

export const flatCoveragePayload = {
    flatCoverage: true,
    flatAmount: 200000,
};

export const earningsMultiplierPayload = {
    flatCoverage: false,
    earningsMultiplier: 200000,
};

export const getGtlRecordEmptyDBResponse = {
    recordset: [],
    output: {},
    rowsAffected: [0],
};

export const getGtlRecordDBResponse = {
    recordset: [
        {
            FlatCoverage: 1,
            FlatAmount: 200000,
            EarningsMultiplier: null,
            WorkHours: null,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const getGtlRecordMockResult = {
    flatCoverage: 1,
    flatAmount: 200000,
    earningsMultiplier: null,
    workHours: null,
};

export const createGtlRecordDBResponse = {
    recordset: [
        {
            FlatCoverage: 1,
            FlatAmount: 200000,
            EarningsMultiplier: null,
            WorkHours: null,
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const createGtlRecordMockResult = {
    employeeId: '42242',
    flatCoverage: true,
    flatAmount: 200000,
};

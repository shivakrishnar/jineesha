import {
    AlternateRateUpdateCsvRowType,
} from './../../src/DataImport';

export const jsonCsvRow: AlternateRateUpdateCsvRowType = {
    "Employee Identifier": '999888902',
    "Rate Number": '150',
    "Start Date": '10/16/2023',
    "End Date": '12/31/2023',
    "Hourly Rate": '60',
    "Job Number": '',
    "Worker Comp Code": '',
    "Organization Level 1": '',
    "Organization Level 2": '',
    "Organization Level 3": '',
    "Organization Level 4": ''
};

export const resultCSVHeader = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            CSVHeader: 'Employee Identifier,Rate Number,Start Date,End Date,Hourly Rate,Job Number,Worker Comp Code,Organization Level 1,Organization Level 2,Organization Level 3,Organization Level 4'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultFailedValidationAlternateRate = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 0
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultSuccessValidationAlternateRate = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 1
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultSuccessCompanyIntegratedEVO = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            PRIntegration_ClientID: '123',
            PR_Integration_PK: '123'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultInfoEmployeeAHREVO = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            EvoEmployeeId: '123',
            EvoCompanyId: '123',
            EvoClientId: '123',
            ID: '123'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultSuccessInsertAlternateRate = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 1,
            AlternateRateIdResult: 1299
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultAlternatesRatesFromEVO = {
    results: [
        {
            id: 123,
            rate: {
                id: 155
            }            
        }
    ]
}

export const resultAlternatesRatesFromAHR = {
    results: [
        {
            StartDate: '10/16/2023',
            RateNumber_EVO: '10',
            HourlyRate: '15',
            workerCompensationId: '1',
            workerCompDesc: 'test',
            org1Id: '1',
            org2Id: '',
            org3Id: '',
            org4Id: '',
            payGradeId: '',
            positionId: '',
            jobId: '',            
            stateId: ''
        }
    ]
}

export const resultPostAlternateRate = {
    id: 123
}

export const resultExistAlternateRatesFromEVO = {
    results: [
        {
            id: 12,
            rate: {
                id: 150
            }            
        }
    ]
}
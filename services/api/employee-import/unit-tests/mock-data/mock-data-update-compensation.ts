import {
    CompensationUpdateCsvRowType,
} from './../../src/DataImport';

import { IWage } from '../../src/Compensation';
    
export const jsonCsvRow: CompensationUpdateCsvRowType = {
    "Employee Identifier": '999888902',
    "Effective Date": '10/16/2023',
    "Pay Type": '',
    "Rate": '',
    "Jobs Number": '',
    "Worker Comp Code": '',
    "Change Reason": '',
    "Comment": ''
};

export const resultCSVHeader = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            CSVHeader: 'Employee Identifier,Effective Date,Pay Type,Rate,Jobs Number,Worker Comp Code,Change Reason,Comment'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultFailedValidationCompensation = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 0
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultSuccessValidationCompensation = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 1
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultSuccessInsertCompensation = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 1,
            CompensationIdResult: 1299
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

export const resultEmployeeCompensationSalaryAHR = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            payTypeCode: 'S',
            Rate: 150,
            EffectiveDate: '10/16/2023',
            org1Id: '',
            org2Id: '',
            org3Id: '',
            org4Id: '',
            jobId: '',
            workerCompensationId: 12,
            workerCompDesc: 'test',
            stateId: 123
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultInsertCompensationEVO: IWage = {
    id: 123,
    employeeId: 1,
    divisionId: 1,
    branchId: 1,
    departmentId: 1,
    teamId: 1,
    jobId: 1,
    workersCompensation: {
        id: 1,
        description: 'test',
        state: {
            id: 1
        }
    }
}

export const resultEmployeeCompensationHourAHR = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            payTypeCode: 'H',
            Rate: 150,
            EffectiveDate: '10/16/2023',
            org1Id: '',
            org2Id: '',
            org3Id: '',
            org4Id: '',
            jobId: '',
            workerCompensationId: 12,
            workerCompDesc: 'test',
            stateId: 123
        }
    ],
    output: {},
    rowsAffected: [1],
}
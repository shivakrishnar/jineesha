import {
    EmployeeUpdateCsvRowType,
} from './../../src/DataImport';

export const jsonCsvRow: EmployeeUpdateCsvRowType = {
    "Employee Identifier": '999888902',
    Birthdate: '2023-10-16',
    "Time Clock Number": '',
    Email: 'eshotten@sharklasers.com',
    "Home Phone": '',
    "Work Phone": '',
    "Cell Phone": '',
    Gender: '1',
    Ethnicity: '',
    "Education Level": '', 
    "Tobacco User": '0',
    Disabled: '0',
    "Military Reserve": 'Declined to disclose - N/A',
    Veteran: 'Declined to disclose - N/A',
    "Memo 1": '',
    "Memo 2": '',
    "Memo 3": '',
    "Pay Frequency": '15',
    "Standard Payroll Hours": '', 
    "FLSA Classification": 'NonExempt',
    Position: '4',
    "Reports To 1": '',
    "Reports To 2": '',
    "Reports To 3": '',
    "Supervisor (SC)": '',
    "Benefit Class/Eligibility Group": '',
    "EEO Category": '',
    "Worker Comp Code": '8810(NY)',
    "Change Reason": '',
    Comment: ''
};

export const resultCSVHeader = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            CSVHeader: 'Employee Identifier,Birthdate,Time Clock Number,Email,Home Phone,Work Phone,Cell Phone,Gender,Ethnicity,Education Level,Tobacco User,Disabled,Military Reserve,Veteran,Memo 1,Memo 2,Memo 3,Pay Frequency,Standard Payroll Hours,FLSA Classification,Position,Reports To 1,Reports To 2,Reports To 3,Supervisor (SC),Benefit Class/Eligibility Group,EEO Category,Worker Comp Code,Change Reason,Comment'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultFailedValidationEmployee = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 0
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultSuccessValidationEmployee = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            StatusResult: 1
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
            EvoClientId: '123'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultAllFieldsForUpdateEmployee = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            BirthDate: '4/22/2020',
            ClockNumber: '123',
            Email: 'test@test.com',
            PhoneHome: '',
            PhoneWork: '',
            PhoneCell: '',
            Gender: 'M',
            Ethnicity: '',
            Education: '',
            TobaccoUser: '0',
            IsDisabled: '0',
            MilitaryReserve: '',
            Veteran: '',
            Memo1: '1',
            Memo2: '2',
            Memo3: '3',
            PayFrequency: 'Monthly',
            StandardPayrollHours: '10', 
            FLSAClassification: '',
            Position: '',
            ReportsTo1: '10',
            ReportsTo2: '12',
            ReportsTo3: '13',
            SupervisorSC: 'Ka',
            BenefitClass: '',
            EEOCategory: '',
            WorkerCompCode: '2300(VT)',
            ChangeReason: '',
            Comment: 'Test'
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultEmployeeEVO = {
    employeeNumber: '',
    email: '',    
    standardHours: '',
    timeClockNumber: '',
    payFrequency: '',
    person: {
        email: '',
        birthDate: '',
        ethnicity: '',
        gender: '',
        veteran: '',
        militaryReserve: '',
        phones: []
    },
    positionId: 10,
    workersCompensationId: 10,
    eeoCode: '',
    federalTaxReporting: {
        exemptions: {
            flsaStatus: '',
        }
    }
}

export const resultPositionType = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            PositionTypeEvoId: 123
        }
    ],
    output: {},
    rowsAffected: [1],
}

export const resultWorkerCompType = {
    recordsets: [[{ totalCount: 1 }]],
    recordset: [
        {
            WorkerCompTypeEvoId: 123
        }
    ],
    output: {},
    rowsAffected: [1],
}
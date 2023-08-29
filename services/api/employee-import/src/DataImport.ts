export interface IDataImportType  {
    id: number;
    name: string;
    description?: string;
    importProcess?: string;
    lastProgramEvent?: string;
    s3TemplatePath?: string;
}

export interface IDataImport  {
    id: number;
    companyId: number;
    dataImportTypeId: number;
    dataImportTypeName: string;
    status: string;
    lastUserId: number;
    lastProgramEvent?: string;
    creationDate: string;
    lastUpdatedDate: string;
    details?: string;
    userName: string;
}

export interface IDataImportEventDetail  {
    id: number;
    dataImportEventId: number;
    csvRowStatus: string;
    csvRowNumber: number;
    csvRowNotes: string;
    csvRowData: string;
    lastUserId: number;
    lastProgramEvent?: string;
    creationDate: string;
    lastUpdatedDate: string;
}

export type EmployeeUpdateCsvRowType = {
    "Employee Code": string;
    "Birthdate": string;
    "Time Clock Number": string;
    "Email": string;
    "Home Phone": string;
    "Work Phone": string;
    "Cell Phone": string;
    "Gender": string;
    "Ethnicity": string;
    "Education Level": string;
    "Tobacco User": string;
    "Disabled": string;
    "Military Reserve": string;
    "Veteran": string;
    "Memo 1": string;
    "Memo 2": string;
    "Memo 3": string;
    "Pay Frequency": string;
    "Standard Payroll Hours": string;
    "FLSA Classification": string;
    "Position": string;
    "Reports To 1": string;
    "Reports To 2": string;
    "Reports To 3": string;
    "Supervisor (SC)": string;
    "Benefit Class/Eligibility Group": string;
    "EEO Category": string;
    "Worker Comp Code": string;
    "Change Reason": string;
    "Comment": string;
}
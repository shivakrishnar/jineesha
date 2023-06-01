export interface IDataImportType  {
    id: number;
    name: string;
    description?: string;
    importProcess?: string;
    lastProgramEvent?: string;
}

export interface IDataImport  {
    id: number;
    companyId: number;
    dataImportTypeId: number;
    status: string;
    lastUserId: number;
    lastProgramEvent?: string;
    creationDate: string;
    lastUpdatedDate: string;
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

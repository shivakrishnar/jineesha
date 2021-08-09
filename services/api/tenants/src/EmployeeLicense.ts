export type EmployeeLicense = {
    id: string;
    employeeId: number;
    licenseTypeId?: number;
    licenseNumber?: string;
    issuedBy?: string;
    issuedDate?: Date;
    expirationDate?: Date;
    notes?: string;
    emailAcknowledged?: boolean;
    licenseTypeCompanyId: number;
    licenseTypeCode?: string;
    licenseTypeDescription?: string;
    licenseTypePriority?: number;
    licenseTypeActive?: boolean;
}
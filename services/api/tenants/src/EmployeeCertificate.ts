export type EmployeeCertificate = {
    id: string;
    employeeId: number;
    certificateTypeId?: number;
    certificateNumber?: string;
    issuedBy?: string;
    issuedDate?: Date;
    expirationDate?: Date;
    notes?: string;
    emailAcknowledged?: boolean;
    certificateTypeCompanyId: number;
    certificateTypeCode?: string;
    certificateTypeDescription?: string;
    certificateTypePriority?: number;
    certificateTypeActive?: boolean;
};

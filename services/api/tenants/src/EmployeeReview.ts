export type EmployeeReview = {
    id: string; // from EmployeeReview table
    employeeId: number;
    reviewTypeId?: number;
    scheduledDate: Date;
    completedDate?: Date;
    reviewByEmployeeId?: number;
    notes?: string;
    privateNotes?: string;
    reviewTemplate?: string;
    emailAcknowledged?: boolean;
    reviewTypeCompanyId: number; // from ReviewType table
    reviewTypeCode?: string;
    reviewTypeDescription?: string;
    reviewTypePriority?: number;
    reviewTypeActive?: boolean;
};

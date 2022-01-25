export type EmployeeClass = {
    id: string;
    employeeId: number;
    classId: number;
    title: string;
    description?: string;
    duration?: string;
    instructor?: string;
    location?: string;
    credits?: number;
    isOpen?: boolean;
    classTime: string;
    completionDate?: Date;
    expirationDate?: Date;
    gradeOrResult?: string;
    notes?: string;
    emailAcknowledged?: boolean;
};

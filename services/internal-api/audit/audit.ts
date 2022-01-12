export interface IAudit {
    isEvoCall?: boolean;
    userEmail: string;
    oldFields?: {};
    newFields?: {};
    type: AuditActionType;
    companyId: string;
    evoCompanyId?: string;
    areaOfChange: AuditAreaOfChange;
    tenantId: string;
    employeeId?: string;
    keyDetails?: string;
}

export enum AuditActionType {
    Insert = 'Insert',
    Update = 'Update',
    Delete = 'Delete',
}

export enum AuditAreaOfChange {
    EmployeeDirectDeposit = 'EE Direct Deposit',
    Company = 'Company',
    Documents = 'Documents',
}

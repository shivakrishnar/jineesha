export type EmployeeBenefit = {
    id: string;
    companyId: number;
    code: string;
    description?: string;
    policyNumber?: string;
    startDate: Date;
    endDate?: Date;
    planTypeId: string;
    planTypeCode: string;
    planTypeDescription?: string;
    carrierName?: string;
    carrierURL?: string;
    premium?: number;
    elected: boolean;
}
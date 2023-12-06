export interface IWageRate  {
    id: number;
    amount: any;
    isDefault: boolean;
}

export interface IWageCompensationState  {
    id: number;
    name?: any;
    abbreviation?: any;
}

export interface IWageCompensation {
    id: number;
    description: string;
    state: IWageCompensationState;
}

export interface IWage  {
    id?: number;
    divisionId?: any;
    branchId?: any;
    departmentId?: any;
    teamId?: any;
    employeeId?: number;
    rate?: IWageRate;
    workersCompensation?: IWageCompensation;
    positionId?: any;
    payGradeId?: any;
    jobId?: any;
}

export interface IPatchItem {
    path: string;
    value: any;
}

export interface IPatchOperation {
    type: string;
    effectiveDate: string;
    pathGroup: IPatchItem[];
}

export interface IEvoPatch {
    id: number;
    patchOperations: IPatchOperation[];
}


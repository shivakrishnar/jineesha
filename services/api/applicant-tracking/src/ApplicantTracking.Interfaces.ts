export interface IQuestionType {
    id: number;
    code: string;
    description: string;
    priority: number;
    active: boolean;
}

export interface IQuestionBankPOST {
    companyId: number,
    employeeId?: number,
    atQuestionTypeId: number,
    questionTitle: string,
    questionText?: string,
    active: boolean,
    sequence: number,
    isRequired: boolean,
}

export interface IQuestionBankPUT {
    id: number,
    companyId: number,
    employeeId?: number,
    atQuestionTypeId: number,
    questionTitle: string,
    questionText?: string,
    active: boolean,
    sequence: number,
    isRequired: boolean,
}

export interface IQuestionBankGET {
    id: number,
    companyId: number,
    companyName: string,
    atQuestionTypeId: number,
    questionTitle: string,
    questionText?: string,
    active: boolean,
    sequence: number,
    isRequired: boolean,
}


export interface IQuestionType {
    id: number;
    code: string;
    description: string;
    priority: number;
    active: boolean;
}

export interface IQuestionBankPOST {
    companyId: number,
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

export interface IHardStatusType {
    id: number;
    code: string;
    description: string;
    priority: number;
    active: boolean;
}

export interface ISoftStatusType {
    id: number;
    companyId: number,
    companyName: string,
    atHardStatusTypeId: number,
    title: string;
    description: string;
    sequence: number;
}

export interface IApplicationVersionPOST {
    companyId: number;
	title: string;
	description: string;
	keywordList: string;
	aTApplicationVersionDate: Date;
	isSectionOnEmploymentHistory: boolean,
	isSectionOnEducationHistory: boolean;
	isSectionOnWorkConditions: boolean;
	isSectionOnKeywords: boolean;
	isSectionOnDocuments: boolean;
	isSectionOnCertification: boolean;
	isSectionOnPayHistory: boolean;
	jazzHrPositionOpeningID?: number;
}

export interface IApplicationVersionGET {
    id: number;
	companyId: number;
    companyName: string;
	title: string;
	description: string;
	keywordList: string;
	aTApplicationVersionDate: Date;
	isSectionOnEmploymentHistory: boolean,
	isSectionOnEducationHistory: boolean;
	isSectionOnWorkConditions: boolean;
	isSectionOnKeywords: boolean;
	isSectionOnDocuments: boolean;
	isSectionOnCertification: boolean;
	isSectionOnPayHistory: boolean;
	jazzHrPositionOpeningID?: number;
}

export interface IApplicationVersionPUT {
    id: number;
    companyId: number;
	title: string;
	description: string;
	keywordList: string;
	aTApplicationVersionDate: Date;
	isSectionOnEmploymentHistory: boolean,
	isSectionOnEducationHistory: boolean;
	isSectionOnWorkConditions: boolean;
	isSectionOnKeywords: boolean;
	isSectionOnDocuments: boolean;
	isSectionOnCertification: boolean;
	isSectionOnPayHistory: boolean;
	jazzHrPositionOpeningID?: number;
}

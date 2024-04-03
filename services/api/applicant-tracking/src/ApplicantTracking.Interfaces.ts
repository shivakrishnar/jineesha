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

export interface IApplicationVersionCustomQuestion {
    aTApplicationVersionId: number;
	aTQuestionBankId: number;
}

export interface IQuestionBankMultipleChoiceAnswersGET {
    id: number,
    companyId: number,
    companyName: string,
    atQuestionBankId: number,
    questionTitle: string,
    answer: string,
}

export interface IQuestionBankMultipleChoiceAnswersPOST {
    atQuestionBankId: number,
    answer: string,
}

export interface IQuestionBankMultipleChoiceAnswersPUT {
    id: number,
    atQuestionBankId: number,
    answer: string,
}

export interface IJobPostingGET {
    id: number,
    companyId: number,
    aTApplicationVersionId: number,
    companyName: string,
    positionTypeId?: number,
    organizationType1Id?: number,
    organizationType2Id?: number,
    organizationType3Id?: number,
    organizationType4Id?: number,
    organizationType5Id?: number,
    workerCompTypeId?: number,
    title: string,
    description: string,
    linkKey: string,
    isOpen: boolean,
    jazzHrPositionOpeningId?: number
}

export interface IJobPostingPOST {
    companyId: number;
    aTApplicationVersionId: number,
	positionTypeId?: number,
    organizationType1Id?: number,
    organizationType2Id?: number,
    organizationType3Id?: number,
    organizationType4Id?: number,
    organizationType5Id?: number,
    workerCompTypeId?: number,
    title: string,
    description: string,
    linkKey: string,
    isOpen: boolean,
    jazzHrPositionOpeningId?: number
}

export interface IJobPostingPUT {
    id: number;
    companyId: number;
    aTApplicationVersionId: number,
	positionTypeId?: number,
    organizationType1Id?: number,
    organizationType2Id?: number,
    organizationType3Id?: number,
    organizationType4Id?: number,
    organizationType5Id?: number,
    workerCompTypeId?: number,
    title: string,
    description: string,
    linkKey: string,
    isOpen: boolean,
    jazzHrPositionOpeningId?: number
}

export interface IJobPostingResponsibleUser {
    atJobPostingId: number;
	hrNextUserId: number;
}
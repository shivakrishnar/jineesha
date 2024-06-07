export interface IQuestionType {
    id: number;
    code: string;
    description: string;
    priority: number;
    active: boolean;
}

export interface IQuestionBankPOST {
    companyId: number,
	atQuestionBankGroupId?: number,
    atQuestionTypeId: number,
    questionTitle: string,
    questionText: string,
    active: boolean,
    sequence: number,
    isRequired: boolean,
}

export interface IQuestionBankPUT {
    id: number,
    companyId: number,
	atQuestionBankGroupId?: number,
    atQuestionTypeId: number,
    questionTitle: string,
    questionText: string,
    active: boolean,
    sequence: number,
    isRequired: boolean,
}

export interface IQuestionBankGET {
    id: number,
    companyId: number,
    companyName: string,
	atQuestionBankGroupId?: number,
	groupName?: string,
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

export interface IApplicationGET {
    id: number,
	companyId: number,
	companyName: string,
	atSoftStatusTypeId?: number,
	atApplicationKey?: string,
	receivedDate?: Date,
	firstName?: string,
	middleName?: string,
	lastName?: string,
	address1?: string,
	address2?: string,
	city?: string,
	zip?: string,
	countryStateTypeId?: number,
	emailAddress?: string,
	phoneHome?: string,
	phoneCell?: string,
	birthDate?: Date,
	ssn?: string,
	alternateTaxNumber?: string,
	previousAddress?: string,
	lengthAtCurrentAddress?: string,
	previousEmployer1MayWeContact?: string,
	previousEmployer1CompanyName?: string,
	previousEmployer1Address?: string,
	previousEmployer1City?: string,
	previousEmployer1CountryStateTypeId?: number,
	previousEmployer1Phone?: string,
	previousEmployer1SupervisorName?: string,
	previousEmployer1SupervisorTitle?: string,
	previousEmployer1Duties?: string,
	previousEmployer1LeavingReasons?: string,
	previousEmployer1StartingPay?: number,
	previousEmployer1EndingPay?: number,
	previousEmployer1StartDate?: Date,
	previousEmployer1EndDate?: Date,
	previousEmployer2MayWeContact?: boolean,
	previousEmployer2CompanyName?: string,
	previousEmployer2Address?: string,
	previousEmployer2City?: string,
	previousEmployer2CountryStateTypeId?: number,
	previousEmployer2Phone?: string,
	previousEmployer2SupervisorName?: string,
	previousEmployer2SupervisorTitle?: string,
	previousEmployer2Duties?: string,
	previousEmployer2LeavingReasons?: string,
	previousEmployer2StartingPay?: number,
	previousEmployer2EndingPay?: number,
	previousEmployer2StartDate?: Date,
	previousEmployer2EndDate?: Date,
	previousEmployer3MayWeContact?: boolean,
	previousEmployer3CompanyName?: string,
	previousEmployer3Address?: string,
	previousEmployer3City?: string,
	previousEmployer3CountryStateTypeId?: number,
	previousEmployer3Phone?: string,
	previousEmployer3SupervisorName?: string,
	previousEmployer3SupervisorTitle?: string,
	previousEmployer3Duties?: string,
	previousEmployer3LeavingReasons?: string,
	previousEmployer3StartingPay?: number,
	previousEmployer3EndingPay?: number,
	previousEmployer3StartDate?: Date,
	previousEmployer3EndDate?: Date,
	workHistoryConditionsThatLimitAbility?: boolean,
	workHistoryConditionsHowCanWeAccommodate?: string,
	workHistoryUSLegal?: boolean,
	workHistoryConvictedOfFelony?: boolean,
	workHistoryConvictedOfFelonyReasons?: string,
	educationHistory1EducationLevelTypeId?: number,
	educationHistory1Institution?: string,
	educationHistory1Major?: string,
	educationHistory1Minor?: string,
	educationHistory1CompletedDate?: Date,
	educationHistory2EducationLevelTypeId?: number,
	educationHistory2Institution?: string,
	educationHistory2Major?: string,
	educationHistory2Minor?: string,
	educationHistory2CompletedDate?: Date,
	educationHistory3EducationLevelTypeId?: number,
	educationHistory3Institution?: string,
	educationHistory3Major?: string,
	educationHistory3Minor?: string,
	educationHistory3CompletedDate?: Date,
	iCertifyStatement?: boolean,
	keywordList?: string,
	rating?: number,
	archived?: boolean,
	atJobPostingId?: number,
	esignName?: string,
	eSignStamptedDateTime?: Date,
	formMakeOffer?: string,
	isWorkflowOfferAccepted?: boolean,
	isWorkflowOfferRejected?: boolean,
	eSignNameOffer?: string,
	eSignStamptedDateTimeOffer?: Date,
	referralSource?: string,
	formRejectApplication?: string,
	isVetStatus_Disabled?: boolean,
	isVetStatus_RecentlySeparated?: boolean,
	isVetStatus_ActiveDutyWartime?: boolean,
	isVetStatus_AFServiceMedal?: boolean,
	vetStatus_DischargeDate?: Date,
	vetStatus_MilitaryReserve?: string,
	vetStatus_Veteran?: string,
	isVetStatus_VietnamEra?: boolean,
	isVetStatus_Other?: boolean,
	externalCandidateId?: number,
	externalSystem?: string,
	gender?: string,
	applyDate?: Date,
	schemeId?: string,
	schemeAgencyId?: string,
	positionOpeningId?: number,
	positionSchemeId?: string,
	positionAgencyId?: string,
	positionUri?: string,
	status?: string,
	statusCategory?: string,
	statusTransitionDateTime?: Date,
	educationLevelCode?: string,
	citizenship?: string,
	requestJSON?: string,
	dateAdded?: Date,
	profileId?: number,
	previousEmployer1Title?: string,
	previousEmployer2Title?: string,
	previousEmployer3Title?: string
}

export interface IApplicationQuestionBankAnswerGET {
    id: number,
    companyId: number,
	companyName: string,
    applicationId: number,
    originalATQuestionTypeId?: number,
    originalQuestionText: string,
    answerDate?: Date,
    answerYesNo?: boolean,
    answerFreeForm: string,
    answerMultipleChoice: string
}

export interface IApplicationQuestionBankAnswerPOST {
    atApplicationId: number,
    originalATQuestionTypeId?: number,
    originalQuestionText: string,
    answerDate?: Date,
    answerYesNo?: boolean,
    answerFreeForm: string,
    answerMultipleChoice: string
}

export interface IApplicationQuestionBankAnswerPUT {
	id: number,
    atApplicationId: number,
    originalATQuestionTypeId?: number,
    originalQuestionText: string,
    answerDate?: Date,
    answerYesNo?: boolean,
    answerFreeForm: string,
    answerMultipleChoice: string
}

export interface IApplicationPOST {
	atSoftStatusTypeId?: number,
	receivedDate?: Date,
	firstName?: string,
	middleName?: string,
	lastName?: string,
	address1?: string,
	address2?: string,
	city?: string,
	zip?: string,
	countryStateTypeId?: number,
	emailAddress?: string,
	phoneHome?: string,
	phoneCell?: string,
	birthDate?: Date,
	ssn?: string,
	alternateTaxNumber?: string,
	previousAddress?: string,
	lengthAtCurrentAddress?: string,
	
	previousEmployer1MayWeContact?: boolean,
	previousEmployer1CompanyName?: string,
	previousEmployer1Address?: string,
	previousEmployer1City?: string,
	previousEmployer1CountryStateTypeId?: number,
	previousEmployer1Phone?: string,
	previousEmployer1SupervisorName?: string,
	previousEmployer1SupervisorTitle?: string,
	previousEmployer1Duties?: string,
	previousEmployer1LeavingReasons?: string,
	previousEmployer1StartingPay?: number,
	previousEmployer1EndingPay?: number,
	previousEmployer1StartDate?: Date,
	previousEmployer1EndDate?: Date,
	
	previousEmployer2MayWeContact?: boolean,
	previousEmployer2CompanyName?: string,
	previousEmployer2Address?: string,
	previousEmployer2City?: string,
	previousEmployer2CountryStateTypeId?: number,
	previousEmployer2Phone?: string,
	previousEmployer2SupervisorName?: string,
	previousEmployer2SupervisorTitle?: string,
	previousEmployer2Duties?: string,
	previousEmployer2LeavingReasons?: string,
	previousEmployer2StartingPay?: number,
	previousEmployer2EndingPay?: number,
	previousEmployer2StartDate?: Date,
	previousEmployer2EndDate?: Date,
	
	previousEmployer3MayWeContact?: boolean,
	previousEmployer3CompanyName?: string,
	previousEmployer3Address?: string,
	previousEmployer3City?: string,
	previousEmployer3CountryStateTypeId?: number,
	previousEmployer3Phone?: string,
	previousEmployer3SupervisorName?: string,
	previousEmployer3SupervisorTitle?: string,
	previousEmployer3Duties?: string,
	previousEmployer3LeavingReasons?: string,
	previousEmployer3StartingPay?: number,
	previousEmployer3EndingPay?: number,
	previousEmployer3StartDate?: Date,
	previousEmployer3EndDate?: Date,
	workHistoryConditionsThatLimitAbility?: boolean,
	workHistoryConditionsHowCanWeAccommodate?: string,
	workHistoryUSLegal?: boolean,
	workHistoryConvictedOfFelony?: boolean,
	workHistoryConvictedOfFelonyReasons?: string,
	educationHistory1EducationLevelTypeId?: number,
	educationHistory1Institution?: string,
	educationHistory1Major?: string,
	educationHistory1Minor?: string,
	educationHistory1CompletedDate?: Date,
	educationHistory2EducationLevelTypeId?: number,
	educationHistory2Institution?: string,
	educationHistory2Major?: string,
	educationHistory2Minor?: string,
	educationHistory2CompletedDate?: Date,
	educationHistory3EducationLevelTypeId?: number,
	educationHistory3Institution?: string,
	educationHistory3Major?: string,
	educationHistory3Minor?: string,
	educationHistory3CompletedDate?: Date,
	iCertifyStatement?: boolean,
	keywordList?: string,
	rating?: number,
	archived?: boolean,
	atJobPostingId?: number,
	esignName?: string,
	eSignStamptedDateTime?: Date,
	formMakeOffer?: string,
	isWorkflowOfferAccepted?: boolean,
	isWorkflowOfferRejected?: boolean,
	eSignNameOffer?: string,
	eSignStamptedDateTimeOffer?: Date,
	referralSource?: string,
	formRejectApplication?: string,
	isVetStatus_Disabled?: boolean,
	isVetStatus_RecentlySeparated?: boolean,
	isVetStatus_ActiveDutyWartime?: boolean,
	isVetStatus_AFServiceMedal?: boolean,
	vetStatus_DischargeDate?: Date,
	vetStatus_MilitaryReserve?: string,
	vetStatus_Veteran?: string,
	isVetStatus_VietnamEra?: boolean,
	isVetStatus_Other?: boolean,
	externalCandidateId?: number,
	externalSystem?: string,
	gender?: string,
	applyDate?: Date,
	schemeId?: string,
	schemeAgencyId?: string,
	positionOpeningId?: number,
	positionSchemeId?: string,
	positionAgencyId?: string,
	positionUri?: string,
	status?: string,
	statusCategory?: string,
	statusTransitionDateTime?: Date,
	educationLevelCode?: string,
	citizenship?: string,
	requestJSON?: string,
	dateAdded?: Date,
	profileId?: number,
	previousEmployer1Title?: string,
	previousEmployer2Title?: string,
	previousEmployer3Title?: string
}

export interface IApplicationPUT {
	atSoftStatusTypeId?: number,
	atApplicationKey: string,
	receivedDate?: Date,
	firstName?: string,
	middleName?: string,
	lastName?: string,
	address1?: string,
	address2?: string,
	city?: string,
	zip?: string,
	countryStateTypeId?: number,
	emailAddress?: string,
	phoneHome?: string,
	phoneCell?: string,
	birthDate?: Date,
	ssn?: string,
	alternateTaxNumber?: string,
	previousAddress?: string,
	lengthAtCurrentAddress?: string,
	
	previousEmployer1MayWeContact?: boolean,
	previousEmployer1CompanyName?: string,
	previousEmployer1Address?: string,
	previousEmployer1City?: string,
	previousEmployer1CountryStateTypeId?: number,
	previousEmployer1Phone?: string,
	previousEmployer1SupervisorName?: string,
	previousEmployer1SupervisorTitle?: string,
	previousEmployer1Duties?: string,
	previousEmployer1LeavingReasons?: string,
	previousEmployer1StartingPay?: number,
	previousEmployer1EndingPay?: number,
	previousEmployer1StartDate?: Date,
	previousEmployer1EndDate?: Date,
	
	previousEmployer2MayWeContact?: boolean,
	previousEmployer2CompanyName?: string,
	previousEmployer2Address?: string,
	previousEmployer2City?: string,
	previousEmployer2CountryStateTypeId?: number,
	previousEmployer2Phone?: string,
	previousEmployer2SupervisorName?: string,
	previousEmployer2SupervisorTitle?: string,
	previousEmployer2Duties?: string,
	previousEmployer2LeavingReasons?: string,
	previousEmployer2StartingPay?: number,
	previousEmployer2EndingPay?: number,
	previousEmployer2StartDate?: Date,
	previousEmployer2EndDate?: Date,
	
	previousEmployer3MayWeContact?: boolean,
	previousEmployer3CompanyName?: string,
	previousEmployer3Address?: string,
	previousEmployer3City?: string,
	previousEmployer3CountryStateTypeId?: number,
	previousEmployer3Phone?: string,
	previousEmployer3SupervisorName?: string,
	previousEmployer3SupervisorTitle?: string,
	previousEmployer3Duties?: string,
	previousEmployer3LeavingReasons?: string,
	previousEmployer3StartingPay?: number,
	previousEmployer3EndingPay?: number,
	previousEmployer3StartDate?: Date,
	previousEmployer3EndDate?: Date,
	workHistoryConditionsThatLimitAbility?: boolean,
	workHistoryConditionsHowCanWeAccommodate?: string,
	workHistoryUSLegal?: boolean,
	workHistoryConvictedOfFelony?: boolean,
	workHistoryConvictedOfFelonyReasons?: string,
	educationHistory1EducationLevelTypeId?: number,
	educationHistory1Institution?: string,
	educationHistory1Major?: string,
	educationHistory1Minor?: string,
	educationHistory1CompletedDate?: Date,
	educationHistory2EducationLevelTypeId?: number,
	educationHistory2Institution?: string,
	educationHistory2Major?: string,
	educationHistory2Minor?: string,
	educationHistory2CompletedDate?: Date,
	educationHistory3EducationLevelTypeId?: number,
	educationHistory3Institution?: string,
	educationHistory3Major?: string,
	educationHistory3Minor?: string,
	educationHistory3CompletedDate?: Date,
	iCertifyStatement?: boolean,
	keywordList?: string,
	rating?: number,
	archived?: boolean,
	atJobPostingId?: number,
	esignName?: string,
	eSignStamptedDateTime?: Date,
	formMakeOffer?: string,
	isWorkflowOfferAccepted?: boolean,
	isWorkflowOfferRejected?: boolean,
	eSignNameOffer?: string,
	eSignStamptedDateTimeOffer?: Date,
	referralSource?: string,
	formRejectApplication?: string,
	isVetStatus_Disabled?: boolean,
	isVetStatus_RecentlySeparated?: boolean,
	isVetStatus_ActiveDutyWartime?: boolean,
	isVetStatus_AFServiceMedal?: boolean,
	vetStatus_DischargeDate?: Date,
	vetStatus_MilitaryReserve?: string,
	vetStatus_Veteran?: string,
	isVetStatus_VietnamEra?: boolean,
	isVetStatus_Other?: boolean,
	externalCandidateId?: number,
	externalSystem?: string,
	gender?: string,
	applyDate?: Date,
	schemeId?: string,
	schemeAgencyId?: string,
	positionOpeningId?: number,
	positionSchemeId?: string,
	positionAgencyId?: string,
	positionUri?: string,
	status?: string,
	statusCategory?: string,
	statusTransitionDateTime?: Date,
	educationLevelCode?: string,
	citizenship?: string,
	requestJSON?: string,
	dateAdded?: Date,
	profileId?: number,
	previousEmployer1Title?: string,
	previousEmployer2Title?: string,
	previousEmployer3Title?: string
}

export interface IApplicationNoteGET {
    id: number,
    atApplicationId: number,
    noteEntryDate?: Date,
    noteEnteredByUsername?: string,
	note?: string
}

export interface IApplicationNotePOST {
    atApplicationId: number,
    noteEntryDate?: Date,
    noteEnteredByUsername?: string,
	note?: string
}

export interface IApplicationNotePUT {
    id: number,
    atApplicationId: number,
    noteEntryDate?: Date,
    noteEnteredByUsername?: string,
	note?: string
}


export interface IApplicationStatusHistoryGET {
    id: number,
	companyId: number,
	companyName: string,
    atApplicationId: number,
    statusChangedDate?: Date,
    statusChangedByUsername?: string,
	changedStatusTitle?: string
}

export interface IApplicationStatusHistoryPOST {
    atApplicationId: number,
    statusChangedDate?: Date,
    statusChangedByUsername?: string,
	changedStatusTitle?: string
}

export interface IApplicationStatusHistoryPUT {
	id: number,
    atApplicationId: number,
    statusChangedDate?: Date,
    statusChangedByUsername?: string,
	changedStatusTitle?: string	
}

export interface IQuestionBankGroupGET {
	id: number,
	companyId: number,
	companyName: string,
	groupName: string
}

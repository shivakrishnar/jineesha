import * as Yup from 'yup';
import * as UUID from '@smallwins/validate/uuid';

export const authorizationHeaderSchema = {
    authorization: { required: true, type: String },
};

export const pathParametersForTenantIdSchema = {
    tenantId: { required: true, type: UUID }
};

export const pathParametersForTenantIdAndCompanyIdSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String }
};

export const pathParametersForTenantIdAndApplicationIdSchema = {
    tenantId: { required: true, type: UUID },
    applicationId: { required: true, type: String }
};

export const pathParametersForTenantIdAndIdSchema = {
    tenantId: { required: true, type: UUID },   
    id: { required: true, type: String }
};

export const pathParametersForTenantIdAndCompanyIdAndIdSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    id: { required: true, type: String }
};

export const pathParametersForTenantIdAndApplicationKey = {
    tenantId: { required: true, type: UUID },
    applicationKey: { required: true, type: UUID }
};

export const pathParametersForTenantIdAndCompanyIdAndHardStatusTypeIdSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    hardStatusTypeId: { required: true, type: String }
};

export const pathParametersForTenantIdAndHardStatusTypeIdSchema = {
    tenantId: { required: true, type: UUID },
    hardStatusTypeId: { required: true, type: String }
};

export const pathParametersForTenantIdAndApplicationVersionIdAndQuestionBankIdSchema = {
    tenantId: { required: true, type: UUID },
    applicationVersionId: { required: true, type: String },
    questionBankId: { required: true, type: String }
};

export const pathParametersForTenantIdAndJobPostingIdAndHRnextUserIdSchema = {
    tenantId: { required: true, type: UUID },
    atJobPostingId: { required: true, type: String },
    hrNextUserId: { required: true, type: String }
};

export const createQuestionBankValidationSchema = Yup.object().shape({
    companyId: Yup.number().required('companyId is required'),
	atQuestionBankGroupId: Yup.number().nullable(),
    atQuestionTypeId: Yup.number().required('atQuestionTypeId is required'),
    questionTitle: Yup.string()
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.'),
    questionText: Yup.string().required('questionText is required'),
    active: Yup.boolean().required('active is required'),
    sequence: Yup.number().required('sequence is required'),
    isRequired: Yup.boolean().required('isRequired is required'),
});

export const createQuestionBankCheckPropertiesSchema = {
    companyId: { required: true, type: Number },
	atQuestionBankGroupId: { required: false, type: Number },
    atQuestionTypeId: { required: true, type: Number },
    questionTitle: { required: true, type: String },
    questionText: { required: true, type: String },
    active: { required: true, type: Boolean },
    sequence: { required: true, type: Number },
    isRequired: { required: true, type: Boolean },
};

export const updateQuestionBankValidationSchema = Yup.object().shape({
    id: Yup.number().required('id is required'),
    companyId: Yup.number().required('companyId is required'),
	atQuestionBankGroupId: Yup.number().nullable(),
    atQuestionTypeId: Yup.number().required('atQuestionTypeId is required'),
    questionTitle: Yup.string()
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.'),
    questionText: Yup.string().required('questionText is required'),
    active: Yup.boolean().required('active is required'),
    sequence: Yup.number().required('sequence is required'),
    isRequired: Yup.boolean().required('isRequired is required'),
});

export const updateQuestionBankCheckPropertiesSchema = {
    id: { required: true, type: Number },
    companyId: { required: true, type: Number },
	atQuestionBankGroupId: { required: false, type: Number },
    atQuestionTypeId: { required: true, type: Number },
    questionTitle: { required: true, type: String },
    questionText: { required: true, type: String },
    active: { required: true, type: Boolean },
    sequence: { required: true, type: Number },
    isRequired: { required: true, type: Boolean },
};

export const createApplicationVersionValidationSchema = Yup.object().shape({
    companyId: Yup.number().required('companyId is required'),
    title: Yup.string()
        .required('title is required')
        .max(100, 'title must be a maximum of 100 characters.'),
    description: Yup.string().nullable(),
    keywordList: Yup.string().nullable(),
    aTApplicationVersionDate: Yup.date().required('aTApplicationVersionDate is required'),
	isSectionOnEmploymentHistory: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnEducationHistory: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnWorkConditions: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnKeywords: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnDocuments: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnCertification: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnPayHistory: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	jazzHrPositionOpeningID: Yup.number().nullable()
});

export const createApplicationVersionCheckPropertiesSchema = {
    companyId: { required: true, type: Number },
    title: { required: true, type: String },
    description: { required: false, type: String },
    keywordList: { required: false, type: String },
    aTApplicationVersionDate: { required: true, type: Date },
    isSectionOnEmploymentHistory: { required: true, type: Boolean },
    isSectionOnEducationHistory: { required: true, type: Number },
    isSectionOnWorkConditions: { required: true, type: Boolean },
    isSectionOnKeywords: { required: true, type: Boolean },
    isSectionOnDocuments: { required: true, type: Boolean },
    isSectionOnCertification: { required: true, type: Boolean },
    isSectionOnPayHistory: { required: true, type: Boolean },
    jazzHrPositionOpeningID: { required: false, type: Number },
};

export const updateApplicationVersionValidationSchema = Yup.object().shape({
    id: Yup.number().required('id is required'),
    companyId: Yup.number().required('companyId is required'),
    title: Yup.string()
        .required('title is required')
        .max(100, 'title must be a maximum of 100 characters.'),
    description: Yup.string().nullable(),
    keywordList: Yup.string().nullable(),
    aTApplicationVersionDate: Yup.date().required('aTApplicationVersionDate is required'),
	isSectionOnEmploymentHistory: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnEducationHistory: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnWorkConditions: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnKeywords: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnDocuments: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnCertification: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	isSectionOnPayHistory: Yup.boolean().required('isSectionOnEmploymentHistory is required'),
	jazzHrPositionOpeningID: Yup.number().nullable()
});

export const updateApplicationVersionCheckPropertiesSchema = {
    id: { required: true, type: Number },
    companyId: { required: true, type: Number },
    title: { required: true, type: String },
    description: { required: false, type: String },
    keywordList: { required: false, type: String },
    aTApplicationVersionDate: { required: true, type: Date },
    isSectionOnEmploymentHistory: { required: true, type: Boolean },
    isSectionOnEducationHistory: { required: true, type: Number },
    isSectionOnWorkConditions: { required: true, type: Boolean },
    isSectionOnKeywords: { required: true, type: Boolean },
    isSectionOnDocuments: { required: true, type: Boolean },
    isSectionOnCertification: { required: true, type: Boolean },
    isSectionOnPayHistory: { required: true, type: Boolean },
    jazzHrPositionOpeningID: { required: false, type: Number },
};

export const createApplicationVersionQuestionBankValidationSchema = Yup.object().shape({
    aTApplicationVersionId: Yup.number().required('aTApplicationVersionId is required'),
    aTQuestionBankId: Yup.number().required('aTQuestionBankId is required')
});

export const createApplicationVersionQuestionBankCheckPropertiesSchema = {
    aTApplicationVersionId: { required: true, type: Number },
    aTQuestionBankId: { required: true, type: Number }
};

export const createQuestionBankMultipleChoiceAnswersValidationSchema = Yup.object().shape({
    atQuestionBankId: Yup.number().required('atQuestionBankId is required'),
    answer: Yup.string()
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.')
});

export const createQuestionBankMultipleChoiceAnswersCheckPropertiesSchema = {
    atQuestionBankId: { required: true, type: Number },
    answer: { required: true, type: String },
};

export const updateQuestionBankMultipleChoiceAnswersValidationSchema = Yup.object().shape({
    id: Yup.number().required('id is required'),
    atQuestionBankId: Yup.number().required('atQuestionBankId is required'),
    answer: Yup.string()
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.')
});

export const updateQuestionBankMultipleChoiceAnswersCheckPropertiesSchema = {
    id: { required: true, type: Number },
    atQuestionBankId: { required: true, type: Number },
    answer: { required: true, type: String },
};

export const createJobPostingValidationSchema = Yup.object().shape({
    companyId: Yup.number().required('companyId is required'),
    aTApplicationVersionId: Yup.number().required('aTApplicationVersionId is required'),
    positionTypeId: Yup.number().nullable(),
    organizationType1Id: Yup.number().nullable(),
    organizationType2Id: Yup.number().nullable(),
    organizationType3Id: Yup.number().nullable(),
    organizationType4Id: Yup.number().nullable(),
    organizationType5Id: Yup.number().nullable(),
    workerCompTypeId: Yup.number().nullable(),
    title: Yup.string()
        .max(100, 'title must be a maximum of 200 characters.')
        .nullable(),
    description: Yup.string().nullable(),
    linkKey: Yup.string().nullable(),
    isOpen: Yup.boolean().nullable(),
    jazzHrPositionOpeningId: Yup.number().nullable()
});

export const createJobPostingCheckPropertiesSchema = {
    companyId: { required: true, type: Number },
    aTApplicationVersionId: { required: true, type: Number },
    positionTypeId: { required: false, type: Number },
    organizationType1Id: { required: false, type: Number },
    organizationType2Id: { required: false, type: Number },
    organizationType3Id: { required: false, type: Number },
    organizationType4Id: { required: false, type: Number },
    organizationType5Id: { required: false, type: Number },
    workerCompTypeId: { required: false, type: Number },
    title: { required: false, type: String },
    description: { required: false, type: String },
    linkKey: { required: false, type: String },
    isOpen: { required: false, type: Boolean },
    jazzHrPositionOpeningId: { required: false, type: Number }
};

export const updateJobPostingValidationSchema = Yup.object().shape({
    id: Yup.number().required('id is required'),
    companyId: Yup.number().required('companyId is required'),
    aTApplicationVersionId: Yup.number().required('aTApplicationVersionId is required'),
    positionTypeId: Yup.number().nullable(),
    organizationType1Id: Yup.number().nullable(),
    organizationType2Id: Yup.number().nullable(),
    organizationType3Id: Yup.number().nullable(),
    organizationType4Id: Yup.number().nullable(),
    organizationType5Id: Yup.number().nullable(),
    workerCompTypeId: Yup.number().nullable(),
    title: Yup.string()
        .max(100, 'title must be a maximum of 200 characters.')
        .nullable(),
    description: Yup.string().nullable(),
    linkKey: Yup.string().nullable(),
    isOpen: Yup.boolean().nullable(),
    jazzHrPositionOpeningId: Yup.number().nullable()
});

export const updateJobPostingCheckPropertiesSchema = {
    id: { required: true, type: Number },
    companyId: { required: true, type: Number },
    aTApplicationVersionId: { required: true, type: Number },
    positionTypeId: { required: false, type: Number },
    organizationType1Id: { required: false, type: Number },
    organizationType2Id: { required: false, type: Number },
    organizationType3Id: { required: false, type: Number },
    organizationType4Id: { required: false, type: Number },
    organizationType5Id: { required: false, type: Number },
    workerCompTypeId: { required: false, type: Number },
    title: { required: false, type: String },
    description: { required: false, type: String },
    linkKey: { required: false, type: String },
    isOpen: { required: false, type: Boolean },
    jazzHrPositionOpeningId: { required: false, type: Number }
};

export const createJobPostingResponsibleUserValidationSchema = Yup.object().shape({
    atJobPostingId: Yup.number().required('aTJobPostingId is required'),
    hrNextUserId: Yup.number().required('hrNextUserId is required')
});

export const createJobPostingResponsibleUserCheckPropertiesSchema = {
    atJobPostingId: { required: true, type: Number },
    hrNextUserId: { required: true, type: Number }
};

export const createApplicationQuestionBankAnswerValidationSchema = Yup.object().shape({
    atApplicationId: Yup.number().required('atApplicationId is required'),
    originalATQuestionTypeId: Yup.number().nullable(),
    originalQuestionText: Yup.string().required('originalQuestionText is required'),
    answerDate: Yup.date().nullable(),
    answerYesNo: Yup.boolean().nullable(),
    answerFreeForm: Yup.string().required('answerFreeForm is required'),
    answerMultipleChoice: Yup.string().required('answerMultipleChoice is required')
});

export const createApplicationQuestionBankAnswerCheckPropertiesSchema = {
    atApplicationId: { required: true, type: Number },
    originalATQuestionTypeId: { required: false, type: Number },
    originalQuestionText: { required: true, type: String },
    answerDate: { required: false, type: Date },
    answerYesNo: { required: false, type: Boolean },
    answerFreeForm: { required: true, type: String },
    answerMultipleChoice: { required: true, type: String }
};

export const updateApplicationQuestionBankAnswerValidationSchema = Yup.object().shape({
	id: Yup.number().required('id is required'),
    atApplicationId: Yup.number().required('atApplicationId is required'),
    originalATQuestionTypeId: Yup.number().nullable(),
    originalQuestionText: Yup.string().required('originalQuestionText is required'),
    answerDate: Yup.date().nullable(),
    answerYesNo: Yup.boolean().nullable(),
    answerFreeForm: Yup.string().required('answerFreeForm is required'),
    answerMultipleChoice: Yup.string().required('answerMultipleChoice is required')
});

export const updateApplicationQuestionBankAnswerCheckPropertiesSchema = {
	id: { required: true, type: Number },
    atApplicationId: { required: true, type: Number },
    originalATQuestionTypeId: { required: false, type: Number },
    originalQuestionText: { required: true, type: String },
    answerDate: { required: false, type: Date },
    answerYesNo: { required: false, type: Boolean },
    answerFreeForm: { required: true, type: String },
    answerMultipleChoice: { required: true, type: String }
};

export const createApplicationValidationSchema = Yup.object().shape({
    atSoftStatusTypeId: Yup.number().nullable(),
    receivedDate: Yup.date().nullable(),
    firstName: Yup.string().max(50, 'firstName must be a maximum of 50 characters.').nullable(),
    middleName: Yup.string().max(50, 'middleName must be a maximum of 50 characters.').nullable(),
	lastName: Yup.string().max(100, 'lastName must be a maximum of 100 characters.').nullable(),
	address1: Yup.string().max(150, 'address1 must be a maximum of 150 characters.').nullable(),
	address2: Yup.string().max(150, 'address2 must be a maximum of 150 characters.').nullable(),
	city: Yup.string().max(150, 'city must be a maximum of 150 characters.').nullable(),
	zip: Yup.string().max(15, 'zip must be a maximum of 15 characters.').nullable(),
	countryStateTypeId: Yup.number().nullable(),
	emailAddress: Yup.string().max(100, 'emailAddress must be a maximum of 100 characters.').nullable(),
	phoneHome: Yup.string().max(100, 'phoneHome must be a maximum of 100 characters.').nullable(),
	phoneCell: Yup.string().max(100, 'phoneCell must be a maximum of 100 characters.').nullable(),
	birthDate: Yup.date().nullable(),
	ssn: Yup.string().max(11, 'ssn must be a maximum of 11 characters.').nullable(),
	alternateTaxNumber: Yup.string().max(20, 'alternateTaxNumber must be a maximum of 20 characters.').nullable(),
	previousAddress: Yup.string().max(300, 'previousAddress must be a maximum of 300 characters.').nullable(),
	lengthAtCurrentAddress: Yup.string().max(200, 'lengthAtCurrentAddress must be a maximum of 200 characters.').nullable(),
	
	previousEmployer1MayWeContact: Yup.boolean().nullable(),
	previousEmployer1CompanyName: Yup.string().max(100, 'previousEmployer1CompanyName must be a maximum of 100 characters.').nullable(),
	previousEmployer1Address: Yup.string().max(300, 'previousEmployer1Address must be a maximum of 300 characters.').nullable(),
	previousEmployer1City: Yup.string().max(150, 'previousEmployer1City must be a maximum of 150 characters.').nullable(),
	previousEmployer1CountryStateTypeId: Yup.number().nullable(),
	previousEmployer1Phone: Yup.string().max(25, 'previousEmployer1Phone must be a maximum of 25 characters.').nullable(),
	previousEmployer1SupervisorName: Yup.string().max(100, 'previousEmployer1SupervisorName must be a maximum of 100 characters.').nullable(),
	previousEmployer1SupervisorTitle: Yup.string().max(100, 'previousEmployer1SupervisorTitle must be a maximum of 100 characters.').nullable(),
	previousEmployer1Duties: Yup.string().nullable(),
	previousEmployer1LeavingReasons: Yup.string().nullable(),
	previousEmployer1StartingPay: Yup.number().nullable(),
	previousEmployer1EndingPay: Yup.number().nullable(),
	previousEmployer1StartDate: Yup.date().nullable(),
	previousEmployer1EndDate: Yup.date().nullable(),
	
	previousEmployer2MayWeContact: Yup.boolean().nullable(),
	previousEmployer2CompanyName: Yup.string().max(100, 'previousEmployer2CompanyName must be a maximum of 100 characters.').nullable(),
	previousEmployer2Address: Yup.string().max(300, 'previousEmployer2Address must be a maximum of 300 characters.').nullable(),
	previousEmployer2City: Yup.string().max(150, 'previousEmployer2City must be a maximum of 150 characters.').nullable(),
	previousEmployer2CountryStateTypeId: Yup.number().nullable(),
	previousEmployer2Phone: Yup.string().max(25, 'previousEmployer2Phone must be a maximum of 25 characters.').nullable(),
	previousEmployer2SupervisorName: Yup.string().max(100, 'previousEmployer2SupervisorName must be a maximum of 100 characters.').nullable(),
	previousEmployer2SupervisorTitle: Yup.string().max(100, 'previousEmployer2SupervisorTitle must be a maximum of 100 characters.').nullable(),
	previousEmployer2Duties: Yup.string().nullable(),
	previousEmployer2LeavingReasons: Yup.string().nullable(),
	previousEmployer2StartingPay: Yup.number().nullable(),
	previousEmployer2EndingPay: Yup.number().nullable(),
	previousEmployer2StartDate: Yup.date().nullable(),
	previousEmployer2EndDate: Yup.date().nullable(),
	
	previousEmployer3MayWeContact: Yup.boolean().nullable(),
	previousEmployer3CompanyName: Yup.string().max(100, 'previousEmployer3CompanyName must be a maximum of 100 characters.').nullable(),
	previousEmployer3Address: Yup.string().max(300, 'previousEmployer3Address must be a maximum of 300 characters.').nullable(),
	previousEmployer3City: Yup.string().max(150, 'previousEmployer3City must be a maximum of 150 characters.').nullable(),
	previousEmployer3CountryStateTypeId: Yup.number().nullable(),
	previousEmployer3Phone: Yup.string().max(25, 'previousEmployer3Phone must be a maximum of 25 characters.').nullable(),
	previousEmployer3SupervisorName: Yup.string().max(100, 'previousEmployer3SupervisorName must be a maximum of 100 characters.').nullable(),
	previousEmployer3SupervisorTitle: Yup.string().max(100, 'previousEmployer3SupervisorTitle must be a maximum of 100 characters.').nullable(),
	previousEmployer3Duties: Yup.string().nullable(),
	previousEmployer3LeavingReasons: Yup.string().nullable(),
	previousEmployer3StartingPay: Yup.number().nullable(),
	previousEmployer3EndingPay: Yup.number().nullable(),
	previousEmployer3StartDate: Yup.date().nullable(),
	previousEmployer3EndDate: Yup.date().nullable(),

	workHistoryConditionsThatLimitAbility: Yup.boolean().nullable(),
	workHistoryConditionsHowCanWeAccommodate: Yup.string().nullable(),
	workHistoryUSLegal: Yup.boolean().nullable(),
	workHistoryConvictedOfFelony: Yup.boolean().nullable(),
	workHistoryConvictedOfFelonyReasons: Yup.string().nullable(),
	
    educationHistory1EducationLevelTypeId: Yup.number().nullable(),
	educationHistory1Institution: Yup.string().max(100, 'educationHistory1Institution must be a maximum of 100 characters.').nullable(),
	educationHistory1Major: Yup.string().max(100, 'educationHistory1Major must be a maximum of 100 characters.').nullable(),
	educationHistory1Minor: Yup.string().max(100, 'educationHistory1Minor must be a maximum of 100 characters.').nullable(),
	educationHistory1CompletedDate: Yup.date().nullable(),
	
    educationHistory2EducationLevelTypeId: Yup.number().nullable(),
	educationHistory2Institution: Yup.string().max(100, 'educationHistory2Institution must be a maximum of 100 characters.').nullable(),
	educationHistory2Major: Yup.string().max(100, 'educationHistory2Major must be a maximum of 100 characters.').nullable(),
	educationHistory2Minor: Yup.string().max(100, 'educationHistory2Minor must be a maximum of 100 characters.').nullable(),
	educationHistory2CompletedDate: Yup.date().nullable(),
	
    educationHistory3EducationLevelTypeId: Yup.number().nullable(),
	educationHistory3Institution: Yup.string().max(100, 'educationHistory3Institution must be a maximum of 100 characters.').nullable(),
	educationHistory3Major: Yup.string().max(100, 'educationHistory3Major must be a maximum of 100 characters.').nullable(),
	educationHistory3Minor: Yup.string().max(100, 'educationHistory3Minor must be a maximum of 100 characters.').nullable(),
	educationHistory3CompletedDate: Yup.date().nullable(),
	
    iCertifyStatement: Yup.boolean().nullable(),
	keywordList: Yup.string().nullable(),
	rating: Yup.number().nullable(),
	archived: Yup.boolean().nullable(),
	
    atJobPostingId: Yup.number().required('atJobPostingId is required'),
	
    esignName: Yup.string().max(100, 'esignName must be a maximum of 100 characters.').nullable(),
	eSignStamptedDateTime: Yup.date().nullable(),
	formMakeOffer: Yup.string().nullable(),
	isWorkflowOfferAccepted: Yup.boolean().nullable(),
	isWorkflowOfferRejected: Yup.boolean().nullable(),
	eSignNameOffer: Yup.string().max(100, 'eSignNameOffer must be a maximum of 100 characters.').nullable(),
	eSignStamptedDateTimeOffer: Yup.date().nullable(),
	referralSource: Yup.string().max(200, 'referralSource must be a maximum of 200 characters.').nullable(),
	formRejectApplication: Yup.string().nullable(),
	isVetStatus_Disabled: Yup.boolean().nullable(),
	isVetStatus_RecentlySeparated: Yup.boolean().nullable(),
	isVetStatus_ActiveDutyWartime: Yup.boolean().nullable(),
	isVetStatus_AFServiceMedal: Yup.boolean().nullable(),
	vetStatus_DischargeDate: Yup.date().nullable(),
	vetStatus_MilitaryReserve: Yup.string().max(50, 'vetStatus_MilitaryReserve must be a maximum of 50 characters.').nullable(),
	vetStatus_Veteran: Yup.string().max(50, 'vetStatus_Veteran must be a maximum of 50 characters.').nullable(),
	isVetStatus_VietnamEra: Yup.boolean().nullable(),
	isVetStatus_Other: Yup.boolean().nullable(),
	externalCandidateId: Yup.number().nullable(),
	externalSystem: Yup.string().max(50, 'externalSystem must be a maximum of 50 characters.').nullable(),
	gender: Yup.string().max(10, 'gender must be a maximum of 10 characters.').nullable(),
	applyDate: Yup.date().nullable(),
	schemeId: Yup.string().max(30, 'schemeId must be a maximum of 30 characters.').nullable(),
	schemeAgencyId: Yup.string().max(10, 'schemeAgencyId must be a maximum of 10 characters.').nullable(),
	positionOpeningId: Yup.number().nullable(),
	positionSchemeId: Yup.string().max(20, 'positionSchemeId must be a maximum of 20 characters.').nullable(),
	positionAgencyId: Yup.string().max(10, 'positionAgencyId must be a maximum of 10 characters.').nullable(),
	positionUri: Yup.string().max(2200, 'positionUri must be a maximum of 2200 characters.').nullable(),
	status: Yup.string().max(50, 'status must be a maximum of 50 characters.').nullable(),
	statusCategory: Yup.string().max(50, 'statusCategory must be a maximum of 50 characters.').nullable(),
	statusTransitionDateTime: Yup.date().nullable(),
	educationLevelCode: Yup.string().max(50, 'educationLevelCode must be a maximum of 50 characters.').nullable(),
	citizenship: Yup.string().max(60, 'citizenship must be a maximum of 60 characters.').nullable(),
	requestJSON: Yup.string().nullable(),
	dateAdded: Yup.date().nullable(),
	profileId: Yup.number().nullable(),
	previousEmployer1Title: Yup.string().max(300, 'previousEmployer1Title must be a maximum of 300 characters.').nullable(),
	previousEmployer2Title: Yup.string().max(300, 'previousEmployer2Title must be a maximum of 300 characters.').nullable(),
	previousEmployer3Title: Yup.string().max(300, 'previousEmployer3Title must be a maximum of 300 characters.').nullable()
});

export const createApplicationCheckPropertiesSchema = {
    atSoftStatusTypeId: { required: false, type: Number },
    receivedDate: { required: false, type: Number },
    firstName: { required: false, type: String },
	middleName: { required: false, type: String },
	lastName: { required: false, type: String },
	address1: { required: false, type: String },
	address2: { required: false, type: String },
	city: { required: false, type: String },
	zip: { required: false, type: String },
	countryStateTypeId: { required: false, type: Number },
	emailAddress: { required: false, type: String },
	phoneHome: { required: false, type: String },
	phoneCell: { required: false, type: String },
	birthDate: { required: false, type: Date },
	ssn: { required: false, type: String },
	alternateTaxNumber: { required: false, type: String },
	previousAddress: { required: false, type: String },
	lengthAtCurrentAddress: { required: false, type: String },
	
	previousEmployer1MayWeContact: { required: false, type: Boolean },
	previousEmployer1CompanyName: { required: false, type: String },
	previousEmployer1Address: { required: false, type: String },
	previousEmployer1City: { required: false, type: String },
	previousEmployer1CountryStateTypeId: { required: false, type: Number },
	previousEmployer1Phone: { required: false, type: String },
	previousEmployer1SupervisorName: { required: false, type: String },
	previousEmployer1SupervisorTitle: { required: false, type: String },
	previousEmployer1Duties: { required: false, type: String },
	previousEmployer1LeavingReasons: { required: false, type: String },
	previousEmployer1StartingPay: { required: false, type: Number },
	previousEmployer1EndingPay: { required: false, type: Number },
	previousEmployer1StartDate: { required: false, type: Date },
	previousEmployer1EndDate: { required: false, type: Date },
	
	previousEmployer2MayWeContact: { required: false, type: Boolean },
	previousEmployer2CompanyName: { required: false, type: String },
	previousEmployer2Address: { required: false, type: String },
	previousEmployer2City: { required: false, type: String },
	previousEmployer2CountryStateTypeId: { required: false, type: Number },
	previousEmployer2Phone: { required: false, type: String },
	previousEmployer2SupervisorName: { required: false, type: String },
	previousEmployer2SupervisorTitle: { required: false, type: String },
	previousEmployer2Duties: { required: false, type: String },
	previousEmployer2LeavingReasons: { required: false, type: String },
	previousEmployer2StartingPay: { required: false, type: Number },
	previousEmployer2EndingPay: { required: false, type: Number },
	previousEmployer2StartDate: { required: false, type: Date },
	previousEmployer2EndDate: { required: false, type: Date },
	
	previousEmployer3MayWeContact: { required: false, type: Boolean },
	previousEmployer3CompanyName: { required: false, type: String },
	previousEmployer3Address: { required: false, type: String },
	previousEmployer3City: { required: false, type: String },
	previousEmployer3CountryStateTypeId: { required: false, type: Number },
	previousEmployer3Phone: { required: false, type: String },
	previousEmployer3SupervisorName: { required: false, type: String },
	previousEmployer3SupervisorTitle: { required: false, type: String },
	previousEmployer3Duties: { required: false, type: String },
	previousEmployer3LeavingReasons: { required: false, type: String },
	previousEmployer3StartingPay: { required: false, type: Number },
	previousEmployer3EndingPay: { required: false, type: Number },
	previousEmployer3StartDate: { required: false, type: Date },
	previousEmployer3EndDate: { required: false, type: Date },

	workHistoryConditionsThatLimitAbility: { required: false, type: Boolean },
	workHistoryConditionsHowCanWeAccommodate: { required: false, type: String },
	workHistoryUSLegal: { required: false, type: Boolean },
	workHistoryConvictedOfFelony: { required: false, type: Boolean },
	workHistoryConvictedOfFelonyReasons: { required: false, type: String },
	
    educationHistory1EducationLevelTypeId: { required: false, type: Number },
	educationHistory1Institution: { required: false, type: String },
	educationHistory1Major: { required: false, type: String },
	educationHistory1Minor: { required: false, type: String },
	educationHistory1CompletedDate: { required: false, type: Date },
	
    educationHistory2EducationLevelTypeId: { required: false, type: Number },
	educationHistory2Institution: { required: false, type: String },
	educationHistory2Major: { required: false, type: String },
	educationHistory2Minor: { required: false, type: String },
	educationHistory2CompletedDate: { required: false, type: Date },
	
    educationHistory3EducationLevelTypeId: { required: false, type: Number },
	educationHistory3Institution: { required: false, type: String },
	educationHistory3Major: { required: false, type: String },
	educationHistory3Minor: { required: false, type: String },
	educationHistory3CompletedDate: { required: false, type: Date },
	
    iCertifyStatement: { required: false, type: Boolean },
	keywordList: { required: false, type: String },
	rating: { required: false, type: Number },
	archived: { required: false, type: Boolean },
	
    atJobPostingId: { required: true, type: Number },
	
    esignName: { required: false, type: String },
	eSignStamptedDateTime: { required: false, type: Date },
	formMakeOffer: { required: false, type: String },
	isWorkflowOfferAccepted: { required: false, type: Boolean },
	isWorkflowOfferRejected: { required: false, type: Boolean },
	eSignNameOffer: { required: false, type: String },
	eSignStamptedDateTimeOffer: { required: false, type: Date },
	referralSource: { required: false, type: String },
	formRejectApplication: { required: false, type: String },
	isVetStatus_Disabled: { required: false, type: Boolean },
	isVetStatus_RecentlySeparated: { required: false, type: Boolean },
	isVetStatus_ActiveDutyWartime: { required: false, type: Boolean },
	isVetStatus_AFServiceMedal: { required: false, type: Boolean },
	vetStatus_DischargeDate: { required: false, type: Date },
	vetStatus_MilitaryReserve: { required: false, type: String },
	vetStatus_Veteran: { required: false, type: String },
	isVetStatus_VietnamEra: { required: false, type: Boolean },
	isVetStatus_Other: { required: false, type: Boolean },
	externalCandidateId: { required: false, type: Number },
	externalSystem: { required: false, type: String },
	gender: { required: false, type: String },
	applyDate: { required: false, type: Date },
	schemeId: { required: false, type: String },
	schemeAgencyId: { required: false, type: String },
	positionOpeningId: { required: false, type: Number },
	positionSchemeId: { required: false, type: String },
	positionAgencyId: { required: false, type: String },
	positionUri: { required: false, type: String },
	status: { required: false, type: String },
	statusCategory: { required: false, type: String },
	statusTransitionDateTime: { required: false, type: Date },
	educationLevelCode: { required: false, type: String },
	citizenship: { required: false, type: String },
	requestJSON: { required: false, type: String },
	dateAdded: { required: false, type: Date },
	profileId: { required: false, type: Number },

	previousEmployer1Title: { required: false, type: String },
	previousEmployer2Title: { required: false, type: String },
	previousEmployer3Title: { required: false, type: String }
};

export const updateApplicationValidationSchema = Yup.object().shape({
    atSoftStatusTypeId: Yup.number().nullable(),
	atApplicationKey: Yup.string().required('atApplicationKey is required'),
    receivedDate: Yup.date().nullable(),
    firstName: Yup.string().max(50, 'firstName must be a maximum of 50 characters.').nullable(),
    middleName: Yup.string().max(50, 'middleName must be a maximum of 50 characters.').nullable(),
	lastName: Yup.string().max(100, 'lastName must be a maximum of 100 characters.').nullable(),
	address1: Yup.string().max(150, 'address1 must be a maximum of 150 characters.').nullable(),
	address2: Yup.string().max(150, 'address2 must be a maximum of 150 characters.').nullable(),
	city: Yup.string().max(150, 'city must be a maximum of 150 characters.').nullable(),
	zip: Yup.string().max(15, 'zip must be a maximum of 15 characters.').nullable(),
	countryStateTypeId: Yup.number().nullable(),
	emailAddress: Yup.string().max(100, 'emailAddress must be a maximum of 100 characters.').nullable(),
	phoneHome: Yup.string().max(100, 'phoneHome must be a maximum of 100 characters.').nullable(),
	phoneCell: Yup.string().max(100, 'phoneCell must be a maximum of 100 characters.').nullable(),
	birthDate: Yup.date().nullable(),
	ssn: Yup.string().max(11, 'ssn must be a maximum of 11 characters.').nullable(),
	alternateTaxNumber: Yup.string().max(20, 'alternateTaxNumber must be a maximum of 20 characters.').nullable(),
	previousAddress: Yup.string().max(300, 'previousAddress must be a maximum of 300 characters.').nullable(),
	lengthAtCurrentAddress: Yup.string().max(200, 'lengthAtCurrentAddress must be a maximum of 200 characters.').nullable(),
	
	previousEmployer1MayWeContact: Yup.boolean().nullable(),
	previousEmployer1CompanyName: Yup.string().max(100, 'previousEmployer1CompanyName must be a maximum of 100 characters.').nullable(),
	previousEmployer1Address: Yup.string().max(300, 'previousEmployer1Address must be a maximum of 300 characters.').nullable(),
	previousEmployer1City: Yup.string().max(150, 'previousEmployer1City must be a maximum of 150 characters.').nullable(),
	previousEmployer1CountryStateTypeId: Yup.number().nullable(),
	previousEmployer1Phone: Yup.string().max(25, 'previousEmployer1Phone must be a maximum of 25 characters.').nullable(),
	previousEmployer1SupervisorName: Yup.string().max(100, 'previousEmployer1SupervisorName must be a maximum of 100 characters.').nullable(),
	previousEmployer1SupervisorTitle: Yup.string().max(100, 'previousEmployer1SupervisorTitle must be a maximum of 100 characters.').nullable(),
	previousEmployer1Duties: Yup.string().nullable(),
	previousEmployer1LeavingReasons: Yup.string().nullable(),
	previousEmployer1StartingPay: Yup.number().nullable(),
	previousEmployer1EndingPay: Yup.number().nullable(),
	previousEmployer1StartDate: Yup.date().nullable(),
	previousEmployer1EndDate: Yup.date().nullable(),
	
	previousEmployer2MayWeContact: Yup.boolean().nullable(),
	previousEmployer2CompanyName: Yup.string().max(100, 'previousEmployer2CompanyName must be a maximum of 100 characters.').nullable(),
	previousEmployer2Address: Yup.string().max(300, 'previousEmployer2Address must be a maximum of 300 characters.').nullable(),
	previousEmployer2City: Yup.string().max(150, 'previousEmployer2City must be a maximum of 150 characters.').nullable(),
	previousEmployer2CountryStateTypeId: Yup.number().nullable(),
	previousEmployer2Phone: Yup.string().max(25, 'previousEmployer2Phone must be a maximum of 25 characters.').nullable(),
	previousEmployer2SupervisorName: Yup.string().max(100, 'previousEmployer2SupervisorName must be a maximum of 100 characters.').nullable(),
	previousEmployer2SupervisorTitle: Yup.string().max(100, 'previousEmployer2SupervisorTitle must be a maximum of 100 characters.').nullable(),
	previousEmployer2Duties: Yup.string().nullable(),
	previousEmployer2LeavingReasons: Yup.string().nullable(),
	previousEmployer2StartingPay: Yup.number().nullable(),
	previousEmployer2EndingPay: Yup.number().nullable(),
	previousEmployer2StartDate: Yup.date().nullable(),
	previousEmployer2EndDate: Yup.date().nullable(),
	
	previousEmployer3MayWeContact: Yup.boolean().nullable(),
	previousEmployer3CompanyName: Yup.string().max(100, 'previousEmployer3CompanyName must be a maximum of 100 characters.').nullable(),
	previousEmployer3Address: Yup.string().max(300, 'previousEmployer3Address must be a maximum of 300 characters.').nullable(),
	previousEmployer3City: Yup.string().max(150, 'previousEmployer3City must be a maximum of 150 characters.').nullable(),
	previousEmployer3CountryStateTypeId: Yup.number().nullable(),
	previousEmployer3Phone: Yup.string().max(25, 'previousEmployer3Phone must be a maximum of 25 characters.').nullable(),
	previousEmployer3SupervisorName: Yup.string().max(100, 'previousEmployer3SupervisorName must be a maximum of 100 characters.').nullable(),
	previousEmployer3SupervisorTitle: Yup.string().max(100, 'previousEmployer3SupervisorTitle must be a maximum of 100 characters.').nullable(),
	previousEmployer3Duties: Yup.string().nullable(),
	previousEmployer3LeavingReasons: Yup.string().nullable(),
	previousEmployer3StartingPay: Yup.number().nullable(),
	previousEmployer3EndingPay: Yup.number().nullable(),
	previousEmployer3StartDate: Yup.date().nullable(),
	previousEmployer3EndDate: Yup.date().nullable(),

	workHistoryConditionsThatLimitAbility: Yup.boolean().nullable(),
	workHistoryConditionsHowCanWeAccommodate: Yup.string().nullable(),
	workHistoryUSLegal: Yup.boolean().nullable(),
	workHistoryConvictedOfFelony: Yup.boolean().nullable(),
	workHistoryConvictedOfFelonyReasons: Yup.string().nullable(),
	
    educationHistory1EducationLevelTypeId: Yup.number().nullable(),
	educationHistory1Institution: Yup.string().max(100, 'educationHistory1Institution must be a maximum of 100 characters.').nullable(),
	educationHistory1Major: Yup.string().max(100, 'educationHistory1Major must be a maximum of 100 characters.').nullable(),
	educationHistory1Minor: Yup.string().max(100, 'educationHistory1Minor must be a maximum of 100 characters.').nullable(),
	educationHistory1CompletedDate: Yup.date().nullable(),
	
    educationHistory2EducationLevelTypeId: Yup.number().nullable(),
	educationHistory2Institution: Yup.string().max(100, 'educationHistory2Institution must be a maximum of 100 characters.').nullable(),
	educationHistory2Major: Yup.string().max(100, 'educationHistory2Major must be a maximum of 100 characters.').nullable(),
	educationHistory2Minor: Yup.string().max(100, 'educationHistory2Minor must be a maximum of 100 characters.').nullable(),
	educationHistory2CompletedDate: Yup.date().nullable(),
	
    educationHistory3EducationLevelTypeId: Yup.number().nullable(),
	educationHistory3Institution: Yup.string().max(100, 'educationHistory3Institution must be a maximum of 100 characters.').nullable(),
	educationHistory3Major: Yup.string().max(100, 'educationHistory3Major must be a maximum of 100 characters.').nullable(),
	educationHistory3Minor: Yup.string().max(100, 'educationHistory3Minor must be a maximum of 100 characters.').nullable(),
	educationHistory3CompletedDate: Yup.date().nullable(),
	
    iCertifyStatement: Yup.boolean().nullable(),
	keywordList: Yup.string().nullable(),
	rating: Yup.number().nullable(),
	archived: Yup.boolean().nullable(),
	
    atJobPostingId: Yup.number().required('atJobPostingId is required'),
	
    esignName: Yup.string().max(100, 'esignName must be a maximum of 100 characters.').nullable(),
	eSignStamptedDateTime: Yup.date().nullable(),
	formMakeOffer: Yup.string().nullable(),
	isWorkflowOfferAccepted: Yup.boolean().nullable(),
	isWorkflowOfferRejected: Yup.boolean().nullable(),
	eSignNameOffer: Yup.string().max(100, 'eSignNameOffer must be a maximum of 100 characters.').nullable(),
	eSignStamptedDateTimeOffer: Yup.date().nullable(),
	referralSource: Yup.string().max(200, 'referralSource must be a maximum of 200 characters.').nullable(),
	formRejectApplication: Yup.string().nullable(),
	isVetStatus_Disabled: Yup.boolean().nullable(),
	isVetStatus_RecentlySeparated: Yup.boolean().nullable(),
	isVetStatus_ActiveDutyWartime: Yup.boolean().nullable(),
	isVetStatus_AFServiceMedal: Yup.boolean().nullable(),
	vetStatus_DischargeDate: Yup.date().nullable(),
	vetStatus_MilitaryReserve: Yup.string().max(50, 'vetStatus_MilitaryReserve must be a maximum of 50 characters.').nullable(),
	vetStatus_Veteran: Yup.string().max(50, 'vetStatus_Veteran must be a maximum of 50 characters.').nullable(),
	isVetStatus_VietnamEra: Yup.boolean().nullable(),
	isVetStatus_Other: Yup.boolean().nullable(),
	externalCandidateId: Yup.number().nullable(),
	externalSystem: Yup.string().max(50, 'externalSystem must be a maximum of 50 characters.').nullable(),
	gender: Yup.string().max(10, 'gender must be a maximum of 10 characters.').nullable(),
	applyDate: Yup.date().nullable(),
	schemeId: Yup.string().max(30, 'schemeId must be a maximum of 30 characters.').nullable(),
	schemeAgencyId: Yup.string().max(10, 'schemeAgencyId must be a maximum of 10 characters.').nullable(),
	positionOpeningId: Yup.number().nullable(),
	positionSchemeId: Yup.string().max(20, 'positionSchemeId must be a maximum of 20 characters.').nullable(),
	positionAgencyId: Yup.string().max(10, 'positionAgencyId must be a maximum of 10 characters.').nullable(),
	positionUri: Yup.string().max(2200, 'positionUri must be a maximum of 2200 characters.').nullable(),
	status: Yup.string().max(50, 'status must be a maximum of 50 characters.').nullable(),
	statusCategory: Yup.string().max(50, 'statusCategory must be a maximum of 50 characters.').nullable(),
	statusTransitionDateTime: Yup.date().nullable(),
	educationLevelCode: Yup.string().max(50, 'educationLevelCode must be a maximum of 50 characters.').nullable(),
	citizenship: Yup.string().max(60, 'citizenship must be a maximum of 60 characters.').nullable(),
	requestJSON: Yup.string().nullable(),
	dateAdded: Yup.date().nullable(),
	profileId: Yup.number().nullable(),
	previousEmployer1Title: Yup.string().max(300, 'previousEmployer1Title must be a maximum of 300 characters.').nullable(),
	previousEmployer2Title: Yup.string().max(300, 'previousEmployer2Title must be a maximum of 300 characters.').nullable(),
	previousEmployer3Title: Yup.string().max(300, 'previousEmployer3Title must be a maximum of 300 characters.').nullable()
});

export const updateApplicationCheckPropertiesSchema = {
    atSoftStatusTypeId: { required: false, type: Number },
	atApplicationKey: { required: true, type: String },
    receivedDate: { required: false, type: Number },
    firstName: { required: false, type: String },
	middleName: { required: false, type: String },
	lastName: { required: false, type: String },
	address1: { required: false, type: String },
	address2: { required: false, type: String },
	city: { required: false, type: String },
	zip: { required: false, type: String },
	countryStateTypeId: { required: false, type: Number },
	emailAddress: { required: false, type: String },
	phoneHome: { required: false, type: String },
	phoneCell: { required: false, type: String },
	birthDate: { required: false, type: Date },
	ssn: { required: false, type: String },
	alternateTaxNumber: { required: false, type: String },
	previousAddress: { required: false, type: String },
	lengthAtCurrentAddress: { required: false, type: String },
	
	previousEmployer1MayWeContact: { required: false, type: Boolean },
	previousEmployer1CompanyName: { required: false, type: String },
	previousEmployer1Address: { required: false, type: String },
	previousEmployer1City: { required: false, type: String },
	previousEmployer1CountryStateTypeId: { required: false, type: Number },
	previousEmployer1Phone: { required: false, type: String },
	previousEmployer1SupervisorName: { required: false, type: String },
	previousEmployer1SupervisorTitle: { required: false, type: String },
	previousEmployer1Duties: { required: false, type: String },
	previousEmployer1LeavingReasons: { required: false, type: String },
	previousEmployer1StartingPay: { required: false, type: Number },
	previousEmployer1EndingPay: { required: false, type: Number },
	previousEmployer1StartDate: { required: false, type: Date },
	previousEmployer1EndDate: { required: false, type: Date },
	
	previousEmployer2MayWeContact: { required: false, type: Boolean },
	previousEmployer2CompanyName: { required: false, type: String },
	previousEmployer2Address: { required: false, type: String },
	previousEmployer2City: { required: false, type: String },
	previousEmployer2CountryStateTypeId: { required: false, type: Number },
	previousEmployer2Phone: { required: false, type: String },
	previousEmployer2SupervisorName: { required: false, type: String },
	previousEmployer2SupervisorTitle: { required: false, type: String },
	previousEmployer2Duties: { required: false, type: String },
	previousEmployer2LeavingReasons: { required: false, type: String },
	previousEmployer2StartingPay: { required: false, type: Number },
	previousEmployer2EndingPay: { required: false, type: Number },
	previousEmployer2StartDate: { required: false, type: Date },
	previousEmployer2EndDate: { required: false, type: Date },
	
	previousEmployer3MayWeContact: { required: false, type: Boolean },
	previousEmployer3CompanyName: { required: false, type: String },
	previousEmployer3Address: { required: false, type: String },
	previousEmployer3City: { required: false, type: String },
	previousEmployer3CountryStateTypeId: { required: false, type: Number },
	previousEmployer3Phone: { required: false, type: String },
	previousEmployer3SupervisorName: { required: false, type: String },
	previousEmployer3SupervisorTitle: { required: false, type: String },
	previousEmployer3Duties: { required: false, type: String },
	previousEmployer3LeavingReasons: { required: false, type: String },
	previousEmployer3StartingPay: { required: false, type: Number },
	previousEmployer3EndingPay: { required: false, type: Number },
	previousEmployer3StartDate: { required: false, type: Date },
	previousEmployer3EndDate: { required: false, type: Date },

	workHistoryConditionsThatLimitAbility: { required: false, type: Boolean },
	workHistoryConditionsHowCanWeAccommodate: { required: false, type: String },
	workHistoryUSLegal: { required: false, type: Boolean },
	workHistoryConvictedOfFelony: { required: false, type: Boolean },
	workHistoryConvictedOfFelonyReasons: { required: false, type: String },
	
    educationHistory1EducationLevelTypeId: { required: false, type: Number },
	educationHistory1Institution: { required: false, type: String },
	educationHistory1Major: { required: false, type: String },
	educationHistory1Minor: { required: false, type: String },
	educationHistory1CompletedDate: { required: false, type: Date },
	
    educationHistory2EducationLevelTypeId: { required: false, type: Number },
	educationHistory2Institution: { required: false, type: String },
	educationHistory2Major: { required: false, type: String },
	educationHistory2Minor: { required: false, type: String },
	educationHistory2CompletedDate: { required: false, type: Date },
	
    educationHistory3EducationLevelTypeId: { required: false, type: Number },
	educationHistory3Institution: { required: false, type: String },
	educationHistory3Major: { required: false, type: String },
	educationHistory3Minor: { required: false, type: String },
	educationHistory3CompletedDate: { required: false, type: Date },
	
    iCertifyStatement: { required: false, type: Boolean },
	keywordList: { required: false, type: String },
	rating: { required: false, type: Number },
	archived: { required: false, type: Boolean },
	
    atJobPostingId: { required: true, type: Number },
	
    esignName: { required: false, type: String },
	eSignStamptedDateTime: { required: false, type: Date },
	formMakeOffer: { required: false, type: String },
	isWorkflowOfferAccepted: { required: false, type: Boolean },
	isWorkflowOfferRejected: { required: false, type: Boolean },
	eSignNameOffer: { required: false, type: String },
	eSignStamptedDateTimeOffer: { required: false, type: Date },
	referralSource: { required: false, type: String },
	formRejectApplication: { required: false, type: String },
	isVetStatus_Disabled: { required: false, type: Boolean },
	isVetStatus_RecentlySeparated: { required: false, type: Boolean },
	isVetStatus_ActiveDutyWartime: { required: false, type: Boolean },
	isVetStatus_AFServiceMedal: { required: false, type: Boolean },
	vetStatus_DischargeDate: { required: false, type: Date },
	vetStatus_MilitaryReserve: { required: false, type: String },
	vetStatus_Veteran: { required: false, type: String },
	isVetStatus_VietnamEra: { required: false, type: Boolean },
	isVetStatus_Other: { required: false, type: Boolean },
	externalCandidateId: { required: false, type: Number },
	externalSystem: { required: false, type: String },
	gender: { required: false, type: String },
	applyDate: { required: false, type: Date },
	schemeId: { required: false, type: String },
	schemeAgencyId: { required: false, type: String },
	positionOpeningId: { required: false, type: Number },
	positionSchemeId: { required: false, type: String },
	positionAgencyId: { required: false, type: String },
	positionUri: { required: false, type: String },
	status: { required: false, type: String },
	statusCategory: { required: false, type: String },
	statusTransitionDateTime: { required: false, type: Date },
	educationLevelCode: { required: false, type: String },
	citizenship: { required: false, type: String },
	requestJSON: { required: false, type: String },
	dateAdded: { required: false, type: Date },
	profileId: { required: false, type: Number },

	previousEmployer1Title: { required: false, type: String },
	previousEmployer2Title: { required: false, type: String },
	previousEmployer3Title: { required: false, type: String }
};

export const createApplicationNoteValidationSchema = Yup.object().shape({
    atApplicationId: Yup.number().required('atApplicationId is required'),
    noteEntryDate: Yup.date().nullable(),
    noteEnteredByUsername: Yup.string().max(100, 'noteEnteredByUsername must be a maximum of 50 characters.').nullable(),
    note: Yup.string().nullable()
});

export const createApplicationNoteCheckPropertiesSchema = {
    atApplicationId: { required: true, type: Number },
    noteEntryDate: { required: false, type: Date },
    noteEnteredByUsername: { required: false, type: String },
    note: { required: false, type: String }
};
export const updateApplicationNoteValidationSchema = Yup.object().shape({
    id: Yup.number().required('id is required'),
    atApplicationId: Yup.number().required('atApplicationId is required'),
	noteEntryDate: Yup.date().nullable(),
    noteEnteredByUsername: Yup.string()
        .max(50, 'noteEnteredByUsername must be a maximum of 200 characters.')
        .nullable(),    
    note: Yup.string().nullable()
});

export const updateApplicationNoteCheckPropertiesSchema = {
    id: { required: true, type: Number },
    atApplicationId: { required: true, type: Number },
    noteEntryDate: { required: false, type: Date },
    noteEnteredByUsername: { required: false, type: String },
    note: { required: false, type: String }
};

export const createApplicationStatusHistoryValidationSchema = Yup.object().shape({
    atApplicationId: Yup.number().required('atApplicationId is required'),
    statusChangedDate: Yup.date().nullable(),
    statusChangedByUsername: Yup.string().required('statusChangedByUsername is required'),
    changedStatusTitle: Yup.string().required('changedStatusTitle is required')
});

export const createApplicationStatusHistoryCheckPropertiesSchema = {
    atApplicationId: { required: true, type: Number },
    statusChangedDate: { required: false, type: Date },
    statusChangedByUsername: { required: false, type: String },
    changedStatusTitle: { required: false, type: String }
};

export const updateApplicationStatusHistoryValidationSchema = Yup.object().shape({
	id: Yup.number().required('id is required'),
    atApplicationId: Yup.number().required('atApplicationId is required'),
    statusChangedDate: Yup.date().nullable(),
    statusChangedByUsername: Yup.string().required('statusChangedByUsername is required'),
    changedStatusTitle: Yup.string().required('changedStatusTitle is required')
});

export const updateApplicationStatusHistoryCheckPropertiesSchema = {
	id: { required: true, type: Number },
    atApplicationId: { required: true, type: Number },
    statusChangedDate: { required: false, type: Date },
    statusChangedByUsername: { required: false, type: String },
    changedStatusTitle: { required: false, type: String }
};

export const createQuestionBankGroupValidationSchema = Yup.object().shape({
    companyId: Yup.number().required('companyId is required'),
	groupName: Yup.string().required('groupName is required'),
});

export const createQuestionBankGroupCheckPropertiesSchema = {
    companyId: { required: true, type: Number },
	groupName: { required: true, type: String },
};

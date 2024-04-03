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

export const pathParametersForTenantIdAndCompanyIdAndIdSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    id: { required: true, type: String }
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
    atQuestionTypeId: Yup.number().required('atQuestionTypeId is required'),
    questionTitle: Yup.string()
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.'),
    questionText: Yup.string().nullable(),
    active: Yup.boolean().required('active is required'),
    sequence: Yup.number().required('sequence is required'),
    isRequired: Yup.boolean().required('isRequired is required'),
});

export const createQuestionBankCheckPropertiesSchema = {
    companyId: { required: true, type: Number },
    atQuestionTypeId: { required: true, type: Number },
    questionTitle: { required: true, type: String },
    questionText: { required: false, type: String },
    active: { required: true, type: Boolean },
    sequence: { required: true, type: Number },
    isRequired: { required: true, type: Boolean },
};

export const updateQuestionBankValidationSchema = Yup.object().shape({
    id: Yup.number().required('id is required'),
    companyId: Yup.number().required('companyId is required'),
    atQuestionTypeId: Yup.number().required('atQuestionTypeId is required'),
    questionTitle: Yup.string()
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.'),
    questionText: Yup.string().nullable(),
    active: Yup.boolean().required('active is required'),
    sequence: Yup.number().required('sequence is required'),
    isRequired: Yup.boolean().required('isRequired is required'),
});

export const updateQuestionBankCheckPropertiesSchema = {
    id: { required: true, type: Number },
    companyId: { required: true, type: Number },
    atQuestionTypeId: { required: true, type: Number },
    questionTitle: { required: true, type: String },
    questionText: { required: false, type: String },
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
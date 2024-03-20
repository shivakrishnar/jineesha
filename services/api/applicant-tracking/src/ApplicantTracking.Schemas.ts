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
        .required('questionTitle is required')
        .max(100, 'questionTitle must be a maximum of 100 characters.'),
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

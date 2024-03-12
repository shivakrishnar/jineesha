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

export const pathParametersForTenantIdAndIdSchema = {
    tenantId: { required: true, type: UUID },
    id: { required: true, type: String }
};

export const createQuestionBankValidationSchema = Yup.object().shape({
    companyId: Yup.number().required('companyId is required'),
    employeeId: Yup.number().nullable(),
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
    employeeId: { required: false, type: Number},
    atQuestionTypeId: { required: true, type: Number },
    questionTitle: { required: true, type: String },
    questionText: { required: false, type: String },
    active: { required: true, type: Boolean },
    sequence: { required: true, type: Number },
    isRequired: { required: true, type: Boolean },
};

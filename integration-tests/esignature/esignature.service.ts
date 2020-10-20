import * as utils from '../utils';

const configs = utils.getConfig();

export function getValidTemplateObject(): any {
    return {
        file: utils.base64EncodeFile('integration-tests/test-files/test.pdf'),
        fileName: 'test.pdf',
        signerRoles: ['OnboardingSignatory'],
        category: 'Onboarding',
        title: 'This is the title',
        message: 'This is the message',
    };
}

export function getValidBulkSignatureRequestObject(): any {
    return {
        templateId: configs.esignature.templateId,
        subject: 'This is a test request',
        message: 'This is a test request message',
        signatories: [
            {
                employeeCode: "445",
                role: 'OnboardingSignatory',
            },
        ],
    };
}

export function getValidSignatureRequestObject(): any {
    return {
        templateId: configs.esignature.templateId,
        subject: 'This is a signature request',
        message: 'This is a signature request message',
        role: 'OnboardingSignatory',
    };
}

export function getValidOnboardingObject(): any {
    return {
        onboardingKey: configs.esignature.onboardingKey,
        taskListId: configs.esignature.taskListId,
        emailAddress: 'cuong.lai@asuresoftware.com',
        name: 'Cuong Lai',
        employeeCode: '1234',
    };
}

export function getValidTemplateMetadataObject(): any {
    return {
        fileName: 'test.pdf',
        category: 'onboarding',
        title: 'Integration tests - This is the title',
    };
}

export function getValidEmployeeDocumentObject(): any {
    return {
        file: utils.uriEncodeTestFile('integration-tests/test-files/test.png'),
        fileName: 'Create employee document integration test.png',
        title: 'Create employee document integration test',
        isPrivate: false,
    };
}

export function getValidCompanyDocumentObject(): any {
    return {
        file: utils.uriEncodeTestFile('integration-tests/test-files/test.png'),
        fileName: 'Create company document integration test.png',
        title: 'Create company document integration test',
        category: 'Integration test category',
        isPublishedToEmployee: false,
    };
}

import { SignatoryRequest } from '../../src/signature-requests/signatory';
import {
    SignatureRequestResponse,
    SignatureRequestResponseStatus,
    SignatureStatus,
} from '../../src/signature-requests/signatureRequestResponse';

export const signatureId = '12345';
export const noSignDocId = '4a24ae38-f1d0-45c4-aada-ab49c0eebb2f';

export const helloSignSignUrl = {
    sign_url: 'signurl.com',
    expires_at: 12345,
};

export const signUrlResponse = {
    url: 'signurl.com',
    expiration: 12345,
    clientId: '1234',
};

export const helloSignSignatureRequest = {
    signature_request_id: '1234',
    title: 'Sig Request',
    is_complete: true,
    metadata: {
        employeeCodes: ['1'],
    },
    signatures: [
        {
            status_code: 'signed',
            signature_id: '1',
            signer_email_address: 'hugh@jass.com',
            signer_name: 'Hugh',
            signer_role: 'Employee',
        },
        // {
        //     status_code: 'awaiting_signature',
        //     signature_id: '2',
        //     signer_email_address: 'matt.yoga@gmail.com',
        //     signer_name: 'Matt',
        //     signer_role: 'Employee',
        // },
    ],
};

export const helloSignSignatureRequestsIdList = ['1234', '1235'];

export const helloSignSignatureRequests = [
    {
        signature_request_id: helloSignSignatureRequestsIdList[0],
        title: 'Sig Request',
        is_complete: true,
        signatures: [
            {
                status_code: 'signed',
                signature_id: '1',
                signer_email_address: 'hugh@jass.com',
                signer_name: 'Hugh',
                signer_role: 'Employee',
            },
            {
                status_code: 'test',
                signature_id: '2',
                signer_email_address: 'matt.yoga@gmail.com',
                signer_name: 'Matt',
                signer_role: 'Manager',
            },
        ],
    },
    {
        signature_request_id: helloSignSignatureRequestsIdList[1],
        title: 'Sig Request 2',
        is_complete: false,
        signatures: [
            {
                status_code: 'awaiting_signature',
                signature_id: '1',
                signer_email_address: 'mike@pizza.com',
                signer_name: 'Mike',
                signer_role: 'OnboardingSignatory',
            },
            {
                status_code: 'declined',
                signature_id: '2',
                signer_email_address: 'several@ponchos.com',
                signer_name: 'Several',
                signer_role: 'OnboardingSignatory',
            },
        ],
    },
];

export const bulkSignatureRequestRequestBody = {
    templateId: '12345',
    subject: 'Signature request subject',
    message: 'Signature request message',
    signatories: [
        new SignatoryRequest({
            employeeCode: '1',
            role: 'Employee',
        }),
        new SignatoryRequest({
            employeeCode: '2',
            role: 'Employee',
        }),
    ],
    isSimpleSign: false,
};

export const bulkSimpleSignatureRequestRequestBody = {
    templateId: 'X4j1Ta',
    subject: 'Signature request subject',
    message: 'Signature request message',
    signatories: [
        new SignatoryRequest({
            employeeCode: '1',
            role: 'Employee',
        }),
        new SignatoryRequest({
            employeeCode: '2',
            role: 'Employee',
        }),
    ],
    isSimpleSign: true,
};

export const allEmployeesBulkSignatureRequestRequestBody = {
    templateId: '12345',
    subject: 'Signature request subject',
    message: 'Signature request message',
    signatories: [
        new SignatoryRequest({
            employeeCode: 'all',
            role: 'Employee',
        }),
    ],
    isSimpleSign: false,
};

export const allEmployeesBulkSimpleSignatureRequestRequestBody = {
    templateId: 'X4j1Ta',
    subject: 'Signature request subject',
    message: 'Signature request message',
    signatories: [
        new SignatoryRequest({
            employeeCode: 'all',
            role: 'Employee',
        }),
    ],
    isSimpleSign: true,
};

export const signatureRequestResponse: SignatureRequestResponse = {
    id: '1234',
    signatures: [
        {
            id: '1',
            signer: {
                emailAddress: 'hugh@jass.com',
                name: 'Hugh',
                role: 'Employee',
            },
            status: SignatureStatus.Pending,
        },
    ],
    type: 'SignatureRequest',
    isHelloSignDocument: true,
    status: SignatureRequestResponseStatus.Pending,
    title: 'Sig Request',
};

export const signatureRequestsResponse: SignatureRequestResponse[] = [
    {
        id: '1234',
        title: 'Sig Request',
        status: SignatureRequestResponseStatus.Pending,
        type: 'SignatureRequest',
        isHelloSignDocument: true,
        signatures: [
            {
                id: '1',
                status: SignatureStatus.Pending,
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                    employeeCode: '1',
                },
            },
        ],
    },
];

export const someEmployeesSignatureRequestsResponse: SignatureRequestResponse[] = [
    {
        id: '1234',
        title: 'Sig Request',
        status: SignatureRequestResponseStatus.Pending,
        type: 'SignatureRequest',
        isHelloSignDocument: true,
        signatures: [
            {
                id: '1',
                status: SignatureStatus.Pending,
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                    employeeCode: '1',
                },
            },
        ],
    },
    {
        id: '1234',
        title: 'Sig Request',
        status: SignatureRequestResponseStatus.Pending,
        type: 'SignatureRequest',
        isHelloSignDocument: true,
        signatures: [
            {
                id: '1',
                status: SignatureStatus.Pending,
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                    employeeCode: '1',
                },
            },
        ],
    },
];

export const SimpleSignatureRequestsResponse: any[] = [
    {
        id: '1234',
        title: 'test',
        status: SignatureRequestResponseStatus.Pending,
        type: 'SignatureRequest',
        isHelloSignDocument: false,
        signatures: [
            {
                id: '',
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh Jass',
                    employeeCode: '1',
                },
            },
        ],
    },
];

export const signatureRequestRequestBody = {
    templateId: '12345',
    subject: 'Signature request subject',
    message: 'Signature request message',
    role: 'Employee',
    category: 'onboarding',
    employeeCode: '1',
};

export const signatureRequestQueryParams = {
    status: 'signed',
    consolidated: 'true',
};

export const signatureRequestDBResponse = {
    recordsets: [
        [
            [
                {
                    totalCount: 3,
                },
            ],
        ],
        [
            {
                Type: 'legacy',
                ID: 1,
                Filename: 'test.png',
                Title: 'Title',
                ESignDate: '10/17/2019',
                EmailAddress: 'employee@test.com',
                EmployeeCode: '1',
            },
            {
                Type: 'esignature',
                ID: 2,
            },
            {
                Type: 'esignature',
                ID: 3,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 3,
        },
    ],
    output: {},
    rowsAffected: [3],
};

export const signatureRequestListResponse = [
    {
        id: 1,
        filename: 'test.png',
        title: 'Title',
        eSignDate: '10/17/2019',
        emailAddress: 'employee@test.com',
        employeeCode: '1',
    },
    {
        id: '1234',
        title: 'Sig Request',
        status: 'Complete',
        signatures: [
            {
                id: '1',
                status: 'Complete',
                signer: {
                    emailAddress: 'hugh@jass.com',
                    name: 'Hugh',
                    role: 'Employee',
                },
            },
        ],
    },
];

export const esignatureMetadataDBResponse = {
    recordset: [
        {
            ID: 1,
            UploadDate: '1/1/2020',
            UploadedBy: 'Admin',
            Title: 'Test',
            Filename: 'test.png',
            Category: 'test',
            Type: 'SimpleSignatureRequest',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const esignatureSimpleSignMetadataDBResponse = {
    recordset: [
        {
            ID: 1,
            UploadDate: '1/1/2020',
            UploadedBy: 'Admin',
            Title: 'Test',
            Filename: 'test.png',
            Category: 'test',
            Type: 'SimpleSignatureRequest',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const esignatureEnhancedSignMetadataDBResponse = {
    recordset: [
        {
            ID: 1,
            UploadDate: '1/1/2020',
            UploadedBy: 'Admin',
            Title: 'Test',
            Filename: 'test.png',
            Category: 'test',
            Type: 'SignatureRequest',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const billableSignRequestDBResponse = {
    recordsets: [
        [
            {
                tenantID: '1234',
                company: 'HRN IT Services (0)',
                billableDocuments: 2,
                companyId: 600351,
                Metadata: null,
                BillingEventType: null
            },
            {
                tenantID: '1234',
                company: null,
                billableDocuments: 0,
                companyId: null,
                Metadata: JSON.stringify({
                    companyName: 'Company One',
                    companyCode: '1',
                    companyCreateDate: '2022-08-27 20:40:34.880',
                    allBillableSignRequests: 15,
                    nonOnboardingBillableSignRequests: 10,
                    esignatureStatus: 2,
                    existingEsignatureBillingEvents: true,
                }),
                BillingEventType: 'CompanyDeleted',
            },
            {
                tenantID: '1234',
                company: null,
                billableDocuments: 0,
                companyId: null,
                Metadata: JSON.stringify({
                    companyName: 'Company Two',
                    companyCode: '2',
                    companyCreateDate: '2019-08-27 20:40:34.880',
                    allBillableSignRequests: 7,
                    nonOnboardingBillableSignRequests: 5,
                    esignatureStatus: 2,
                    existingEsignatureBillingEvents: true,
                }),
                BillingEventType: 'CompanyDeleted',
            },
            {
                tenantID: '1234',
                company: null,
                billableDocuments: 0,
                companyId: null,
                Metadata: JSON.stringify({
                    companyName: 'Company Three',
                    companyCode: '3',
                    companyCreateDate: '2019-08-27 20:40:34.880',
                    allBillableSignRequests: 0,
                    nonOnboardingBillableSignRequests: 0,
                    esignatureStatus: 2,
                    existingEsignatureBillingEvents: true,
                }),
                BillingEventType: 'CompanyDeleted',
            },
            {
                tenantID: '1234',
                company: null,
                billableDocuments: 0,
                companyId: null,
                Metadata: JSON.stringify({
                    companyName: 'Company Four',
                    companyCode: '4',
                    companyCreateDate: '2019-08-27 20:40:34.880',
                    allBillableSignRequests: 0,
                    nonOnboardingBillableSignRequests: 0,
                    esignatureStatus: 1,
                    existingEsignatureBillingEvents: true,
                }),
                BillingEventType: 'CompanyDeleted',
            },
            {
                tenantID: '1234',
                company: null,
                billableDocuments: 0,
                companyId: null,
                Metadata: JSON.stringify({
                    companyName: 'Company Five',
                    companyCode: '5',
                    companyCreateDate: '2019-08-27 20:40:34.880',
                    allBillableSignRequests: 0,
                    nonOnboardingBillableSignRequests: 0,
                    esignatureStatus: 1,
                    existingEsignatureBillingEvents: false,
                }),
                BillingEventType: 'CompanyDeleted',
            },
        ],
    ],
    output: {},
    rowsAffected: [1],
};

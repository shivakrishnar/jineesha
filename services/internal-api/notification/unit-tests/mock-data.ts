import { EsignatureAction, IEsignatureEvent, IESignatureMetadata, NotificationEventType } from '../events';
import { someEmployeesSignatureRequestsResponse } from '../../../integrations/esignature/unit-tests/mock-data/signature-request-mock-data';

export const tenantId = '44c9d88e-8cfd-4bf3-854c-f65e26e21d69';
export const companyId = '600666';
export const employeeId = '12345';
export const documentId = 'd100bac1-b3c3-483a-b865-d9db980d47c9';
export const employeeCode = '999';
export const signInUrl = 'sign-in-url';

export const reminderEvent: IEsignatureEvent = {
    urlParameters: { tenantId, companyId, employeeId, documentId },
    invokerEmail: 'test@test.com',
    type: NotificationEventType.EsignatureEvent,
    actions: [EsignatureAction.EsignatureReminder],
    accessToken: 'blahblahblah',
    metadata: { employeeCode, signInUrl } as IESignatureMetadata,
};

export const requestEvent: IEsignatureEvent = {
    urlParameters: { tenantId, companyId },
    invokerEmail: 'test@test.com',
    type: NotificationEventType.EsignatureEvent,
    actions: [EsignatureAction.EsignatureRequest],
    accessToken: 'blahblahblah',
    metadata: { employeeCode, signInUrl, signatureRequests: someEmployeesSignatureRequestsResponse } as IESignatureMetadata,
};

export const deleteEvent: IEsignatureEvent = {
    urlParameters: { tenantId, companyId, employeeId, documentId },
    invokerEmail: 'test@test.com',
    type: NotificationEventType.EsignatureEvent,
    actions: [EsignatureAction.EsignatureDelete],
    accessToken: 'blahblahblah',
    metadata: { employeeCode } as IESignatureMetadata,
};

export const alertDBResponse = {
    recordset: [
        {
            companyId,
            IncludeEmployee: true,
            includeSupervisor1: true,
            includeSupervisor2: true,
            includeSupervisor3: true,
            emailBodyTemplate: 'test',
            emailSubjectTemplate: 'another string',
            recipientEmployeesIds: '456,789,123',
            recipientUsersIds: '461,462,463',
        },
    ],
};

export const esignatureMetadataDBResponse = {
    recordset: [
        {
            FirstName: 'John',
            CompanyName: 'RandoCorps',
            Title: 'RandoTitle',
            EmailAddress: 'RandoAddress',
        },
    ],
};

export const smtpCredentialsDBResponse = {
    recordset: [
        {
            SMTPServerHost: 'Serverhost',
            SMTPServerPort: 63312,
            SMTPUsername: 'user1',
            SMTPPassword: 'password',
            EmailSenderAddress: 'user1@randomdomain.com',
        },
    ],
};

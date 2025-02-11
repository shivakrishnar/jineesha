import { SignatureRequestResponse } from '../../integrations/esignature/src/signature-requests/signatureRequestResponse';

export interface INotificationEvent {
    urlParameters: { [i: string]: string };
    invokerEmail: string;
    type: NotificationEventType;
}

export enum NotificationEventType {
    DirectDepositEvent = 'DirectDepositEvent',
    EsignatureBatchEvent = 'EsignatureBatchEvent',
    BillingEvent = 'BillingEvent',
    EsignatureEvent = 'EsignatureEvent',
    EmployeeImport = 'EmployeeImportEvent'
}

export enum AlertCategory {
    DirectDeposit = 'Direct Deposit',
    Esignature = 'E-Signature',
}

export interface IDirectDepositEvent extends INotificationEvent {
    directDepositId: number;
    actions: DirectDepositAction[];
}

export enum DirectDepositAction {
    Submitted = 'Request Submitted',
    Approved = 'Request Approved',
    Rejected = 'Request Rejected',
    ApprovalRequest = 'New Request',
}

export interface IEsignatureEvent extends INotificationEvent {
    actions: EsignatureAction[];
    accessToken: string;
    metadata: IESignatureMetadata;
}

export interface IBillingEvent extends INotificationEvent {
    reportCsv: string;
    recipient?: string;
    additionalMessage?: string;
}

export interface IEmployeeImportEvent extends INotificationEvent {
    status: string;
    creationDate: string;
    recipient?: string;
    additionalMessage?: string;
}

export interface IESignatureMetadata {
    employeeCode?: string;
    signatureRequests?: SignatureRequestResponse[];
    signInUrl?: string;
}

export enum EsignatureAction {
    EsignatureReminder = 'E-Signature Reminder',
    EsignatureRequest = 'E-Signature Request',
    EsignatureDelete = 'E-Signature Cancelled',
}

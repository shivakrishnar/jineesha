export interface INotificationEvent {
    urlParameters: { [i: string]: string };
    invokerEmail: string;
    type: NotificationEventType;
}

export enum NotificationEventType {
    DirectDepositEvent = 'DirectDepositEvent',
}

export enum AlertCategory {
    DirectDeposit = 'Direct Deposit',
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

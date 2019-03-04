import { Signatory } from './signatory';

/**
 * @class SignatureRequest
 * @description A class representing an E-Signature Request with a dedicated template
 */
export class SignatureRequestResponse {
    id: string;
    title: string;
    status?: SignatureRequestResponseStatus;
    signatures: Signature[];

    public constructor(init?: Partial<SignatureRequestResponse>) {
        Object.assign(this, init);
    }
}

export enum SignatureRequestResponseStatus {
    Declined = 'Declined',
    Complete = 'Complete',
    Pending = 'Pending',
}

export enum SignatureStatus {
    Pending = 'Pending',
    Signed = 'Signed',
}

export type Signature = {
    id: string;
    status?: SignatureStatus;
    signer: Signatory;
    reminderDate?: Date;
    signedDate?: Date;
};

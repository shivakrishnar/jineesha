import { Signatory, SignatoryRequest } from './signatory';

/**
 * @class SignatureRequest
 * @description A class representing an E-Signature Request with a dedicated template
 */

export interface ISignatureRequest {
    templateId: string;

    subject?: string;

    message?: string;
}

export class BatchSignatureRequest implements ISignatureRequest {
    templateId: string;

    subject?: string;

    message?: string;

    signatories: SignatoryRequest[];

    public constructor(init?: Partial<BatchSignatureRequest>) {
        Object.assign(this, init);
    }
}

export class BulkSignatureRequest implements ISignatureRequest {
    templateId: string;

    subject?: string;

    message?: string;

    employeeCodes: string[];

    signatories: Signatory[];

    public constructor(init?: Partial<BulkSignatureRequest>) {
        Object.assign(this, init);
    }
}

export class SignatureRequest implements ISignatureRequest {
    templateId: string;

    subject?: string;

    message?: string;

    role: string;

    category: string;

    public constructor(init?: Partial<SignatureRequest>) {
        Object.assign(this, init);
    }
}

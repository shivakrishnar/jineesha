import { SignatureRequestResponse } from './signatureRequestResponse';

/**
 * @class SignatureRequestConsolidatedResponse
 * @description A class representing a Signature Request Conslidated Response
 */
export class SignatureRequestConsolidatedResponse {
    /**
     * @property {SignatureRequestResponse[]} requests
     * The collection of signatureRequests
     */
    requests: SignatureRequestResponse[];

    /**
     * @property {any[]} hrDocuments
     * The collection of ADHR documents
     */
    hrDocuments: any[];

    public constructor(init?: Partial<SignatureRequestConsolidatedResponse>) {
        Object.assign(this, init);
    }
}

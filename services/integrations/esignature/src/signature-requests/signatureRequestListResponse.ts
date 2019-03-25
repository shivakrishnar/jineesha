import { SignatureRequestResponse } from './signatureRequestResponse';

export class SignatureRequestListResponse {
    /**
     * @property {SignatureRequestResponse[]} results
     * The collection of signature requests
     */
    results: SignatureRequestResponse[];

    public constructor(init?: Partial<SignatureRequestListResponse>) {
        Object.assign(this, init);
    }
}

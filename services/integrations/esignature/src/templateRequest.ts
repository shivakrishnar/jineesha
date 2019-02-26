import { SignerRole } from './signerRole';

/**
 * @class TemplateRequest
 * @description A class representing a Template Request
 */
export class TemplateRequest {
    /**
     * @property {string} file
     * The base64 encoded string of the file
     */
    file: string;

    /**
     * @property {string} fileName
     * The name of the file
     */
    fileName: string;

    /**
     * @property {SignerRole[]} signerRoles
     * The collection of roles that are required to sign the document
     */
    signerRoles: SignerRole[];

    public constructor(init?: Partial<TemplateRequest>) {
        Object.assign(this, init);
    }
}

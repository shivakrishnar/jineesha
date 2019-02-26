/**
 * @class SignerRole
 * @description A class representing a Signer Role
 */
export class SignerRole {
    /**
     * @property {string} name
     * The name of the role
     */
    name: string;

    public constructor(init?: Partial<SignerRole>) {
        Object.assign(this, init);
    }
}

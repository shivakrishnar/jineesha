/**
 * @class Signatory
 * @description A class representing a signatory of a template.
 */
export class Signatory {
    emailAddress: string;

    name: string;

    role: string;

    public constructor(init?: Partial<Signatory>) {
        Object.assign(this, init);
    }
}

export type SignUrl = {
    url: string;
    expiration: number;
    clientId: string;
};

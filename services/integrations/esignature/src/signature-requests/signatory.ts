/**
 * @class Signatory
 * @description A class representing a signatory of a template.
 */
export class Signatory {
    emailAddress: string;

    name: string;

    role: string;

    employeeCode?: string;

    public constructor(init?: Partial<Signatory>) {
        Object.assign(this, init);
    }
}

export class SignatoryRequest {
    employeeCode: string;

    role: string;

    public constructor(init?: Partial<SignatoryRequest>) {
        Object.assign(this, init);
    }
}

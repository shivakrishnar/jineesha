export interface IUrl {
    url: string;
    expiration: number;
    clientId: string;
}

export class SignUrl implements IUrl {
    url: string;

    expiration: number;

    clientId: string;

    public constructor(init?: Partial<SignUrl>) {
        Object.assign(this, init);
    }
}

export class EditUrl implements IUrl {
    url: string;

    expiration: number;

    clientId: string;

    public constructor(init?: Partial<EditUrl>) {
        Object.assign(this, init);
    }
}

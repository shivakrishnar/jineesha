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
     * @property {string[]} signerRoles
     * The collection of roles that are required to sign the document
     */
    signerRoles: string[];

    /**
     * @property {string} category
     * The name of the category the document is in
     */
    category: string;

    /**
     * @property {string[]} ccRoles
     * The collection of roles or email addresses that will be CC'd on emails related to the template
     */
    ccRoles?: string[];

    /**
     * @property {ICustomField[]} customFields
     * The collection of custom fields associated with the template
     */
    customFields?: ICustomField[];

    /**
     * @property {string} title
     * The title the user specified when creating the template
     */
    title: string;

    /**
     * @property {string} message
     * The message the user specified when creating the template
     */
    message: string;

    public constructor(init?: Partial<TemplateRequest>) {
        Object.assign(this, init);
    }
}

/**
 * @class Role
 * @description A class representing a Role
 */
export class Role {
    /**
     * @property {string} name
     * The name of the role
     */
    name: string;

    public constructor(init?: Partial<Role>) {
        Object.assign(this, init);
    }
}

export interface ICustomField {
    name: string;
    type: string;
}

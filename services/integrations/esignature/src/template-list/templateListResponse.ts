import { ICustomField, Role } from '../template-draft/templateRequest';

/**
 * @class TemplateListResponse
 * @description A class representing a Template List Response
 */
export class TemplateListResponse {
    /**
     * @property {Template[]} results
     * The collection of templates
     */
    results: Template[];

    public constructor(init?: Partial<TemplateListResponse>) {
        Object.assign(this, init);
    }
}

/**
 * @class Template
 * @description A class representing a Template
 */
export class Template {
    /**
     * @property {string} id
     * The unique identifier for the template object
     */
    id: string;

    /**
     * @property {string} title
     * The title of the template
     */
    title: string;

    /**
     * @property {string} message
     * The message associated with the template
     */
    message: string;

    /**
     * @property {boolean} editable
     * Determines whether or not the template is editable
     */
    editable: boolean;

    /**
     * @property {boolean} isLockedj
     * Determines whether or not the template is locked
     */
    isLocked: boolean;

    /**
     * @property {Role[]} signerRoles
     * The collection of roles that are required to sign the template
     */
    signerRoles: Role[];

    /**
     * @property {Role[]} ccRoles
     * The collection of roles or email addresses that will be CC'd on emails related to the template
     */
    ccRoles?: Role[];

    /**
     * @property {ICustomField[]} customFields
     * The collection of custom fields that are associated with the template
     */
    customFields?: ICustomField[];

    /**
     * @property {string} filename
     * The name of the file associated with the template
     */
    filename: string;

    /**
     * @property {string} uploadDate
     * The date that the template was uploaded
     */
    uploadDate: string;

    /**
     * @property {string} uploadedBy
     * The name of the user that uploaded the template
     */
    uploadedBy: string;

    /**
     * @property {boolean} isLegacyDocument
     * Determines if the document is a legacy HR document
     */
    isLegacyDocument?: boolean;

    /**
     * @property {string} category
     * Determines if the document is a legacy HR document
     */
    category: string;

    public constructor(init?: Partial<Template>) {
        Object.assign(this, init);
    }
}

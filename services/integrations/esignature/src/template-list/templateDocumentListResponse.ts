import { Template } from './templateListResponse';

/**
 * @class TemplateListResponse
 * @description A class representing a Template List Response
 */
export class TemplateDocumentListResponse {
    /**
     * @property {Template[]} templates
     * The collection of templates
     */
    templates: Template[];

    /**
     * @property {any[]} hrDocuments
     * The collection of templates
     */
    hrDocuments: any[];

    public constructor(init?: Partial<TemplateDocumentListResponse>) {
        Object.assign(this, init);
    }
}

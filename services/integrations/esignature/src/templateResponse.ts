/**
 * @class TemplateResponse
 * @description A class representing a Template Response
 */
export class TemplateResponse {
    /**
     * @property {string} clientId
     * The unique identifier for the HelloSign application
     */
    clientId: string;

    /**
     * @property {Template} template
     * The default response from the HelloSign transaction
     */
    template: Template;

    public constructor(init?: Partial<TemplateResponse>) {
        Object.assign(this, init);
    }
}

export type Template = {
    id: string;
    editUrl: string;
    expiration: string;
};

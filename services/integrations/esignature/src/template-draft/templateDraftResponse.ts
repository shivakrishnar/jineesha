/**
 * @class TemplateDraftResponse
 * @description A class representing a Template Draft Response
 */
export class TemplateDraftResponse {
    /**
     * @property {string} clientId
     * The unique identifier for the HelloSign application
     */
    clientId: string;

    /**
     * @property {TemplateDraft} template
     * The default response from the HelloSign transaction
     */
    template: TemplateDraft;

    public constructor(init?: Partial<TemplateDraftResponse>) {
        Object.assign(this, init);
    }
}

export type TemplateDraft = {
    id: string;
    editUrl: string;
    expiration: string;
};

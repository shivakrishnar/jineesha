export type DocumentMetadata = {
    id: string;
    filename: string;
    title: string | undefined;
    description: string | undefined;
    type: string | undefined;
};

export class DocumentMetadataListResponse {
    /**
     * @property {DocumentMetadata[]} results
     * The collection of DocumentMetadata
     */
    results: DocumentMetadata[];

    public constructor(init?: Partial<DocumentMetadataListResponse>) {
        Object.assign(this, init);
    }
}

/**
 * @class DocumentCategory
 */
export class DocumentCategory {
    /**
     * @property {string} value: The value that should be used to represent the category in the database
     */
    value: string;
    /**
     * @property {string} label: The label that should be used to represent the category to the user
     */
    label: string;
}

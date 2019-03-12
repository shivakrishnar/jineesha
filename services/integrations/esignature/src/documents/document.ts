export type DocumentMetadata = {
    id: string;
    filename: string;
    title: string | undefined;
    description: string | undefined;
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

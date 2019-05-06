export type PaginationData = {
    page: number;
    baseUrl: string;
};

export class PaginatedResult {
    /**
     * @property {number} count
     * The number of items returned in the results property.
     */
    count: number;

    /**
     * @property {number} limit
     * The limit used to determine how many records are returned.
     */
    limit: number;

    /**
     * @property {string} previous
     * URL that will return the previous set of paginated results.
     */
    previous: string;

    /**
     * @property {string} next
     * URL that will return the next set of paginated results.
     */
    next: string;

    /**
     * @property {string} first
     * URL that will return the first set of paginated results.
     */
    first: string;

    /**
     * @property {string} last
     * URL that will return the last set of paginated results.
     */
    last: string;

    results: any[];

    public constructor(
        limit: number,
        results: any,
        baseUrl: string,
        previousPageToken?: any,
        nextPageToken?: any,
        firstPageToken?: any,
        lastPageToken?: any,
    ) {
        this.limit = limit;
        this.count = results.length;

        if (previousPageToken) {
            this.setLink(baseUrl, previousPageToken, 'previous');
        }
        if (nextPageToken) {
            this.setLink(baseUrl, nextPageToken, 'next');
        }
        if (firstPageToken) {
            this.setLink(baseUrl, firstPageToken, 'first');
        }
        if (lastPageToken) {
            this.setLink(baseUrl, lastPageToken, 'last');
        }

        this.results = results;
    }

    public setLink(baseUrl: string, pageToken: any, property: string): PaginatedResult {
        const character = baseUrl.includes('?') ? '&' : '?';
        this[property] = `${baseUrl}${character}pageToken=${this.encodeKey(pageToken)}`;
        return this;
    }

    public encodeKey(pageToken: any): string {
        return Buffer.from(`${pageToken.pageNumber}`).toString('base64');
    }
}

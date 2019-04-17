export type ConnectionString = {
    rdsEndpoint: string;
    databaseName: string;
};

export type DatabaseEvent = {
    tenantId: string;
    queryName: string;
    query: string;
    queryType: QueryType;
};

export enum QueryType {
    Simple = 'simple',
    Batched = 'batched',
}

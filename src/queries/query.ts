
/**
 * @interface IQuery
 * @description An interface for classes representing a query
 */
export interface IQuery {

  /**
   * @property {string} name
   * The name of the query
   */
  name: string;

  /**
   * @property {string} value
   * The string representation of the query
   */
  value: string;
}

/**
 * @class Query
 * @description A class representing a SQL query
 */
export class Query implements IQuery {

  public constructor(protected _name: string, protected _query: string) {}

  public get name(): string {
    return this._name;
  }

  public get value(): string {
    return this._query;
  }
}
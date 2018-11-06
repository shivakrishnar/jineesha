import { Query } from './query';

/**
 * @class ParameterizedQuery
 * @description A class representing a SQL query with at least an unset variable
 */
export class ParameterizedQuery extends Query {
  public constructor(name: string, query: string) {
    super(name, query);
  }

  /**
   * Sets a SQL parameter to a desired value
   * @param {string} name The identifier of the parameter
   * @param {string} value The parameter's valiue
   */
  public setParameter(name: string, value: string): void {
    this._query = this._query.replace(name, value);
  }
}
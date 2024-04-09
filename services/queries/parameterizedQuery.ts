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
     * @param {any} name The identifier of the parameter
     * @param {string} value The parameter's value
     */
    public setParameter(name: any, value: any): void {
        this._query = this._query.replace(name, value);
    }

    /**
     * Sets an SQL parameter to a desired value after sanitizing the string
     * @param {any} name The identifier of the parameter
     * @param {string} value The parameter's value
     */
    public setStringParameter(name: any, value: string): void {
        if (this._query.search(`'${name}'`) >= 0) {
            // If the string is quoted in the query we'll assume all quotes are intentional
            value = value.replace(/'/g, "''");
        } else {
            // If it's not, we assume a pair of starting and ending quotes are syntax not data and avoid escaping them
            const quotedString = /^'.*'$/;
            if (quotedString.test(value)) {
                value = `'${value.substr(1, value.length - 2).replace(/'/g, "''")}'`;
            } else {
                // If we don't have those quotes at all, they still need to be added for syntax
                value = `'${value.replace(/'/g, "''")}'`;
            }
        }
        this.setParameter(name, value);
    }

    /**
     * Sets a SQL parameter to a boolean representation
     * @param {any} name The identifier of the parameter
     * @param {boolean} value The parameter's value
     */
    public setBooleanParameter(name: any, value: boolean): void {
        const valueResult = value ? '1' : '0';
        this.setParameter(name, valueResult);
    }

    /**
     * Sets an SQL parameter to a desired value after sanitizing the string
     * @param {any} name The identifier of the parameter
     * @param {string} value The parameter's value
     */
    public setStringOrNullParameter(name: any, value: string): void {
        if (!value || value.toUpperCase() === 'NULL') {
            this.setParameter(name, 'NULL');
        } else {
            this.setStringParameter(name, value);
        }
    }

    /**
     * Sets an SQL parameter to a desired value after sanitizing the string
     * @param {any} name The identifier of the parameter
     * @param {string} value The parameter's value
     */
    public setIntegerOrNullParameter(name: any, value: number): void {
        if (!value || Number.isNaN(value)) {
            this.setParameter(name, 'NULL');
        } else {
            this.setParameter(name, value);
        }
    }
}

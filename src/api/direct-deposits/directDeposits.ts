import { DirectDeposit } from './directDeposit';

/**
 * @class DirectDeposits
 * @description A class representing a collection of Direct Deposits
 */
export class DirectDeposits {
  /**
   * @property {DirectDeposit[]} results
   * The collection of Direct Deposits
   */
  results: DirectDeposit[];

  public constructor(directDeposits: DirectDeposit[]) {
    this.results = directDeposits;
  }
}
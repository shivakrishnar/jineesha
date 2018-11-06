import { BankAccount } from '../../models/BankAccount';

/**
 * @class DirectDeposit
 * @description A class representing a Direct Deposit
 */
export class DirectDeposit {

  /**
   * @property {number} id
   * The unique identifier for the direct deposit
   */
  id: number;

  /**
   * @property {number} amount
   * The amount to be entered into the designated bank account
   */
  amount: number;

  /**
   * @property {BankAccount} bankAccount
   * The bank account the designated amount is to be deposited in
   */
  bankAccount: BankAccount;

  /**
   * @property {string} amountType
   * The classification of the direct deposit amount
   */
  amountType: string;

  /**
   * @property {number} status
   * The status of the direct deposit
   */
  status: string;

  public constructor(init?: Partial<DirectDeposit>) {
    Object.assign(this, init);
  }
}
/**
 * @class BankAccount
 *
 * @description
 *
 * Encapsulates a BankAccount resource.
 *
 * @author Mojo Jojo
 */
export class BankAccount {

  routingNumber: string;
  accountNumber: string;
  designation: string;

  public constructor(init?: Partial<BankAccount>) {
    Object.assign(this, init);
  }
}
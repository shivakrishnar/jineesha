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

    /**
     * Obfuscates every digit in the account number except the last four
     */
    public obfuscate(): void {
        const accountNumber = this.bankAccount.accountNumber;
        const cleanAccountNumber = accountNumber.charAt(0) === '#' ? accountNumber.substring(1) : accountNumber;
        if (cleanAccountNumber.length >= 7) {
            const subString1 = cleanAccountNumber.slice(0, -4);
            const subString2 = cleanAccountNumber.slice(-4);
            this.bankAccount.accountNumber = `${subString1.replace(/./g, '*')}${subString2}`;
        } else {
            this.bankAccount.accountNumber = cleanAccountNumber.replace(/./g, '*');
        }
    }
}

export interface IBetaFlag  {
    id: number;
    companyId?: number;
    isOn: boolean;
    code: string;
}
/**
 * EmailMessage models the email that is sent for Alert notifications
 *
 * @class EmailMessage
 * @constructor
 */
export class EmailMessage {
    /**
     * @property {string []} recipients
     * The email address list
     */

    /**
     * @property {string} subject
     * The subject line of the email.
     */

    /**
     * @property {string} from
     * The email address the email is from.
     */

    /**
     * @property {string} body
     * The email body
     */

    public constructor(public subject: string, public body: string, public from: string, public recipients: string[]) {}

    public populateTemplate(): string {
        return this.body;
    }
}

import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as configService from '../../config.service';
import * as ssoService from '../../remote-services/sso.service';
import * as utilService from '../../util.service';

import { IPayrollApiCredentials } from '../../api/models/IPayrollApiCredentials';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { Queries } from '../../queries/queries';
import { InvocationType } from '../../util.service';
import { DatabaseEvent, QueryType } from '../database/events';
import { EmailMessage } from './emailMessage';
import { Attachment } from './attachment';
import {
    AlertCategory,
    DirectDepositAction,
    IDirectDepositEvent,
    IEsignatureEvent,
    INotificationEvent,
    IBillingEvent,
    NotificationEventType,
} from './events';
import { IDirectDepositMetadataKeys } from './metadata-keys/IDirectDepositMetadataKeys';
import { IESignatureMetadataKeys } from './metadata-keys/IESignatureMetadataKeys';

type Alert = {
    companyId: number;
    includeEmployee: boolean;
    includeSupervisor1: boolean;
    includeSupervisor2: boolean;
    includeSupervisor3: boolean;
    emailSubjectTemplate: string;
    emailBodyTemplate: string;
    recipientEmployeesIds: number[] | undefined;
    recipientUsersIds: number[] | undefined;
};

/**
 *  Routes and executes the notification event based on its type
 * @param {INotificationEvent} event: The request notification event
 * @return {boolean}: true if a notification event is successfully dispatched; false, otherwise.
 */
export async function processEvent(event: INotificationEvent): Promise<boolean> {
    console.info('notification.service.processEvent');

    try {
        switch (event.type) {
            case NotificationEventType.DirectDepositEvent:
                await submitDirectDepositEventNotification(event as IDirectDepositEvent);
                return true;
            case NotificationEventType.EsignatureEvent:
                await submitEsignatureEventNotification(event as IEsignatureEvent);
                return true;
            case NotificationEventType.BillingEvent:
                await submitBillingEventNotification(event as IBillingEvent);
            default:
                return false;
        }
    } catch (error) {
        console.error(`error processing ${event.type}: ${JSON.stringify(error)}`);
        return false;
    }
}

/**
 * Handles and sends alerts for Direct Deposit-based events
 * @param {IDirectDepositEvent} event
 */
async function submitDirectDepositEventNotification(event: IDirectDepositEvent): Promise<void> {
    console.info('notification.service.submitDirectDepositNotification');

    const { tenantId, companyId } = event.urlParameters;

    const metadataKeys: IDirectDepositMetadataKeys = await getDirectDepositMetadata(tenantId, event.directDepositId);
    if (metadataKeys === undefined) {
        return;
    }

    for (const action of event.actions) {
        const alert: Alert = await getAlertByCategoryAndAction(tenantId, companyId, AlertCategory.DirectDeposit, action);
        if (alert === undefined) {
            continue;
        }

        const recipients: string[] = await getAlertRecipients(tenantId, event.directDepositId, alert);
        const emailMessage = new EmailMessage(
            applyMetadata(metadataKeys, alert.emailSubjectTemplate),
            applyMetadata(metadataKeys, alert.emailBodyTemplate),
            configService.getFromEmailAddress(),
            recipients,
        );

        await sendEmail(tenantId, emailMessage);

        switch (action) {
            case DirectDepositAction.ApprovalRequest:
                console.log('direct deposit approval request sent');
                break;

            case DirectDepositAction.Submitted:
                console.log('direct deposit submitted for approval');
                break;

            case DirectDepositAction.Rejected:
                console.log('direct deposit rejected');
                break;

            case DirectDepositAction.Approved:
                console.log('direct deposit approved');
                break;

            default: // Added per TSLint rules.
        }
    }
}

/*
 * Handles and sends alerts for E-Signature events
 * @param {IEsignatureEvent} event
 */
async function submitEsignatureEventNotification(event: IEsignatureEvent): Promise<void> {
    console.info('notification.service.submitEsignatureEventNotification');

    const { tenantId, companyId } = event.urlParameters;

    for (const action of event.actions) {
        // TODO: get alert from database
        // const alert: Alert = await getAlertByCategoryAndAction(tenantId, companyId, AlertCategory.Esignature, action);
        // if (alert === undefined) {
        //     continue;
        // }
        const alert: any = {
            emailSubjectTemplate: `[COMPANYNAME] - Action Required - Sign [DOCUMENTNAME]`,
            emailBodyTemplate: `
                <html xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap" rel="stylesheet">
                        <title>E-Signature Action Required</title>
                    </head>
                    <body style="font-family: 'Roboto', sans-serif;">
                        <div style="background-color: White; padding: 10px;">
                            <div style="margin-bottom: 10px;"><b>[COMPANYNAME]</b></div>
                            <br/>
                            <div style="margin-bottom: 10px;">Hi [NAME],</div>
                            <br/>
                            <div style="margin-bottom: 10px;">A new document needs your signature. Please review and sign "[DOCUMENTNAME]" in your employee portal.</div>
                            <br/>
                        </div>
                        <br/><br/>
                    </body>
                </html>
            `,
        };

        const invocations: Array<Promise<any>> = [];
        const emailMessages: EmailMessage[] = [];
        for (const request of event.metadata.signatureRequests) {
            for (const signature of request.signatures) {
                const emailAction = async () => {
                    const esignatureMetadata = await getEsignatureMetadata(tenantId, companyId, signature.signer.employeeCode, request.id);
                    const metadata: IESignatureMetadataKeys = {
                        documentName: esignatureMetadata.title,
                        companyName: esignatureMetadata.companyName,
                        name: esignatureMetadata.firstName,
                    };
                    const emailMessage = new EmailMessage(
                        applyMetadata(metadata, alert.emailSubjectTemplate),
                        applyMetadata(metadata, alert.emailBodyTemplate),
                        configService.getFromEmailAddress(),
                        [signature.signer.emailAddress],
                    );
                    sendEmail(tenantId, emailMessage);
                    emailMessages.push(emailMessage);
                };
                invocations.push(emailAction());
            }
        }

        await Promise.all(invocations);
        await createEmailRecordListEntries(tenantId, companyId, emailMessages, event.accessToken);

        console.log(action, 'Esignature request sent');
    }
}

async function submitBillingEventNotification(event: IBillingEvent): Promise<void> {
    console.info('notification.service.submitBillingEventNotification');
    const today = new Date();
    const yearMonth = `${today.getUTCFullYear()}_${today.getMonth()}`;
    today.setMonth(today.getMonth() - 1);
    const month = today.toLocaleString('default', { month: 'long' });
    const message =
        'See Attached For Billing Report' + event.additionalMessage ? `additional message info: ${event.additionalMessage}` : '';
    const emailMessage = new EmailMessage(`${month} Esignature Billing Report`, message, configService.getFromEmailAddress(), [
        event.recipient || configService.getBillingRecipient(),
    ]);
    const sesCredentials: SesSmtpCredentials = JSON.parse(await utilService.getSecret(configService.getSesSmtpCredentials()));
    if (!sesCredentials) {
        return;
    }

    const smtpCredentials = {
        host: configService.getSesSmtpServerHost(),
        port: Number(configService.getSesSmtpServerPort()),
        username: sesCredentials.username,
        password: sesCredentials.password,
        senderEmailAddress: configService.getFromEmailAddress(),
    };

    const attachment: Attachment = new Attachment({ filename: `${yearMonth}_Esign_Billing_Report.csv`, content: event.reportCsv });

    return await sendSmtpHtmlEmail(emailMessage, smtpCredentials, [attachment]);
}

/**
 * Retrieves an alert based on a specified category and action
 * @param {string} tenantId: The unique identifier for a tenant
 * @param {string} companyId: The unique numeric identifier for a company within a tenant
 * @param {AlertCategory} alertCategory: The alert category.
 * @param {AlertAction} action: The action associated with the alert
 * @returns {Alert}: The alert associated with the category and action
 */
async function getAlertByCategoryAndAction(
    tenantId: string,
    companyId: string,
    alertCategory: AlertCategory,
    action: unknown,
): Promise<Alert | undefined> {
    console.info('notification.service.getAlertByCategoryAndAction');

    try {
        const query = new ParameterizedQuery('listAlerts', Queries.alertEventList);
        query.setParameter('@companyId', companyId);
        query.setParameter('@action', `'${action}'`);
        query.setParameter('@alertCategoryType', `'${alertCategory}'`);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const alerts: Alert[] = (result.recordset || []).map((entry) => {
            // Setting a default value of -1 allows us to run the listAlertRecipients
            // query without an undefined value for the following variables
            let recipientEmployeesIds = [-1];
            let recipientUsersIds = [-1];

            // convert to array of numbers
            if (entry.recipientEmployeesIds) {
                recipientEmployeesIds = entry.recipientEmployeesIds
                    .split(',')
                    .map(Number)
                    .filter(Boolean);
            }

            if (entry.recipientUsersIds) {
                recipientUsersIds = entry.recipientUsersIds
                    .split(',')
                    .map(Number)
                    .filter(Boolean);
            }

            return {
                companyId: entry.companyId,
                includeEmployee: entry.IncludeEmployee,
                includeSupervisor1: entry.includeSupervisor1,
                includeSupervisor2: entry.includeSupervisor2,
                includeSupervisor3: entry.includeSupervisor3,
                emailSubjectTemplate: entry.emailSubjectTemplate,
                emailBodyTemplate: entry.emailBodyTemplate,
                recipientEmployeesIds,
                recipientUsersIds,
            };
        });

        return alerts ? alerts[0] : undefined;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Retrieves a listing of all email recipients for associated with an alert
 * @param {string} tenantId: The unique identifier for a tenant
 * @param {number} directDepositId: A unique identifier for a direct deposit
 * @param {Alert} alert: The alert
 * @returns {Promise<string[]>}: A promise of an array alert's recipients' email addresses
 */
async function getAlertRecipients(tenantId: string, directDepositId: number, alert: Alert): Promise<string[]> {
    console.info('notification.service.getAlertRecipients');

    try {
        const query = new ParameterizedQuery('listAlertRecipients', Queries.listAlertRecipients);
        query.setParameter('@includeDirectDepositOwnerEmail', Number(alert.includeEmployee));
        query.setParameter('@includeFirstMgr', Number(alert.includeSupervisor1));
        query.setParameter('@includeSecondMgr', Number(alert.includeSupervisor2));
        query.setParameter('@includeThirdMgr', Number(alert.includeSupervisor3));
        query.setParameter('@recipientEmployeeIds', alert.recipientEmployeesIds.join(','));
        query.setParameter('@recipientUserIds', alert.recipientUsersIds.join(','));
        query.setParameter('@directDepositId', directDepositId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        return (result.recordset || []).map((entry) => {
            return entry.EmailAddress;
        });
    } catch (error) {
        console.error(error);
    }
}

type SmtpCredentials = {
    host: string;
    port: number;
    username: string;
    password: string;
    senderEmailAddress: string;
};

type SesSmtpCredentials = {
    username: string;
    password: string;
};

/**
 * Sends an email message for a specific tenant with a given message
 * @param {string} tenantId: The unique identifier for a tenant
 * @param {EmailMessage} emailMessage: The message to be sent
 */
async function sendEmail(tenantId: string, emailMessage: EmailMessage): Promise<void> {
    console.info('notification.service.sendEmail');
    let smtpCredentials: SmtpCredentials = await getSmtpCredentials(tenantId);
    if (smtpCredentials) {
        return await sendSmtpHtmlEmail(emailMessage, smtpCredentials);
    }

    // default to SES for sending emails
    const sesCredentials: SesSmtpCredentials = JSON.parse(await utilService.getSecret(configService.getSesSmtpCredentials()));
    if (!sesCredentials) {
        return;
    }

    smtpCredentials = {
        host: configService.getSesSmtpServerHost(),
        port: Number(configService.getSesSmtpServerPort()),
        username: sesCredentials.username,
        password: sesCredentials.password,
        senderEmailAddress: configService.getFromEmailAddress(),
    };

    return await sendSmtpHtmlEmail(emailMessage, smtpCredentials);
}

/**
 * Sends an HTML-based email message using via SMTP
 * @param {EmailMessage} emailMessage: The message to be sent
 * @param {SmtpCredentials} smtpCredentials: The SMTP credentials
 */
async function sendSmtpHtmlEmail(message: EmailMessage, smtpCredentials: SmtpCredentials, attachments: Attachment[] = []): Promise<void> {
    console.info('notification.service.sendSmtpHtmlEmail');
    const unTypedAttachments: any = attachments; //sendMail requrires the nodemailer.Mail.Attachment interface, but doesn't expose it, so we un-type this
    const transporter = nodemailer.createTransport({
        host: smtpCredentials.host,
        port: smtpCredentials.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: smtpCredentials.username,
            pass: smtpCredentials.password,
        },
    });

    const mail = {
        from: smtpCredentials.senderEmailAddress,
        to: message.recipients.join(','),
        subject: message.subject,
        html: message.populateTemplate(),
        attachments: unTypedAttachments,
    };

    await transporter.sendMail(mail);
}

/**
 * Retrieves the SMTP credentials for a given tenant. Defaults to
 * SES SMTP settings if none are available.
 * @param {string} tenantId: The unique identifier for a tenant
 * @return {Promise<SmtpCredentials>}: a Promise of the SMTP credentials
 */
async function getSmtpCredentials(tenantId: string): Promise<SmtpCredentials | undefined> {
    console.info('notification.service.getSmtpCredentials');

    try {
        const query = new ParameterizedQuery('smtpCredentials', Queries.smtpCredentials);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const smtpCredentials: SmtpCredentials[] = (result.recordset || []).map((entry) => {
            /**
             * Note: The use of the username as the password here is intentional.
             * asure.gremlins web application salts the password with a dedicated
             * .Net crytographic algorithm - Rijndael with Rfc2898DerivedBytes. As there is
             * no equivalent library for Node, decrypting the password becomes nigh impossible.
             * Tenants have historically used PostMark for email sending and since that service
             * uses the same token as both the username and password for its SMTP credentials,
             * the reasoning therefore is to default to that.
             *
             */
            return {
                host: entry.SMTPServerHost,
                port: entry.SMTPServerPort,
                username: entry.SMTPUsername,
                password: entry.SMTPUsername,
                senderEmailAddress: entry.EmailSenderAddress,
            };
        });

        return smtpCredentials ? smtpCredentials[0] : undefined;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Retrieves a listing of direct deposit metadata for use in populating
 * Direct Deposit-based email templates.
 * @param {string} tenantId: The unique identifier for a tenant
 * @param {number} directDepositId: A unique identifier for a direct deposit
 * @return {Promise<IDirectDepositMetadataKeys>}: a Promise of Direct Deposit metadata
 */
async function getDirectDepositMetadata(tenantId: string, directDepositId: number): Promise<IDirectDepositMetadataKeys | undefined> {
    console.info('notification.service.getDirectDepositMetadata');

    try {
        const directDepositPageLinkUrlSuffix: string = 'Secure/Employee/EmployeeDirectDepositList.aspx?menu=ESS';

        const query = new ParameterizedQuery('directDepositMetadata', Queries.directDepositMetadata);
        query.setParameter('@directDepositId', directDepositId);

        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const keys: IDirectDepositMetadataKeys[] = (result.recordset || []).map((entry) => {
            return {
                firstName: entry.FirstName,
                lastName: entry.LastName,
                address1: entry.Address,
                city: entry.City,
                zip: entry.Zip,
                email: entry.Email,
                phoneHome: entry.PhoneHome,
                phoneCell: entry.PhoneCell,
                companyName: entry.CompanyName,
                displayName: entry.DisplayName,
                hireDate: utilService.formatDateToLocale(entry.HireDate),
                termDate: utilService.formatDateToLocale(entry.TermDate),
                directDepositStartDate: utilService.formatDateToLocale(entry.DirectDepositStartDate),
                directDepositEndDate: utilService.formatDateToLocale(entry.DirectDepositEndDate),
                directDepositAccount: entry.DirectDepositAccount,
                directDepositRouting: entry.DirectDepositRouting,
                directDepositAmountCode: entry.DirectDepositAmountCode,
                directDepositAmount: entry.DirectDepositAmount,
                directDepositAccountType: entry.DirectDepositAccountType,
                directDepositStatus: entry.DirectDepositStatus,
                directDepositNameOnAccount: entry.DirectDepositNameOnAccount,
                pageLink: `${(entry.MatchingURLs as string).split(';')[0]}/${directDepositPageLinkUrlSuffix}`,
            };
        });

        return keys ? keys[0] : undefined;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Retrieves a listing of e-signature metadata for use in populating
 * E-Signature-based email templates.
 * @param {string} tenantId: The unique identifier for a tenant
 * @param {string} companyId: The unique identifier for a company
 * @param {string} employeeCode: The code associated with the employee
 * @param {string} esignatureMetadataId: The unique identifier for the e-signature metadata record
 * @return {Promise<any>}: a Promise of the tenant's base URL
 */
async function getEsignatureMetadata(
    tenantId: string,
    companyId: string,
    employeeCode: string,
    esignatureMetadataId: string,
): Promise<any> {
    console.info('notification.service.getEsignatureMetadata');

    try {
        const query = new ParameterizedQuery('esignatureMetadata', Queries.esignatureMetadata);
        query.setParameter('@companyId', companyId);
        query.setParameter('@employeeCode', employeeCode);
        query.setParameter('@esignatureMetadataId', esignatureMetadataId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        return (result.recordset || []).map((record) => ({
            firstName: record.FirstName,
            companyName: record.CompanyName,
            title: record.Title,
        }))[0];
    } catch (error) {
        console.error(error);
    }
}

/**
 * Creates entries into the Email Record List table
 * @param {string} tenantId: The unique identifier for a tenant
 * @param {string} companyId: The unique identifier for a company
 * @param {EmailMessage[]} emails: A collection of email message objects
 * @param {string} accessToken: The access token of the invoking user
 */
async function createEmailRecordListEntries(
    tenantId: string,
    companyId: string,
    emails: EmailMessage[],
    accessToken: string,
): Promise<void> {
    console.info('notification.service.createEmailRecordListEntries');

    try {
        const emailQuery = new ParameterizedQuery('createEmailRecordListEntry', '');
        for (const email of emails) {
            const query = new ParameterizedQuery('createEmailRecordListEntry', Queries.createEmailRecordListEntry);
            query.setParameter('@companyId', companyId);
            query.setParameter('@originAddress', 'Service Account');
            query.setStringParameter('@emailString', email.body);
            query.setParameter('@addressList', email.recipients.join(','));
            query.setParameter('@dateTimeSent', new Date().toISOString());
            query.setStringParameter('@subject', email.subject);
            emailQuery.combineQueries(query, false);
        }

        const payload = {
            tenantId,
            queryName: emailQuery.name,
            query: emailQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        await utilService.invokeInternalService('queryExecutor', payload, InvocationType.Event);

        const payrollApiCredentials = await utilService.getPayrollApiCredentials(tenantId);
        const payrollApiToken: string = await getPayrollApiToken(accessToken, tenantId, payrollApiCredentials);
        await utilService.clearCache(tenantId, payrollApiToken);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Replaces existing placeholder items in an email template with
 * metadata data
 * @param {MetadataKeys} metadataKeys
 * @param {string} template
 */
function applyMetadata(metadataKeys: any, template: string): string {
    console.info('notification.service.applyMetadata');
    Object.keys(metadataKeys).forEach((key) => {
        template = template.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), metadataKeys[key]);
    });

    return template;
}

/**
 *  Swaps an HR access token for a Payroll API access token.
 * @param {string} hrAccessToken: The access token for the HR user.
 * @param {string} tenantId: The unqiue identifier for the tenant.
 * @param {IPayrollApiCredentials} payrollApiCredentials: The credentials of the user to access the Payroll API
 * @return {string}: A Promise of the access token to access the Payroll API with.
 */
export async function getPayrollApiToken(
    hrAccessToken: string,
    tenantId: string,
    payrollApiCredentials: IPayrollApiCredentials,
): Promise<string> {
    const decodedToken: any = jwt.decode(hrAccessToken);
    const ssoToken = await utilService.getSSOToken(tenantId, decodedToken.applicationId);
    return await ssoService.getAccessToken(tenantId, ssoToken, payrollApiCredentials.evoApiUsername, payrollApiCredentials.evoApiPassword);
}

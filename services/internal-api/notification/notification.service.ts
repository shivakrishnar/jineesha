import { ConnectionPool, IResult } from 'mssql';
import * as nodemailer from 'nodemailer';

import * as configService from '../../api/direct-deposits/config.service';
import * as utilService from '../../api/direct-deposits/util.service';
import * as notificationDao from '../../services.dao';

import { ConnectionString, findConnectionString } from '../../api/direct-deposits/dbConnections';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { Queries } from '../../queries/queries';
import { EmailMessage } from './emailMessage';
import { AlertCategory, DirectDepositAction, IDirectDepositEvent, INotificationEvent, NotificationEventType } from './events';

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

type AlertAction = DirectDepositAction;

type MetadataKeys = {};

interface IDirectDepositMetadataKeys extends MetadataKeys {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    zip: string;
    email: string;
    phoneHome: string;
    phoneCell: string;
    companyName: string;
    displayName: string;
    hireDate: string;
    termDate: string;
    directDepositStartDate: string;
    directDepositEndDate: string;
    directDepositAccount: string;
    directDepositRouting: string;
    directDepositAmountCode: string;
    directDepositAmount: string;
    directDepositAccountType: string;
    directDepositStatus: string;
    directDepositNameOnAccount: string;
    pageLink: string;
}

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
    action: AlertAction,
): Promise<Alert | undefined> {
    console.info('notification.service.getAlertByCategoryAndAction');
    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await notificationDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const query = new ParameterizedQuery('listAlerts', Queries.alertEventList);
        query.setParameter('@companyId', companyId);
        query.setParameter('@action', `'${action}'`);
        query.setParameter('@alertCategoryType', `'${alertCategory}'`);

        const result: IResult<any> = await notificationDao.executeQuery(pool.transaction(), query);
        const alerts: Alert[] = (result.recordset || []).map((entry) => {
            let recipientEmployeesIds: number[] | undefined;
            let recipientUsersIds: number[] | undefined;

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
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
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
    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await notificationDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const query = new ParameterizedQuery('listAlertRecipients', Queries.listAlertRecipients);
        query.setParameter('@includeDirectDepositOwnerEmail', Number(alert.includeEmployee));
        query.setParameter('@includeFirstMgr', Number(alert.includeSupervisor1));
        query.setParameter('@includeSecondMgr', Number(alert.includeSupervisor2));
        query.setParameter('@includeThirdMgr', Number(alert.includeSupervisor3));
        query.setParameter('@recipientEmployeeIds', alert.recipientEmployeesIds.join(','));
        query.setParameter('@recipientUserIds', alert.recipientUsersIds.join(','));
        query.setParameter('@directDepositId', directDepositId);

        const result: IResult<any> = await notificationDao.executeQuery(pool.transaction(), query);

        return (result.recordset || []).map((entry) => {
            return entry.EmailAddress;
        });
    } catch (error) {
        console.error(error);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
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
async function sendSmtpHtmlEmail(message: EmailMessage, smtpCredentials: SmtpCredentials): Promise<void> {
    console.info('notification.service.sendSmtpHtmlEmail');
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
    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await notificationDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const query = new ParameterizedQuery('smtpCredentials', Queries.smtpCredentials);
        const result: IResult<any> = await notificationDao.executeQuery(pool.transaction(), query);
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
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
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
    let pool: ConnectionPool;

    try {
        const connectionString: ConnectionString = await findConnectionString(tenantId);
        const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

        pool = await notificationDao.createConnectionPool(
            rdsCredentials.username,
            rdsCredentials.password,
            connectionString.rdsEndpoint,
            connectionString.databaseName,
        );

        const directDepositPageLinkUrlSuffix: string = 'Secure/Employee/EmployeeDirectDepositList.aspx?menu=ESS';

        const query = new ParameterizedQuery('directDepositMetadata', Queries.directDepositMetadata);
        query.setParameter('@directDepositId', directDepositId);
        const result: IResult<any> = await notificationDao.executeQuery(pool.transaction(), query);
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
    } finally {
        if (pool && pool.connected) {
            await pool.close();
        }
    }
}

/**
 * Replaces existing placeholder items in an email template with
 * metadata data
 * @param {MetadataKeys} metadataKeys
 * @param {string} template
 */
function applyMetadata(metadataKeys: MetadataKeys, template: string): string {
    console.info('notification.service.applyMetadata');
    Object.keys(metadataKeys).forEach((key) => {
        template = template.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), metadataKeys[key]);
    });

    return template;
}

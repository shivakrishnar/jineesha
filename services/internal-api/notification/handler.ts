import { Context, ProxyCallback } from 'aws-lambda';
import { INotificationEvent } from './events';
import { processEvent } from './notification.service';

/**
 * Sends a notification
 * @param {INotificationEvent} event: The request notification event
 * @param {Context} context: The lambda execution context
 * @param {ProxyCallback} callback: The proxy callback invoked by lambda upon execution completion
 */
export async function send(event: INotificationEvent, context: Context, callback: ProxyCallback): Promise<void> {
    console.info('notification.handler.send');

    console.info(`received event: ${JSON.stringify(event)}`);

    try {
        if (await processEvent(event)) {
            const message = 'message successfully sent';
            console.log(message);
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify(message),
            });
        }
    } catch (error) {
        console.log('message sending failed');
        return callback(error);
    }
}

import { Context, ProxyCallback } from 'aws-lambda';
import { logAudit } from './audit.service';

import * as thundra from '@thundra/core';

const thundraWrapper = thundra({
    apiKey: '003d5b8a-2329-4a9c-8b0f-ed5febed6414',
});

/**
 * Logs an audit event.
 * @param {IAudit} event: The audit event
 * @param {Context} context: The lambda execution context
 * @param {ProxyCallback} callback: The proxy callback invoked by lambda upon execution completion
 */
export const log = thundraWrapper(
    async (event: any, context: Context, callback: ProxyCallback): Promise<void> => {
        console.info('audit.handler.log');

        console.info(`received event: ${JSON.stringify(event)}`);

        try {
            if (await logAudit(event)) {
                const message = 'audit successfully logged';
                console.log(message);
                return callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify(message),
                });
            }
        } catch (error) {
            console.log('failed to log audit');
            return callback(error);
        }
    },
);

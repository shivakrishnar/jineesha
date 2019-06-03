import { Context, ProxyCallback } from 'aws-lambda';
import * as configService from '../../config.service';
import * as esignatureService from './esignatures.service';

import * as thundra from '@thundra/core';

const thundraWrapper = thundra({
    apiKey: configService.lambdaPerfMonitorApiKey(),
});

/**
 * Uploads a copy of a signed e-signature document to S3
 */
export const uploadSignedDocument = thundraWrapper(
    async (event: any, context: Context, callback: ProxyCallback): Promise<void> => {
        console.info('esignature.handler.uploadSignedDocument');

        const { signature_request: request } = event;

        try {
            if (await esignatureService.uploadSignedDocument(request)) {
                const message = 'signed document uploaded successfully';
                console.log(message);
                return callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify(message),
                });
            }
        } catch (error) {
            console.log('failed to upload signed document');
            return callback(error);
        }
    },
);

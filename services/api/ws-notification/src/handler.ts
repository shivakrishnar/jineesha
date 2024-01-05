import 'reflect-metadata'; // required by asure.auth dependency
import * as notificationService from './ws-notification.Service';
import { Context, ProxyCallback } from 'aws-lambda';

/*
 * The entry point for every connection to the WebSocket server.
 * Once the connection is established, it will simply return a 200 to the client.
 * NOTE: authentication can't be added to this route because browser's do not
 * support passing headers to a WebSocket server. The workaround is to do the
 * authentication in the initializeConnection route instead.
 */
export const connection = async (event) => {
  console.info('migration.handler.connection');
  console.info(event);
  
  const {
    requestContext: { routeKey },
  } = event;
  try {
    if (routeKey === "$connect") {
      return { statusCode: 200, body: JSON.stringify('Connected but not authenticated. Send a message to initializeConnection with an accessToken in the payload to invoke functions.') };
    }
      
    // $default handler
    return { statusCode: 200 };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/*
 * Handles the authentication of the access token and saves
 * the user's session in the DynamoDB table. Receives the access token
 * from the request body rather than the Authorization header.
 */
export const initializeConnection = async (event) => {
  console.info('migration.handler.initializeConnection');
  console.info(event);

  const {
    requestContext: { connectionId, routeKey, identity: { sourceIp } },
    body,
  } = event;
  const data = JSON.parse(body).data;
  // TODO: request body validation
  try {
    if (routeKey === 'initializeConnection') {
      await notificationService.initializeConnection(connectionId, sourceIp, data.accessToken);
      return { statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/*
 * This is called when the client disconnects from the WS server.
 * Deletes the saved connection from the DynamoDB table.
 */
export const disconnect = async (event) => {
  console.info('migration.handler.disconnect');
  const {
    requestContext: { connectionId, routeKey },
  } = event;
  try {
    if (routeKey === "$disconnect") {
      await notificationService.deleteConnection(connectionId);
      return { statusCode: 200 };
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/*
 * A lambda that will be invoked whenever an error occurs in one of the steps
 * in the execution. Right now, it is not used at all but the idea will be to
 * put rollback logic in here when a migration fails.
 */
 export async function errorHandler(event: any, context: Context, callback: ProxyCallback): Promise<void> {
  console.info('migration.handler.errorHandler');
  console.info(`received event: ${JSON.stringify(event)}`);
  try {
    const message = 'message successfully received';
    return callback(undefined, {
      statusCode: 200,
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.log('message sending failed');
    return callback(error);
  }
}
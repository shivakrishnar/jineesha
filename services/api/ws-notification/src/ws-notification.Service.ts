import * as AWS from 'aws-sdk';
import * as configService from '../../../config.service';
import * as errorService from '../../../errors/error.service';
import { SecurityContext } from '../../../internal-api/authentication/securityContext';
import { SecurityContextProvider } from '../../../internal-api/authentication/securityContextProvider';

export type Message = {
  types: string[];
  isError?: boolean;
  data: any;
};

/*
 * Saves the WS connection info to the DynamoDB table.
 */
export async function saveConnection(connectionId: string, sourceIp: string, securityContext: SecurityContext): Promise<void> {
  console.info('migration.service.saveConnection');
  
  const {
    expiration: tokenExpiration,
    principal: {
      id: userId
    },
  } = securityContext;

  try {
    const client = new AWS.DynamoDB.DocumentClient({
      region: configService.getAwsRegion(),
    });
    
    await client.put({
      TableName: 'WebSocketConnections',
      Item: {
        ConnectionId: connectionId,
        SourceIp: sourceIp,
        // TODO: remove UserId from the table, it is no longer necessary to save
        UserId: userId,
        // Save the expiration time of the token to use for connection verification later.
        ConnectionExpiration: new Date(0).setUTCSeconds(tokenExpiration),
      }
    }).promise();

  } catch (e) {
    console.error(e);
    throw e;
  }
}

/*
 * Deletes the WS connection info from the DynamoDB table by connectionId.
 */
export async function deleteConnection(connectionId: string): Promise<void> {
  console.info('migration.service.deleteConnection');

  try {
    const client = new AWS.DynamoDB.DocumentClient({
      region: configService.getAwsRegion(),
    });
    await client.delete({
      TableName: 'WebSocketConnections',
      Key: {
        ConnectionId: connectionId,
      },
    }).promise();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/*
 * Sends a WS message to a single client by connectionId
 */
export async function notifyClient(connectionId: string, message: Message): Promise<void> {
  console.info('migration.service.notifyClient');

  try {
    const apig = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: configService.getWebSocketUrl(),
    });
    await apig.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    }).promise();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/*
 * Sends a WS message to all connected client. Retrieves a list of connections
 * from the DynamoDB table.
 */
export async function notifyClients(message: Message): Promise<void> {
  console.info('migration.service.notifyClients');
  console.info('message: ' + message);

  try {
    const client = new AWS.DynamoDB.DocumentClient({
      region: configService.getAwsRegion(),
    });
    const connections = await client.scan({
      TableName: 'WebSocketConnections',
    }).promise();

    console.info('connections: ');
    console.info(connections);

    if (connections.Items.length > 0) {
      
      const messages = connections.Items.map(async (connection) => {
        return notifyClient(connection.ConnectionId, message);
      });
      await Promise.all(messages); 

    } else {
      console.info('No active connections found');
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/*
 * Saves an execution task token to the DynamoDB table
 */
export async function saveToken(executionName: string, taskToken: string, input: any): Promise<void> {
  console.info('migration.service.saveMigrationToken');

  try {
    const client = new AWS.DynamoDB.DocumentClient({
      region: configService.getAwsRegion(),
    });
      
    await client.put({
      TableName: 'WebSocketTokens',
      Item: {
        ExecutionId: executionName,
        TaskToken: taskToken,
        ExecutionInput: JSON.stringify(input),
      },
    }).promise();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/*
 * Deletes an execution task token from the DynamoDB table by execution name.
 */
export async function deleteToken(executionName: string): Promise<void> {
  console.info('migration.service.deleteMigrationToken');

  try {
    const client = new AWS.DynamoDB.DocumentClient({
      region: configService.getAwsRegion(),
    });
      
    await client.delete({
      TableName: 'WebSocketTokens',
      Key: {
        ExecutionId: executionName,
      },
    }).promise();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/*
 * Authenticates the provided access token and saves the connection info to Dynamo.
 */
export async function initializeConnection(connectionId: string, sourceIp: string, accessToken: string): Promise<void> {
  console.info('migration.service.initializeConnection');
  
  try {
    // authenticate
    const securityContext = await new SecurityContextProvider().getSecurityContext({
      event: {
        headers: {
          Authorization: accessToken,
        },
      },
    });
    await saveConnection(connectionId, sourceIp, securityContext);
    await notifyClient(connectionId, {
      types: ['initializeConnection'],
      data: {},
    });
  } catch (e) {
    console.error(e);
    await notifyClient(connectionId, {
      types: ['initializeConnection'],
      isError: true,
      data: e,
    });

    const apig = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: configService.getWebSocketUrl(),
    });
    await apig.deleteConnection({
      ConnectionId: connectionId,
    }).promise();
    throw e;
  }
}

/*
 * Validates a client's connection to the WS server by retrieving the
 * connection info from the Dynamo table and checking against the ConnectionExpiration
 * field (the expiration time of the token).
 */
export async function validateConnection(connectionId: string): Promise<void> {
  console.info('migration.service.validateConnection');

  try {
    const client = new AWS.DynamoDB.DocumentClient({
      region: configService.getAwsRegion(),
    });

    const connection = await client.get({
      TableName: 'WebSocketConnections',
      Key: {
        ConnectionId: connectionId
      }
    }).promise(); 
    
    if (!connection?.Item?.ConnectionExpiration) {
      throw errorService.notAuthenticated();
    }

    const expirationDate = new Date(connection.Item.ConnectionExpiration).getTime();
    const dateNow = new Date().getTime();
    if (expirationDate - dateNow <= 0) {
      throw errorService.notAuthenticated();
    }

  } catch (e) {
    console.error(e);

    await notifyClient(connectionId, {
      types: ['validateConnection'],
      isError: true,
      data: {
        error: e,
      },
    });

    const apig = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: configService.getWebSocketUrl(),
    });
    await apig.deleteConnection({
      ConnectionId: connectionId,
    }).promise();

    throw e;
  }
}

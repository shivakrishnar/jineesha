import { APIGatewayEvent, Context } from 'aws-lambda';

export const apiGatewayEvent: APIGatewayEvent = {
    body: '{ "property": "Hello" }',
    isBase64Encoded: false,
    headers: {
        Authorization: '1234',
    },
    multiValueHeaders: {},
    httpMethod: 'GET',
    path: '',
    pathParameters: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    stageVariables: {},
    requestContext: {
        accountId: '',
        apiId: '',
        connectedAt: 123,
        httpMethod: 'get',
        identity: {
            accessKey: '',
            accountId: '',
            apiKey: '',
            apiKeyId: '',
            caller: '',
            cognitoAuthenticationProvider: '',
            cognitoAuthenticationType: '',
            userArn: '',
            cognitoIdentityId: '',
            cognitoIdentityPoolId: '',
            sourceIp: '',
            user: '',
            userAgent: '',
        },
        path: '',
        stage: '',
        requestId: '',
        requestTimeEpoch: 123,
        resourceId: '',
        resourcePath: '',
    },
    resource: '',
};

export const context: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    memoryLimitInMB: 123,
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: () => 123,
    done: (error, result) => {
        console.log(result);
    },
    fail: (error) => {
        console.log(error);
    },
    succeed: (messageOrObject) => {
        console.log(messageOrObject);
    },
};

import { APIGatewayEvent, Context } from 'aws-lambda';
import * as mockData from './mock-data';

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

export const fileName = 'object.pdf';
export const s3Key = `${mockData.tenantId}/${mockData.companyId}/${mockData.employeeId}`;
export const updatedFileName = 'object-123.pdf';
export const updatedS3Key = `${s3Key}/object-123.pdf`;
export const updatedObjectData: string[] = [updatedFileName, updatedS3Key];

export const companyExistInTenant = {
    recordsets: [[{ companyExistsInTenant: true }]],
    recordset: [{ companyExistsInTenant: true }],
    output: {},
    rowsAffected: [1, 1],
};

export const employeeExistsInCompany = {
    recordsets: [[{ employeeExistsInCompany: true }]],
    recordset: [{ employeeExistsInCompany: true }],
    output: {},
    rowsAffected: [1, 1],
};

export const companyDoesNotExistInTenant = {
    recordsets: [[{ companyExistsInTenant: false }]],
    recordset: [{ companyExistsInTenant: false }],
    output: {},
    rowsAffected: [1, 1],
};

export const employeeDoesNotExistsInCompany = {
    recordsets: [[{ employeeExistsInCompany: false }]],
    recordset: [{ employeeExistsInCompany: false }],
    output: {},
    rowsAffected: [1, 1],
};

export const userDoesNotExistInCompany = {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [1, 1, 0],
};

export const userExistsInCompany = {
    recordsets: [[{ HRnextUserID: '1870', CompanyID: '600395' }]],
    recordset: [{ HRnextUserID: '1870', CompanyID: '600395' }],
    output: {},
    rowsAffected: [1, 1, 1],
};

export const userDoesNotBelongToEmployee = {
    recordsets: [[]],
    recordset: [{ ID: 0 }],
    output: {},
    rowsAffected: [1, 1, 0],
};

export const userBelongsToEmployee = {
    recordsets: [[[{ ID: '113' }]]],
    recordset: [{ ID: '113' }],
    output: {},
    rowsAffected: [1, 1, 1],
};

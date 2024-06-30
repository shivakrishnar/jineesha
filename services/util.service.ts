import * as validate from '@smallwins/validate';
import * as jwt from 'jsonwebtoken';
import * as AWS from 'aws-sdk';
import * as nJwt from 'njwt';
import * as shortid from 'shortid';
import * as request from 'superagent';
import * as util from 'util';
import * as uniqueifier from 'uuid/v4';
import { ObjectSchema } from 'yup';
import * as configService from './config.service';
import * as errorService from './errors/error.service';
import * as ssoService from './remote-services/sso.service';
// utilService is being imported in itself so that jest can mock this function
import * as utilService from './util.service';
import * as atInterfaces from './api/applicant-tracking/src/ApplicantTracking.Interfaces';
import * as atEnums from './api/applicant-tracking/src/ApplicantTracking.Enums';

import {
    APIGatewayEvent,
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    Context,
    ProxyCallback,
    ProxyResult,
    ScheduledEvent,
} from 'aws-lambda';
import { Headers } from './api/models/headers';
import { IPayrollApiCredentials } from './api/models/IPayrollApiCredentials';
import { ErrorMessage } from './errors/errorMessage';
import { SecurityContext } from './internal-api/authentication/securityContext';
import { SecurityContextProvider } from './internal-api/authentication/securityContextProvider';
import { DatabaseEvent, QueryType } from './internal-api/database/events';
import { INotificationEvent } from './internal-api/notification/events';
import { ParameterizedQuery } from './queries/parameterizedQuery';
import { Queries } from './queries/queries';
import { Query } from './queries/query';
import { Role } from './api/models/Role';
import { ConfigurationOptions } from 'aws-sdk';

export type ApiInvocationEvent = APIGatewayEvent | ScheduledEvent;

/**
 * Parse a JSON string into an object.
 *
 * We have seen an issue where the events handed off to lamba from API Gateway occasionally cause errors
 * if we try and use JSON.parse() on them. This also occurs when doing local development with event files that
 * we use with serverless.
 *
 * To ensure consistent functionality we have moved the parse call into a try/catch so that we can safely attempt
 * to parse the JSON and continue processing the call.
 *
 * @param value An JSON string to parse.
 * @param rethrowOnError Indicates whether to rethrow a parsing error or return the original value.
 */
export function parseJson(value: any, rethrowOnError = false): any {
    try {
        return JSON.parse(value);
    } catch (error) {
        if (rethrowOnError) {
            throw errorService.getErrorResponse(30).setDeveloperMessage('Invalid JSON format');
        } else {
            return value;
        }
    }
}

export function executionTimeString(serviceName: string, functionName: string, hrEnd: number[]): string {
    return util.format(`${serviceName}.${functionName} execution time (hr): %ds %dms`, hrEnd[0], hrEnd[1] / 1000000);
}

export function isEmpty(obj: object): boolean {
    for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
}

export interface IGatewayEventInput {
    securityContext: SecurityContext;
    event: APIGatewayEvent;
    requestBody?: any;
}

export interface IHttpResponse<T> {
    statusCode: number;
    headers?: Headers;
    body?: T;
    isBase64Encoded?: boolean;
}

export type GatewayEventDelegate<T> = (gatewayEventInput: IGatewayEventInput) => Promise<T | IHttpResponse<T>>;

function isHttpResponse<T>(response: any): response is IHttpResponse<T> {
    return response && response.statusCode !== undefined && (response.headers !== undefined || response.body !== undefined);
}

/**
 * Determines if an event invocation is purely for warm-up purposes
 * @param { ApiInvocationEvent} event: The lambda invocation event
 * @returns {boolean}: True, if for warm-up purposes; otherwise, false.
 */
export function isLambdaWarmupInvocation(event: ApiInvocationEvent): event is ScheduledEvent {
    return (event as ScheduledEvent).source === 'serverless-plugin-warmup';
}

/**
 * Builds a Lambda response object which can be returned to API Gateway.
 */
export function buildLambdaResponse(statusCode: number, headers: Headers, input: any, uri: string, isBase64Encoded?: boolean): ProxyResult {
    console.info(`utilService.buildLambdaResponse (httpStatusCode : ${statusCode}; uri : ${uri})`);
    if (headers) {
        headers.accessControlHeader();
    } else {
        headers = new Headers().accessControlHeader();
    }

    const body = isBase64Encoded ? input : JSON.stringify(input);
    const response: ProxyResult = { statusCode, headers: headers.toJSON(), body, isBase64Encoded };

    return response;
}

/**
 * Handle an API Gateway event and make the appropriate callback. Response from delegate can be a POJO or an IHttpResponse.
 *
 * This is an enhanced version of gatewayEventHander() (above), supporting V2 access tokens (in addition to V1 tokens).
 * Note that it IGNORES the serverless "authorizer" attribute, instead building the SecurityContext object internally.
 * This means any handler wrapped with gatewayEventHandlerV2, can be run locally with serverless-offline. A new option
 * "allowAnonymous" is now supported, providing a mechanism for specifying that an endpoint allows anonymous access.
 *
 * Depending on whether you need to specify "allowAnonymous", choose one of these two supported signatures for your handler:
 *   myHandler = gatewayEventHandlerV2({ allowAnonymous: true, delegate: async ({ event }) => { ... }});
 *   myHandler = gatewayEventHandlerV2(async ({ securityContext, event }) => { ... });
 */
export function gatewayEventHandlerV2<T>(
    parameter: GatewayEventDelegate<T> | { allowAnonymous: boolean; delegate: GatewayEventDelegate<T> },
): APIGatewayProxyHandler {
    // determine which call signature is being used, and extract delegate and allowAnonymous accordingly
    const unTypedParam = parameter as any;

    let delegate: GatewayEventDelegate<T>;
    let allowAnonymous: boolean;

    if (unTypedParam.delegate) {
        delegate = unTypedParam.delegate;
        allowAnonymous = unTypedParam.allowAnonymous;
    } else {
        delegate = unTypedParam;
        allowAnonymous = false;
    }

    return (event: APIGatewayEvent, context: Context, callback: ProxyCallback): void => {
        // Below we are intentionally invoking an IIFE because the code inside is async, but the Lambda
        // handler signature is a void function. The try/catch ensures that the callback is always invoked,
        // so we can safely discard the returned Promise<void>.

        if (isLambdaWarmupInvocation(event)) {
            console.log('warm up invocation');
            return callback(undefined, buildLambdaResponse(204, undefined, {}, 'warm-up-invocation'));
        }

        (async () => {
            try {
                const securityContext = await new SecurityContextProvider().getSecurityContext({ event, allowAnonymous });
                let requestBody: any;

                if (event.body) {
                    requestBody = event.body;
                    if (event.isBase64Encoded) {
                        requestBody = Buffer.from(requestBody, 'base64');
                    }
                    try {
                        requestBody = parseJson(requestBody, true);
                    } catch (e) {
                        console.log('Event body is not a JSON');
                        requestBody = event.body;
                    }
                }
                const result = await delegate({ securityContext, event, requestBody });

                if (isHttpResponse(result)) {
                    callback(
                        undefined,
                        buildLambdaResponse(result.statusCode, result.headers, result.body, event.path, result.isBase64Encoded),
                    );
                } else {
                    callback(undefined, buildLambdaResponse(result ? 200 : 204, undefined, result, event.path));
                }
            } catch (error) {
                const statusCode = error.statusCode || 500;
                if (statusCode === 500) {
                    console.error(error);
                }
                callback(undefined, buildLambdaResponse(statusCode, undefined, error, event.path));
            }
        })();
    };
}

/**
 * Function that checks to ensure an object that is being updated does not contain
 * any properties that we did not define as valid for the object.
 *
 * @param {object} schema The object that contains the valid properties for the object.
 * @param {object} body The object that we are checking to ensure it has no additional properties.
 * @param {string} objectName The name of the object we are checking.
 *
 * @author swallace
 */
export function checkAdditionalProperties(schema: object, body: object, objectName: string): void {
    console.info('utilService.checkAdditionalProperties');
    const schemaProperties = new Array<string>();

    Object.keys(schema).forEach((key) => {
        schemaProperties.push(key);
    });

    Object.keys(body).forEach((key) => {
        if (schemaProperties.indexOf(key) === -1) {
            throw errorService.getErrorResponse(30).setDeveloperMessage(`${key} is not a valid property for the ${objectName} object.`);
        }
    });
}

export function hasValidationError(errors: any, errorSubstring: string): boolean {
    let returnValue = false;
    errors.forEach((error) => {
        if (JSON.stringify(error.stack).includes(errorSubstring)) {
            returnValue = true;
        }
    });
    return returnValue;
}

/**
 * Combines the results of invoking @smallwinds/validate multiple times. Expects each result as a separate param.
 * Returns a single result in the same format (either an array of errors, or undefined if no errors).
 */
export function combineValidationResults(...multipleValidationResults: Array<Error[] | null>): Error[] | null {
    const arrayOfArrays = multipleValidationResults.filter((results) => Boolean(results));
    const errors = [].concat(...arrayOfArrays);
    return errors.length ? errors : undefined;
}

/**
 * Invoke smallwins/validate to validate an object against a schema, and throw appropriate exception if it fails.
 */
export function validateAndThrow(params: { [name: string]: string }, schema: { [name: string]: { required: boolean; type: any } }): void {
    console.info('utilService.validateAndThrow');
    const errors = validate(params, schema);
    if (errors) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage(errors[0].message)
            .setMoreInfo(errors.toString());
    }
}

/**
 * Verifies a given set of integral url pathParameters are within bounds as defined here
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
 * @param pathParameters: The url path parameters
 * @throws {ErrorMessage}: Throws a 401 error message if any parameter is out of bounds.
 */
export function checkBoundedIntegralValues(pathParameters: { [i: string]: string }): void {
    const excludedParameters: string[] = ['tenantId'];

    for (const parameter of Object.keys(pathParameters)) {
        if (excludedParameters.includes(parameter)) {
            continue;
        }

        const pathParameterValue = pathParameters[`${parameter}`];

        if (!Number.isSafeInteger(Number.parseInt(pathParameterValue, 10))) {
            throw errorService
                .getErrorResponse(60)
                .setDeveloperMessage(`${parameter} value: ${pathParameterValue} is out of bounds`)
                .setMoreInfo('Value must be integral and cannot exceed 2^53 - 1');
        }
    }
}

/**
 * Ensure a payload is sent with a request
 * @param requestBody Request body to validate.
 */
export async function requirePayload(payload: any): Promise<void> {
    console.info('utilService.requirePayload');

    if (!payload) {
        throw errorService
            .getErrorResponse(30)
            .setDeveloperMessage('Request body expected')
            .setMoreInfo(`See documentation for usage.`);
    }
}

/**
 * Validate an object against a schema, and throw the appropriate exception if it fails.
 * @param schema Yup schema to validate the request body against.
 * @param requestBody Request body to validate.
 */
export async function validateRequestBody(schema: ObjectSchema<{}>, requestBody: any): Promise<void> {
    console.info('utilService.validateRequestBody');
    await schema.validate(requestBody, { abortEarly: false }).catch((error) => {
        console.error(error.errors[0]);
        throw errorService.getErrorResponse(30).setDeveloperMessage(error.errors[0]);
    });
}

/**
 * Validate a collection of objects against a schema, and throws the appropriate exception if it fails.
 * @param schema Yup schema to validate the request body against.
 * @param collection Collection of objects to validate.
 */
export async function validateCollection(schema: ObjectSchema<{}>, collection: any[]): Promise<void> {
    for (const item of collection) {
        await validateRequestBody(schema, item);
    }
}

/**
 * Helper function for try/catch with logging and re-throwing. Attempts to invoke the provided delegate,
 * and return the result as a resolved promise. If an exception is thrown by the delegate, the provided
 * error delegate is invoked, and the returned error is logged and then returned as a rejected promise.
 *
 * @param delegate Function implementing the action we are trying to perform.
 * @param errorDelegate Function returning the error to log/throw on failure.
 * @returns A promise of the result of invoking the delegate.
 */
export async function attempt<T>(delegate: () => Promise<T>, errorDelegate: (e: any) => ErrorMessage): Promise<T> {
    try {
        return await delegate();
    } catch (e) {
        const error = errorDelegate(e);
        let msg = error.message;
        if (error.moreInfo) {
            msg += `: ${error.moreInfo}`;
        }
        console.error(`${msg}: ${e}`);
        throw error;
    }
}

/**
 * Normalize headers to be lower case since they are case insensitive.
 *
 * per RFC 2616 > Each header field consists of a name followed by a colon (":")
 * and the field value. Field names are **case-insensitive**
 */
function getNormalizedHeaders(headers: { [name: string]: string }): { [name: string]: string } {
    const normalizedHeaders = {};
    Object.keys(headers).forEach((prop) => {
        normalizedHeaders[prop.toLowerCase()] = headers[prop];
    });
    return normalizedHeaders;
}

/**
 * Mutate event headers to be normalized.
 */
export function normalizeHeaders(event: { headers: { [name: string]: string } }): void {
    event.headers = getNormalizedHeaders(event.headers);
}

export function makeSerializable(error: any): any {
    // Built-in javascript Error objects are not JSON serializale
    if (!(error instanceof Error)) {
        return error;
    }
    const serializableError: { [name: string]: any } = {};
    Object.getOwnPropertyNames(error).forEach((key: string) => {
        const value: any = error[key];
        serializableError[key] = value;
    });
    return serializableError;
}

export async function getSecret(id: string): Promise<string> {
    console.info('utilService.getSecret');
    const [endpoint, region] = [configService.getSecretsAwsEndpoint(), configService.getAwsRegion()];
    console.log(`endpoint: ${endpoint}, region: ${region}`);

    const client = new AWS.SecretsManager({
        endpoint: configService.getSecretsAwsEndpoint(),
        region: configService.getAwsRegion(),
    });

    // const data = await client.getSecretValue({ SecretId: id }).promise();
    // return data.SecretString;

    try {
        console.log('getting secret...', id);
        const data = await client.getSecretValue({ SecretId: id }).promise();
        return data.SecretString;
    } catch (error) {
        console.error(`something blew up: ${JSON.stringify(error)}`);
        throw new Error('Something went wrong');
    }
}

export async function getApplicationSecret(applicationId: string): Promise<string> {
    console.info(`getApplicationSecret(applicationId: ${applicationId})`);
    try {
        let secretId: string;
        if (applicationId === configService.getGoldilocksApplicationId()) {
            secretId = configService.getSsoCredentialsId();
        } else if (applicationId === configService.getHrApplicationId()) {
            secretId = configService.getHrCredentialsId();
        } else {
            // assume evolution application
            secretId = configService.getApiSecretId();
        }
        const secret = await getSecret(secretId);
        return JSON.parse(secret).apiSecret;
    } catch (e) {
        throw new Error(`Failed to get secret for applicationId ${applicationId}: ${e.message}`);
    }
}

/**
 * Generates the intial SSO token
 * @param {string} tenantId: The unique identifier of the tenant.
 * @param {string} applicationId: The unique identifier for the application for which the token is generated.
 * @returns {Promise<any>}: returns a Promise of the SSO token
 */
export async function getSSOToken(tenantId: string, applicationId?: string): Promise<any> {
    const claims = {
        iat: Math.trunc(Date.now() / 1000),
        iss: JSON.parse(await getSecret(configService.getApiSecretId())).apiKey,
        sub: applicationId || JSON.parse(await getSecret(configService.getApiSecretId())).applicationId,
        tenantId,
        jti: uniqueifier(),
    };

    return nJwt.create(claims, JSON.parse(await getSecret(configService.getApiSecretId())).apiSecret).compact();
}

/**
 * Checks all values within a given object to determine if any is undefined.
 * @param {any} object: The object to be checked
 * @returns {boolean}: True if object has all keys defined, else false.
 */
export function hasAllKeysDefined(object: any): boolean {
    console.info('utilService.hasAllKeysDefined');

    if (object !== undefined) {
        const vals = Object.values(object);
        for (let i = 0; i < vals.length; i++) {
            if (!vals[i]) {
                return false;
            }

            if (vals[i] instanceof Object) {
                const status = hasAllKeysDefined(vals[i]);
                if (!status) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}

/**
 *  Asynchronously invokes an on-demand lambda for sending an email message
 *  to a list of intended recipients.
 * @param {INotificationEvent} payload: The message to be sent
 * @returns {Promise<void>}
 */
export async function sendEventNotification(payload: INotificationEvent): Promise<void> {
    console.info('utilService.sendEventNotification');
    AWS.config.update({
        region: configService.getAwsRegion(),
    });

    const lambda = new AWS.Lambda();
    const params = {
        FunctionName: `hr-services-internal${configService.getBranchName() || ''}-${configService.getStage()}-eventNotifier`,
        InvocationType: 'Event',
        Payload: JSON.stringify(payload),
    };

    try {
        await lambda.invoke(params).promise();
    } catch (error) {
        const errorMessage = `Something went wrong invoking notification lambda: ${JSON.stringify(error)}`;
        console.log(errorMessage);
    }
}

/**
 *  Asynchronously invokes an on-demand lambda for logging to the audit trail.
 * @returns {Promise<void>}
 */
export async function logToAuditTrail(payload: any): Promise<void> {
    console.info('utilService.logToAuditTrail');
    AWS.config.update({
        region: configService.getAwsRegion(),
    });

    const lambda = new AWS.Lambda();
    const params = {
        FunctionName: `hr-services-internal${configService.getBranchName() || ''}-${configService.getStage()}-auditLogger`,
        InvocationType: 'Event',
        Payload: JSON.stringify(payload),
    };

    try {
        await lambda.invoke(params).promise();
    } catch (error) {
        const errorMessage = `Something went wrong invoking audit lambda: ${JSON.stringify(error)}`;
        console.log(errorMessage);
    }
}

export enum InvocationType {
    RequestResponse = 'RequestResponse',
    Event = 'Event',
}

/**
 *  Invokes another lambda asynchronously or synchronously with a given payload
 * @param {string} serviceName: The name of the lambda to invoke
 * @param {any} payload: The request event to the passed to the lambda
 * @param {invocationType} invocationType: How to invoke lambda - synchronously(RequestResponse) | asynchronously(Event)
 * @param {boolean} throwServiceError: if true, throws the error returned from the invoked service
 * @param {number} timeout: specifies the socket timeout in milliseconds for the AWS SDK
 * @param {number} maxRetries: specifies the number of retry attempts should a timeout occur
 * @returns {Promise<unknown>}: A Promise of the invocation result
 */
export async function invokeInternalService(
    serviceName: string,
    payload: any,
    invocationType: InvocationType,
    throwServiceError?: boolean,
    timeout?: number,
    maxRetries?: number,
): Promise<unknown> {
    console.info(`utilService.invokeInternalService - ${serviceName}`);
    if (payload?.queryName) console.info(`queryName: ${payload.queryName}`);

    const awsConfig: ConfigurationOptions = {
        region: configService.getAwsRegion(),
    };

    if (maxRetries || maxRetries === 0) awsConfig.maxRetries = maxRetries;
    if (timeout) awsConfig.httpOptions = { timeout };

    AWS.config.update(awsConfig);

    const lambda = new AWS.Lambda();
    const params = {
        FunctionName: `hr-services-internal${configService.getBranchName() || ''}-${configService.getStage()}-${serviceName}`,
        InvocationType: invocationType,
        Payload: JSON.stringify(payload),
    };

    if (invocationType === InvocationType.RequestResponse) {
        const response = await lambda.invoke(params).promise();

        console.info(`lambda requestId: ${response.$response.requestId}`);

        const responsePayload = JSON.parse(response.Payload.toString());

        if (responsePayload.body) {
            const result = JSON.parse(responsePayload.body);
            if (result instanceof ErrorMessage) {
                throw result;
            }
            return result;
        }

        // Internal Error
        if (responsePayload.errorMessage) {

            const errorMessage = JSON.parse(responsePayload.errorMessage);
            console.error(`invocation failed. Reason: ${JSON.stringify(errorMessage)}`);
            if(throwServiceError) {
                throw errorMessage;
            }
            throw errorService.getErrorResponse(0);
        }
    }
    await lambda.invoke(params).promise();
}

/**
 * Formats a given date to the desired locale.
 * @param {string} date: A string representation of an existing date
 * @param {string} locale: The locale to format the date to.
 * @return {string}: A string representation of the formatted date; empty string if
 * provided date was null or undefined.
 */
export function formatDateToLocale(date: string, locale = 'en-US'): string {
    if (!date) {
        return '';
    }
    return new Date(date).toLocaleDateString(locale, { timeZone: 'UTC' });
}

type TenantDetails = {
    accountName: string;
    applicationUrl: string;
    contact: {
        firstName: string;
        lastName: string;
        emailAddress: string;
    };
};

/**
 * Clears the L2 cache of the application for a specified tenant
 * Note: Although this is designed to clear the cache for a specific tenant
 *       since a single instance of Elastic Beanstalk is shared by all tenants,
 *       this in effect clears the cache for all.
 * @param {string} tenantId: The unique identifier for the tenant
 * @param {string} accessToken: The authorizing access token
 */
export async function clearCache(tenantId: string, accessToken: string): Promise<void> {
    console.info('audit.service.clearCache');

    const tenantInfo = new Query('TenantInfo', Queries.tenantInfo);
    const payload = {
        tenantId,
        queryName: tenantInfo.name,
        query: tenantInfo.value,
        queryType: QueryType.Simple,
    } as DatabaseEvent;
    const result: any = await invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

    console.info('==> result:');
    console.info(result);

    const tenant: TenantDetails[] = (result.recordset || []).map((entry) => {
        return {
            accountName: entry.AccountName,
            applicationUrl: `${(entry.TenantUrls as string).split(';')[0]}`,
            contact: {
                firstName: entry.ContactFirstName,
                lastName: entry.ContactLastName,
                emailAddress: entry.PrimaryContactEmail,
            },
        };
    });

    if (tenant.length > 0) {        
        try {
            console.info(`Clear cache in ${tenant[0].applicationUrl}`);

            const clearCacheResult = await request
            .post(`https://${tenant[0].applicationUrl}/Classes/Service/hrnextDataService.asmx/ClearCache`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ accessToken }));

            console.info(clearCacheResult);
        } catch (error) {
            console.info(error);
        }
    }
}

/**
 * Retrieves the credentials of a given tenant's Evolution API service account
 * @param {string} tenantId: The unique identifier for the tenant
 * @returns {Promise<IPayrollApiCredentials>}: A Promise of the service account credentials
 */
export async function getPayrollApiCredentials(tenantId: string): Promise<IPayrollApiCredentials> {
    console.info('utilService.getPayrollApiCredentials');

    try {
        const query = new Query('PayrollApiServiceAccount', Queries.apiServiceAccount);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

        const dbCredentials: IPayrollApiCredentials[] = result.recordset.map((entry) => {
            return {
                evoApiUsername: entry.APIUsername,
                evoApiPassword: entry.APIPassword,
            };
        });

        if (dbCredentials.length === 0) {
            throw Error('missing Evolution API service account credentials');
        }

        // decrypt the service account password
        AWS.config.update({
            region: configService.getAwsRegion(),
        });

        const lambda = new AWS.Lambda();
        const params = {
            FunctionName: `asure-encryption-${configService.getStage()}-decrypt`,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({
                cipherText: dbCredentials[0].evoApiPassword,
            }),
        };

        const decryptServiceResponse = await lambda.invoke(params).promise();
        const response = JSON.parse(decryptServiceResponse.Payload.toString());
        dbCredentials[0].evoApiPassword = response.body;

        return dbCredentials[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Extracts a list of role names from scope field of an ssoToken or hrToken
 * @param {string[]} scope: The values from scope field of the decoded jwt
 * @returns {string[]}: Array of role names associated with the account
 */

export function parseRoles(scopes: string[]): string[] {
    const roles: string[] = [];
    scopes.forEach((scope) => {
        roles.push(scope.replace(configService.getScopeBaseDomain(), ''));
    });
    return roles;
}

/**
 * Utility for splitting string at a given index
 * @example
 *    let str = 'helloworld.txt'
 *    splitAt(9)(str);   //returns ['helloworld', '.txt']
 * @param {number} index: The index to split on
 * @param {string} str: The string to split
 * @returns {string []}: An array of the two parts of the string after splitting
 */
const splitAt = (index: number) => (str: string) => [str.slice(0, index), str.slice(index)];

/**
 * Splits a given filename including its extension into the filename and the extension
 * @param {string} filenameWithExtension: The filename including its extension
 * @returns {string[]}: An array of the filename and extension.
 */
export function splitFilename(filenameWithExtension: string): string[] {
    const extensionIndex = filenameWithExtension.lastIndexOf('.');
    return splitAt(extensionIndex)(filenameWithExtension);
}

export type CompanyInfo = {
    CompanyName: string;
    ClientID: string;
    MatchingUrls: string;
    CreateDate: string;
};

/**
 * Validates that a specified company exists
 * @param {string} tenantId: The unique identifier for the tenant.
 * @param {string} companyId: The unique identifier for the company.
 * @returns: The company details.
 */
export async function validateCompany(tenantId: string, companyId: string, customQueryPayload?: DatabaseEvent): Promise<CompanyInfo> {
    console.info('utilService.validateCompany');

    // companyId value must be integral
    if (Number.isNaN(Number(companyId))) {
        const errorMessage = `${companyId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        // Check that the company id is valid.
        const query = new ParameterizedQuery('GetCompanyInfo', Queries.companyInfo);
        query.setParameter('@companyId', companyId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await invokeInternalService('queryExecutor', customQueryPayload || payload, InvocationType.RequestResponse);
        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The company id: ${companyId} not found`);
        }
        return result.recordset[0];
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(`Unable to retrieve company info. Reason: ${error}`);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates that a specified employee exists
 * @param {string} tenantId: The unique identifier for the tenant.
 * @param {string} employeeId: The unique identifier for the employee.
 * @returns: The employee details.
 */
export async function validateEmployee(tenantId: string, employeeId: string): Promise<any> {
    console.info('utilService.validateEmployee');

    // employeeId value must be integral
    if (Number.isNaN(Number(employeeId))) {
        const errorMessage = `${employeeId} is not a valid number`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    try {
        // Check that the employee id is valid.
        const query = new ParameterizedQuery('GetEmployeeInfoByID', Queries.getEmployeeInfoById);
        query.setParameter('@employeeId', employeeId);
        const payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        if (result.recordset.length === 0) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`The employee id: ${employeeId} not found`);
        }
        return {
            firstName: result.recordset[0].FirstName,
            lastName: result.recordset[0].LastName,
            emailAddress: result.recordset[0].EmailAddress,
            employeeCode: result.recordset[0].EmployeeCode,
        };
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(`Unable to retrieve employee info. Reason: ${error}`);
        throw errorService.getErrorResponse(0);
    }
}

export enum Resources {
    Company = 'company',
}

/**
 * Validates a company to exist in a tenant and that an employee exist in the company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 * @param {string} employeeId: The unique identifier for the specified employee.
 */
export async function validateEmployeeWithCompany(tenantId: string, companyId: string, employeeId: string): Promise<void> {
    console.info('utilService.validateEmployeeWithCompany');

    try {
        // companyId value must be integral
        if (Number.isNaN(Number(companyId))) {
            const errorMessage = `${companyId} is not a valid companyId`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }

        // employeeId value must be integral
        if (Number.isNaN(Number(employeeId))) {
            const errorMessage = `${employeeId} is not a valid employeeId`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }

        const companyExistsInTenantQuery: ParameterizedQuery = new ParameterizedQuery(
            'companyExistsInTenant',
            Queries.companyExistsInTenant,
        );
        companyExistsInTenantQuery.setParameter('@companyId', companyId);
        const companyExistsInTenantPayload: DatabaseEvent = {
            tenantId,
            queryName: companyExistsInTenantQuery.name,
            query: companyExistsInTenantQuery.value,
            queryType: QueryType.Simple,
        };

        const companyExistsInTenantResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            companyExistsInTenantPayload,
            InvocationType.RequestResponse,
        );

        const companyExistsInTenant = companyExistsInTenantResult.recordset[0].companyExistsInTenant;

        if (!companyExistsInTenant) {
            throw errorService.getErrorResponse(50).setDeveloperMessage(`Company with ID ${companyId} not found.`);
        }

        const employeeExistsInCompanyQuery: ParameterizedQuery = new ParameterizedQuery(
            'employeeExistsInCompany',
            Queries.employeeExistsInCompany,
        );
        employeeExistsInCompanyQuery.setParameter('@companyId', companyId);
        employeeExistsInCompanyQuery.setParameter('@employeeId', employeeId);

        const employeeExistsInCompanyPayload = {
            tenantId,
            queryName: employeeExistsInCompanyQuery.name,
            query: employeeExistsInCompanyQuery.value,
            queryType: QueryType.Simple,
        };
        const employeeExistsInCompanyResult: any = await utilService.invokeInternalService(
            'queryExecutor',
            employeeExistsInCompanyPayload,
            InvocationType.RequestResponse,
        );

        const employeeExistsInCompany = employeeExistsInCompanyResult.recordset[0].employeeExistsInCompany;

        if (!employeeExistsInCompany) {
            throw errorService
                .getErrorResponse(50)
                .setDeveloperMessage(`Employee with ID ${employeeId} was not found in the Company with ID ${companyId}.`);
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates a user to exist in a company.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address associated with the user.
 * @param {string} companyId: The unique identifier for the company the user belongs to.
 */
export async function validateUserIsInCompany(tenantId: string, email: string, companyId: string): Promise<boolean> {
    console.info('utilService.validateUserIsInCompany');
    try {
        // companyId value must be integral
        if (Number.isNaN(Number(companyId))) {
            const errorMessage = `${companyId} is not a valid companyId`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }

        const query: ParameterizedQuery = new ParameterizedQuery('userExistsInCompany', Queries.userExistsInCompany);
        // note: the email in the token equates to the username in the AHR database
        query.setParameter('@username', email);
        query.setParameter('@companyId', companyId);
        const companyExistsInTenantPayload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };

        const result: any = await utilService.invokeInternalService(
            'queryExecutor',
            companyExistsInTenantPayload,
            InvocationType.RequestResponse,
        );

        const userExistsInCompany = result?.recordset[0]?.UserExistsInCompany === 1;

        return Promise.resolve(userExistsInCompany);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates that a user belongs to a specific employee.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address associated with the user.
 * @param {string} employeeId: The unique identifier for an employee.
 */
export async function validateUserWithEmployee(tenantId: string, email: string, employeeId: string): Promise<boolean> {
    console.info('utilService.validateUserWithEmployee');

    try {
        // employeeId value must be integral
        if (Number.isNaN(Number(employeeId))) {
            const errorMessage = `${employeeId} is not a valid employeeId`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }

        // TODO: (MJ-8842) enhance the logic in this query to perform different checks based on the roles of the user.
        const query: ParameterizedQuery = new ParameterizedQuery('getEmployeesByEmailAddress', Queries.getEmployeesByEmailAddress);
        // note: the email in the token equates to the username in the AHR database
        query.setParameter('@emailAddresses', email);

        const companyExistsInTenantPayload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };

        const result: any = await utilService.invokeInternalService(
            'queryExecutor',
            companyExistsInTenantPayload,
            InvocationType.RequestResponse,
        );
        const userRecords = result?.recordset.filter((record) => record.ID === employeeId);
        const userExistsInCompany = userRecords.length > 0;

        return Promise.resolve(userExistsInCompany);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates that an employee is a direct report of a manager user.
 * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
 * @param {string} email: The email address associated with the user.
 * @param {string} employeeId: The unique identifier for an employee.
 */
 export async function validateDirectReportOfManagerUser(tenantId: string, email: string, employeeId: string): Promise<boolean> {
    console.info('utilService.validateManagerUserWithDirectReport');

    try {
        // employeeId value must be integral
        if (Number.isNaN(Number(employeeId))) {
            const errorMessage = `${employeeId} is not a valid employeeId`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }

        const query: ParameterizedQuery = new ParameterizedQuery('getDirectReportOfManagerByEmailAddressAndEmployeeId', Queries.getDirectReportOfManagerByEmailAddressAndEmployeeId);
        // note: the email in the token equates to the username in the AHR database
        query.setParameter('@emailAddress', email);
        query.setParameter('@employeeId', employeeId);

        const directReportOfManagerPayload: DatabaseEvent = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        };

        const result: any = await utilService.invokeInternalService(
            'queryExecutor',
            directReportOfManagerPayload,
            InvocationType.RequestResponse,
        );

        const employeeIsDirectReport = result.recordset.length > 0;

        return Promise.resolve(employeeIsDirectReport);
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Validates whether that the invoking user has the access right to use the endpoint either by having an admin role or being the employee himself.
 * @param {SecurityContext} securityContext: represents data pulled from the token when it is verified.
 * @param {APIGatewayProxyEvent} event: The API request event.
 * @param {string[]} authorizedRoles: The array of user authorized roles strings.
 */
export async function checkAuthorization(
    securityContext: SecurityContext,
    event: APIGatewayProxyEvent,
    authorizedRoles: string[],
): Promise<void> {
    console.info('utilService.checkAuthorization');
    const { tenantId, companyId, employeeId } = event.pathParameters || {};
    const {
        principal: { email },
        roleMemberships,
    } = securityContext;

    try {
        let isAuthorized: boolean;
        let isDirectReport: boolean;
        let roleMembershipsWithoutHrPersonaUser: string[];

        // Checks to see if the user has the hrManager(hr.persona.manager) role
        const userIsManager = roleMemberships.includes(Role.hrManager);
        // Checks to see if the roles you're authorizing includes hrManager(hr.persona.manager)
        const checkingIfUserIsManager = authorizedRoles.includes(Role.hrManager);
        // Checks if the user has the hrEmployee(hr.persona.user) role
        const userIsEmployee = roleMemberships.includes(Role.hrEmployee);
        // Checks to see the roles you're authorizing includes hrEmployee(hr.persona.user)
        const checkingIfUserIsEmployee = authorizedRoles.includes(Role.hrEmployee);

        if (userIsManager && checkingIfUserIsManager) {
            if(companyId && employeeId) isDirectReport = await utilService.validateDirectReportOfManagerUser(tenantId, email, employeeId);
            if (companyId && !employeeId) isDirectReport = await utilService.validateUserIsInCompany(tenantId, email, companyId);
        }
        // If the function is checking for the role hrEmployee(hr.persona.user), it validates the user with their own employee or company
        if (userIsEmployee && checkingIfUserIsEmployee) {
            if (companyId && employeeId) isAuthorized = await utilService.validateUserWithEmployee(tenantId, email, employeeId);
            if (companyId && !employeeId) isAuthorized = await utilService.validateUserIsInCompany(tenantId, email, companyId);
            // Otherwise check if the user has any of the remaining roles not including hrEmployee(hr.persona.user)
        } else {
            roleMembershipsWithoutHrPersonaUser = roleMemberships.filter((role) => role !== Role.hrEmployee);
            isAuthorized = await roleMembershipsWithoutHrPersonaUser.some((role) => authorizedRoles.includes(role));
        }

        if (!isAuthorized && !isDirectReport) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the access right to use this endpoint');
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(`Unable to authorize. Reason: ${error}`);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Ensures that the invoking user has access to the specified resource and runs the given query if authorized.
 * @param {string} tenantId: The unique identifier for the tenant.
 * @param {Resources} resourceType: The type of resource to be accessed.
 * @param {string} resourceId: The unique identifier for the resource being accessed.
 * @param {string} userEmail: The email address of the invoking user.
 * @param {Query} query: The query to run.
 * @returns: The result set of the executed query.
 */
export async function authorizeAndRunQuery(
    tenantId: string,
    resourceType: Resources,
    resourceId: string,
    userEmail: string,
    query: Query,
): Promise<any> {
    console.info('utilService.authorizeAndRunQuery');

    try {
        let accessQuery: ParameterizedQuery;
        switch (resourceType) {
            case Resources.Company:
                accessQuery = new ParameterizedQuery('CompanyAccess', Queries.companyAccess);
                accessQuery.setParameter('@companyId', resourceId);
                accessQuery.setParameter('@username', userEmail);
                break;
            default:
                throw new Error('Invalid resource type');
        }
        accessQuery.combineQueries(query);
        const payload = {
            tenantId,
            queryName: accessQuery.name,
            query: accessQuery.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        const resourceAccess: any = result.recordsets.splice(0, 1)[0];
        if (resourceAccess.length === 0) {
            throw errorService
                .getErrorResponse(20)
                .setDeveloperMessage(`This user does not have access to the ${resourceType} with id ${resourceId}`);
        }

        return result.recordsets;
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(`Unable to authorize. Reason: ${error}`);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * masks a given social security number
 * @param {string} ssn: Social Security Number in form "XXX-XX-XXXX"
 * @returns: The masked SSN, showing only the last four digits
 */
export function MaskSSN(ssn: string): string {
    const ssnSections = ssn.split('-');
    const lastFourDigits: string = ssnSections[ssnSections.length - 1];
    return 'XXX-XX-' + lastFourDigits;
}

export async function generateAdminToken(): Promise<string> {
    console.info('util.service.generateAdminToken');
    const credentials = JSON.parse(await getSecret(configService.getTenantAdminCredentialsId()));
    return await ssoService.getAccessTokenByClientCredentials(credentials.apiKey, credentials.apiSecret, credentials.audience);
}

export async function generateAssumedRoleToken(roleName: string, roleTenantId: string): Promise<string> {
    console.info('util.service.generateAssumedRoleToken');
    const credentials = JSON.parse(await getSecret(configService.getTenantAdminCredentialsId()));
    return await ssoService.getRoleAccessTokenByClientCredentials(
        credentials.apiKey,
        credentials.apiSecret,
        credentials.audience,
        roleName,
        roleTenantId,
    );
}

/**
 * Removes special characters in an S3 object name.
 * Reference: https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html
 * @param {string} key: The unique identifier of an S3 object
 * @returns {string}: The sanitized key
 */
export function sanitizeForS3(key: string): string {
    console.info('utilService.sanitizeForS3');
    // eslint-disable-next-line no-useless-escape
    const charactersToReplace = /[\\{^}%`\]">\[~<#\| ]/g;
    return key.replace(charactersToReplace, '');
}

const s3Client = new AWS.S3({
    region: configService.getAwsRegion(),
    useAccelerateEndpoint: true,
});

/**
 * Appends a guid suffix to a filename to indicate duplication
 * @example
 *  // returns duplicate-PPBqWA9.pdf
 *  letappendDuplicationSuffix('duplicate.pdf');
 * @param {string} filenameWithExtension
 * @returns {string}: The file name with a duplication suffix
 */
export function appendDuplicationSuffix(filenameWithExtension: string): string {
    console.info('util.service.appendDuplicationSuffix');
    const [filename, extension] = splitFilename(filenameWithExtension);
    return `${filename}-${shortid.generate()}${extension}`;
}

export async function checkForFileExistence(
    key: string,
    fileName: string,
    tenantId: string,
    companyId: string,
    employeeId?: string,
): Promise<string[]> {
    console.info('util.service.checkForFileExistence');

    try {
        const objectMetadata = await s3Client
            .headObject({
                Bucket: configService.getFileBucketName(),
                Key: key,
            })
            .promise();

        if (objectMetadata) {
            const newFileName = appendDuplicationSuffix(fileName);
            let newKey = `${tenantId}/${companyId}`;
            newKey += employeeId ? `/${employeeId}` : '';
            return [newFileName, `${newKey}/${newFileName}`];
        }
    } catch (missingError) {
        // We really don't mind since we expect it to be missing
        return [fileName, key];
    }
}

export async function withTimeout(callee: any, timeout: number): Promise<any> {
    const throwOnTime = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Request timed out'));
        }, timeout);
    });
    const result = callee();
    return Promise.race([result, throwOnTime]);
}

export async function getSignedUrlSync(operation: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
        s3Client.getSignedUrl(operation, params, (err, url) => {
            if (err) reject(err);
            else resolve(url);
        });
    });
}

/**
 * Parses a specific query parameter value into a boolean value
 * @param {any} queryParams: The query parameters that were specified by the user
 * @param {string} key: The key of the queryParam that needs to be parsed into a boolean
 * @returns {boolean}: Boolean value of the parsed key in queryParams
 */
export function parseQueryParamsBoolean(queryParams: any, key: string) {
    console.info('util.service.parseQueryParamsBoolean');

    if (key in queryParams === false) throw Error(`Key '${key}' does not exist in queryParams`);

    if (queryParams[key] === 'true') {
        return true;
    } else if (queryParams[key] === 'false') {
        return false;
    } else {
        throw errorService.getErrorResponse(60).setDeveloperMessage(`'${queryParams[key]}' is not a boolean value.`);
    }
}

/**
 * Validates the keys of the query parameter to an array of keys
 * @param {any} queryParams: The query parameters that were specified by the user
 * @param {string} allowedQueryParams: The keys that are valid in the queryParam
 */
export function validateQueryParams(queryParams: any, allowedQueryParams: string[]) {
    console.info('util.service.validateQueryParams');

    if (queryParams) {
        if (!Object.keys(queryParams).every((param) => allowedQueryParams.includes(param))) {
            throw errorService
                .getErrorResponse(60)
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${allowedQueryParams.join(',')}. See documentation for usage.`); 
        }      
    }
}

/**
 * Retrieve an Evo access token using an HR token
 * @param {string} tenantId: Tenant Id of the user
 * @param {string} accessToken: HR access token
 */
export async function getEvoTokenWithHrToken(tenantId: string, accessToken: string): Promise<string> {
    console.info('util.service.getEvoTokenWithHrToken');

    try {
        const payrollApiCredentials = await utilService.getPayrollApiCredentials(tenantId);
        const decodedToken: any = jwt.decode(accessToken);
        const ssoToken = await utilService.getSSOToken(tenantId, decodedToken.applicationId);
        return await ssoService.getAccessToken(
            tenantId,
            ssoToken,
            payrollApiCredentials.evoApiUsername,
            payrollApiCredentials.evoApiPassword,
        );
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }

        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}

/**
 * Pauses code execution based on the provided amount of time
 * @param {number} ms: the number of milliseconds to wait
 */
export async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Performs an API call to check if a URL is live
 * @param {string} url: the URL to check
 */
export async function urlExists(url: string): Promise<boolean> {
    try {
        await request(`https://${url}`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Returns the age on a benefit plan start date as an integer based on a date string and plan start date
 * @param {string} birthDateString: birth date string
 * @param {string} planStartDateString: benefit plan start date string
 * @returns {number} Returns age of insured on benefit plan start date
 */
export async function getAgeOnBenefitPlanStartDate(birthDateString, planStartDateString): Promise<number> {
    const planStartDate = new Date(planStartDateString);
    const birthDate = new Date(birthDateString);
    let age = planStartDate.getFullYear() - birthDate.getFullYear();
    const m = planStartDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && planStartDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * Calculates number of pay periods per year based on pay frequency code and deduction frequency code
 * @param {string} payFrequencyCode: pay frequency string 
 * @param {string} deductionFrequencyCode: deduction frequency string
 * @returns {number} Returns number of pay periods per year
 */
export async function getPaysPerYear(payFrequencyCode, deductionFrequencyCode): Promise<number> {
    // We assume monthly pay frequency if no code exists
    let paysPerYear = 12;
    switch(payFrequencyCode) {
        case 'Weekly':
            switch(deductionFrequencyCode) {
                case 'EveryPay':
                    paysPerYear = 52;
                    break;
                case 'Block5':
                    paysPerYear = 50;
                    break;
            }
        case 'BiWeekly':
            switch(deductionFrequencyCode) {
                case 'EveryPay':
                    paysPerYear = 26;
                    break;
                case 'Block5':
                    paysPerYear = 24;
                    break;
            }
        case 'SemiMonthly': 
            paysPerYear = 24;
            break;
        case 'Quarterly':
            paysPerYear = 4;
            break;
        case 'Daily':
            paysPerYear = 365;
    }
    return paysPerYear
}

/**
 * Validates that a file name contains the given extension
 * @param {string} fileName: The identifier of file name.
 * @param {string[]} extensions: The target extensions.
 */
export function validateExtensions(fileName: string, extensions: string[]): void {
    console.info('utilService.validateExtensions');

    if (extensions.length == 0)
    {
        const errorMessage = `No extension provided for validation`;
        throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
    }

    let fileExtension = fileName.split('.')[fileName.split('.').length - 1];

    extensions.forEach((extension) => {   
        fileExtension = fileExtension.toLowerCase();
        extension = extension.toLowerCase();

        if (fileExtension != extension) {
            const errorMessage = `File with extension not allowed`;
            throw errorService.getErrorResponse(30).setDeveloperMessage(errorMessage);
        }
    });    
}

export async function StartStateMachineExecution(stepFunctionArnName, stepFunctionInputs) {
    const stepFunctions = new AWS.StepFunctions();
    
    const stepFunctionsParams = {
        stateMachineArn: stepFunctionArnName,
        input: JSON.stringify(stepFunctionInputs),
    };

    return await stepFunctions.startExecution(stepFunctionsParams).promise();
}

export async function getConnectionsFromDynamoDBUsingAccessToken(accessToken: string) {
    // authenticate
    const securityContext = await new SecurityContextProvider().getSecurityContext({
        event: {
            headers: {
                Authorization: accessToken,
            },
        },
    });

    const {
        principal: { id: userId },
    } = securityContext;

    const client = new AWS.DynamoDB.DocumentClient({
        region: configService.getAwsRegion(),
    });

    const connections = await client
        .scan({
            TableName: 'WebSocketConnections',
            FilterExpression: '#UserId = :UserId',
            ExpressionAttributeNames: {
                '#UserId': 'UserId',
            },
            ExpressionAttributeValues: {
                ':UserId': userId,
            },
        })
        .promise();

    return connections;
}

/**
 * Sanitize a string for a sql command
 * @param {string} value: The text value to be sanitized.
 */
export function sanitizeStringForSql(value: string): string {
    if (value && typeof value === 'string'){
        value = value.replace(/'/g, "''");
    }
    return value;
}

/**
 * Validates if the user have access to the requested resource.
 * @param {SecurityContext} securityContext: represents data pulled from the token when it is verified.
 * @param {APIGatewayProxyEvent} event: The API request event.
 * @param {atEnums.Systems} systemName: The name of the system that owns the resource.
 * @param {atEnums.ATSClaims} resourceName: The unique identifier of the resource.
 * @param {atEnums.Operation} operationName: The unique identifier of the operation.
 * @param {boolean} mustHaveCompanyIdInPathParameters: A flag to check if companyId is mandatory.
 */
export async function checkUserAccessPermissions(
    securityContext: SecurityContext,
    event: APIGatewayProxyEvent,
    systemName: atEnums.Systems, 
    resourceName: atEnums.ATSClaims,
    operationName: atEnums.Operations = atEnums.Operations.READ,
    mustHaveCompanyIdInPathParameters: boolean = true,
): Promise<void> {
    console.info('utilService.checkUserAccessPermissions');

    try {
        let isAuthorized: boolean = false;

        //
        // extracting information
        //
        const { principal: { username: userName, enabled: userEnabled, givenName: firstName, surname: lastName } } = securityContext;
        const { tenantId, companyId } = event.pathParameters;
        const companies = companyId ? companyId.split('-').map(val => parseInt(val)) : [];
        //console.log({ userName, userEnabled, firstName, lastName, systemName, operationName, resourceName, tenantId, companyId, companies });

        //
	    // query database to get user permissions
        //
        const query = new ParameterizedQuery('getUserPermissions', Queries.getUserPermissions);
        query.setStringParameter('@UserName', userName);

        const payload = { 
            tenantId, 
            queryName: query.name, 
            query: query.value, 
            queryType: QueryType.Simple 
        } as DatabaseEvent;

        const dbResults: any = await utilService.invokeInternalService('queryExecutor', payload, utilService.InvocationType.RequestResponse);
        const permissions: atInterfaces.IUserPermissionsGET[] = dbResults.recordset;
        //console.log(permissions);

	    //
        // checking permissions
        //
        if (!userEnabled) {
            throw errorService.getErrorResponse(11).setMoreInfo(`The user [${lastName}, ${firstName}] with unique name [${userName}] is disabled`);
        }
        if (permissions && permissions.length > 0){
            //
            // if user is admin just authorize, doesn't matter the company or the operation
            //
            if (permissions.filter(p => p.systemName.toUpperCase() === systemName.toUpperCase() && p.isAdmin === true).length > 0) {
                isAuthorized = true;
            } else {
                if (mustHaveCompanyIdInPathParameters) {
                    //
                    // checking if the user have access to the companies
                    //
                    if (companies && companies.length > 0) {
                        let companyWithoutAccess = '';
                        for(let i = 0; i < companies.length; i++) {
                            switch (operationName) {
                                case atEnums.Operations.READ:
                                    if (permissions.filter(p => 
                                        p.companyId == companies[i] &&
                                        p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                        p.claimsValue.toUpperCase() === resourceName.toUpperCase()).length === 0)
                                    {
                                        companyWithoutAccess += `${companies[i]}-`;
                                    }
                                    break;
                                case atEnums.Operations.ADD:
                                    if (permissions.filter(p =>
                                        p.companyId == companies[i] &&
                                        p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                        p.claimsValue.toUpperCase() === resourceName.toUpperCase() &&
                                        p.canAdd === true).length === 0)
                                    {
                                        companyWithoutAccess += `${companies[i]}-`;
                                    }
                                    break;
                                case atEnums.Operations.EDIT:
                                    if (permissions.filter(p =>
                                        p.companyId == companies[i] &&
                                        p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                        p.claimsValue.toUpperCase() === resourceName.toUpperCase() &&
                                        p.canEdit === true).length === 0)
                                    {
                                        companyWithoutAccess += `${companies[i]}-`;
                                    }
                                    break;
                                case atEnums.Operations.DELETE:
                                    if (permissions.filter(p =>
                                        p.companyId == companies[i] &&
                                        p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                        p.claimsValue.toUpperCase() === resourceName.toUpperCase() &&
                                        p.canDelete === true).length === 0)
                                    {
                                        companyWithoutAccess += `${companies[i]}-`;
                                    }
                                    break;
                                default:
                                    throw errorService.getErrorResponse(11).setMoreInfo(`The operation [${operationName}] is invalid`);
                            }
                        }
                        
                        if (companyWithoutAccess.length > 0) {
                            throw errorService.getErrorResponse(11).setMoreInfo(`The user does not have the access to the companies: ${companyWithoutAccess.substring(0, companyWithoutAccess.length - 1)} to do the operation: [${operationName}] on the resource: [${resourceName}]`);
                        }
                        
                        isAuthorized = true;
    
                    } else {
                        throw errorService.getErrorResponse(11).setMoreInfo(`The user does not have the access ${companyId ? `to the companies: ${companyId}` : ''} to do the operation: [${operationName}] on the resource: [${resourceName}]`);
                    }
                } else {
                    //
                    // we don't need to check for companies so we will check if the user have access to the resource
                    //
                    let resourceWithoutAccess = '';
                    switch (operationName) {
                        case atEnums.Operations.READ:
                            if (permissions.filter(p => 
                                p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                p.claimsValue.toUpperCase() === resourceName.toUpperCase()).length === 0)
                            {
                                resourceWithoutAccess += resourceName;
                            }
                            break;
                        case atEnums.Operations.ADD:
                            if (permissions.filter(p =>
                                p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                p.claimsValue.toUpperCase() === resourceName.toUpperCase() &&
                                p.canAdd === true).length === 0)
                            {
                                resourceWithoutAccess += resourceName;
                            }
                            break;
                        case atEnums.Operations.EDIT:
                            if (permissions.filter(p =>
                                p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                p.claimsValue.toUpperCase() === resourceName.toUpperCase() &&
                                p.canEdit === true).length === 0)
                            {
                                resourceWithoutAccess += resourceName;
                            }
                            break;
                        case atEnums.Operations.DELETE:
                            if (permissions.filter(p =>
                                p.systemName.toUpperCase() === systemName.toUpperCase() && 
                                p.claimsValue.toUpperCase() === resourceName.toUpperCase() &&
                                p.canDelete === true).length === 0)
                            {
                                resourceWithoutAccess += resourceName;
                            }
                            break;
                        default:
                            throw errorService.getErrorResponse(11).setMoreInfo(`The operation [${operationName}] is invalid`);
                    }
                    
                    if (resourceWithoutAccess.length > 0) {
                        throw errorService.getErrorResponse(11).setMoreInfo(`The user does not have the access to do the operation: [${operationName}] on the resource: [${resourceName}]`);
                    }
                    
                    isAuthorized = true;
                }
            }
        } else {
            throw errorService.getErrorResponse(11).setMoreInfo(`The user does not have permissions configured`);
        }

        if (!isAuthorized) {
            throw errorService.getErrorResponse(11).setMoreInfo('The user does not have the access right to use this endpoint');
        }
    } catch (error) {
        if (error instanceof ErrorMessage) {
            throw error;
        }
        console.error(error);
        throw errorService.getErrorResponse(0);
    }
}


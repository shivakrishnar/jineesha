import * as validate from '@smallwins/validate';
import * as AWS from 'aws-sdk';
import { ConnectionPool, IResult } from 'mssql';
import * as nJwt from 'njwt';
import * as request from 'superagent';
import * as util from 'util';
import * as uniqueifier from 'uuid/v4';
import { ObjectSchema } from 'yup';
import * as configService from './config.service';
import * as errorService from './errors/error.service';

import { APIGatewayEvent, Context, ProxyCallback, ProxyResult, ScheduledEvent } from 'aws-lambda';
import { Headers } from './api/models/headers';
import { ErrorMessage } from './errors/errorMessage';
import { SecurityContext } from './internal-api/authentication/securityContext';

import { INotificationEvent } from './internal-api/notification/events';

import { Queries } from './queries/queries';
import { Query } from './queries/query';
import * as servicesDao from './services.dao';

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
export function parseJson(value: any, rethrowOnError: boolean = false): any {
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
}

function isHttpResponse<T>(response: any): response is IHttpResponse<T> {
    return response && response.statusCode !== undefined && (response.headers !== undefined || response.body !== undefined);
}

/**
 * Handle an API Gateway event and make the appropriate callback. Response from delegate can be a POJO or an IHttpResponse.
 */
export function gatewayEventHandler<T>(
    delegate: (gatewayEventInput: IGatewayEventInput) => Promise<T | IHttpResponse<T>>,
): (event: ApiInvocationEvent, context: Context, callback: ProxyCallback) => void {
    return (event: ApiInvocationEvent, context: Context, callback: ProxyCallback): void => {
        // Below we are intentionally invoking an IIFE because the code inside is async, but the Lambda
        // handler signature is a void function. The try/catch ensures that the callback is always invoked,
        // so we can safely discard the returned Promise<void>.

        if (isLambdaWarmupInvocation(event)) {
            console.log('warm up invocation');
            return;
        }

        event = event as APIGatewayEvent;

        (async () => {
            try {
                const requestContext: any = event.requestContext;
                const json = requestContext.authorizer ? requestContext.authorizer.principalId : undefined;
                const securityContext = json ? SecurityContext.fromJSON(json) : undefined;

                let requestBody: any;
                if (event.body) {
                    requestBody = parseJson(event.body, true);
                }

                const result = await delegate({ securityContext, event, requestBody });

                if (isHttpResponse(result)) {
                    callback(undefined, buildLambdaResponse(result.statusCode, result.headers, result.body, event.path));
                } else {
                    callback(undefined, buildLambdaResponse(result ? 200 : 204, undefined, result, event.path));
                }
            } catch (error) {
                const statusCode = error.statusCode || 500;
                callback(undefined, buildLambdaResponse(statusCode, undefined, error, event.path));
            }
        })();
    };
}

/**
 * Builds a Lambda response object which can be returned to API Gateway.
 */
export function buildLambdaResponse(statusCode: number, headers: Headers, input: any, uri: string): ProxyResult {
    console.info(`utilService.buildLambdaResponse (httpStatusCode : ${statusCode}; uri : ${uri})`);
    if (headers) {
        headers.accessControlHeader();
    } else {
        headers = new Headers().accessControlHeader();
    }

    const response: ProxyResult = { statusCode, headers: headers.toJSON(), body: JSON.stringify(input) };

    return response;
}

export function determineLimit(limit: number): number {
    if (limit && limit >= 0 && limit <= configService.getPageLimitMax()) {
        return limit;
    } else {
        return configService.getPageLimitDefault();
    }
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
        // @ts-ignore
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
        console.log('getting secret..');
        const data = await client.getSecretValue({ SecretId: id }).promise();
        return data.SecretString;
    } catch (error) {
        console.error(`something blew up: ${JSON.stringify(error)}`);
        throw new Error('Something went wrong');
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
        // tslint:disable prefer-for-of
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
        // tslint:enable prefer-for-of
        return true;
    }
    return false;
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
        FunctionName: `hr-services-internal-${configService.getStage()}-eventNotifier`,
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
        FunctionName: `hr-services-internal-${configService.getStage()}-auditLogger`,
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

/**
 * Formats a given date to the desired locale.
 * @param {string} date: A string representation of an existing date
 * @param {string} locale: The locale to format the date to.
 * @return {string}: A string representation of the formatted date; empty string if
 * provided date was null or undefined.
 */
export function formatDateToLocale(date: string, locale: string = 'en-US'): string {
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
 * @param {ConnectionPool} pool: The database connection for the tenant
 * @param {string} accessToken: The authorizing access token
 */
export async function clearCache(pool: ConnectionPool, accessToken: string): Promise<void> {
    console.info('audit.service.clearCache');

    const tenantInfo = new Query('TenantInfo', Queries.tenantInfo);
    const result: IResult<any> = await servicesDao.executeQuery(pool.transaction(), tenantInfo);

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
        await request
            .post(`https://${tenant[0].applicationUrl}/Classes/Service/hrnextDataService.asmx/ClearCache`)
            .send(JSON.stringify({ accessToken }))
            .set('Content-Type', 'application/json');
    }
}

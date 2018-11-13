import * as validate from '@smallwins/validate';
import * as AWS from 'aws-sdk';
import * as util from 'util';
import { ObjectSchema } from 'yup';
import * as configService from './config.service';
import * as errorService from './errors/error.service';

import { APIGatewayEvent, Context, ProxyCallback, ProxyResult } from 'aws-lambda';
import { DirectDeposit } from './api/direct-deposits/directDeposit';
import { SecurityContext } from './authentication/securityContext';
import { ErrorMessage } from './errors/errorMessage';
import { Headers } from './models/headers';

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
export function gatewayEventHandler<T>(delegate: (gatewayEventInput: IGatewayEventInput) => Promise<T | IHttpResponse<T>>): (event: APIGatewayEvent, context: Context, callback: ProxyCallback) => void {
  return (event: APIGatewayEvent, context: Context, callback: ProxyCallback): void => {

    // Below we are intentionally invoking an IIFE because the code inside is async, but the Lambda
    // handler signature is a void function. The try/catch ensures that the callback is always invoked,
    // so we can safely discard the returned Promise<void>.

    (async () => {
      try {
        const requestContext: any = event.requestContext;
        const json = requestContext.authorizer ? requestContext.authorizer.principalId : undefined;
        const securityContext = SecurityContext.fromJSON(json);

        let requestBody: any;
        if (event.body) {
          requestBody = parseJson(event.body, true);
        }

        const result = await delegate({ securityContext, event,  requestBody });

        if (isHttpResponse(result)) {
          callback(undefined, buildLambdaResponse(result.statusCode, result.headers, result.body, event.path));
        } else {
          callback(undefined, buildLambdaResponse((result ? 200 : 204), undefined, result, event.path));
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
export function validateAndThrow(params: { [name: string]: string }, schema: { [name: string]: { required: boolean, type: any } }): void {
  const errors = validate(params, schema);
  if (errors) {
    throw errorService.getErrorResponse(30).setDeveloperMessage(errors[0].message).setMoreInfo(errors.toString());
  }
}

/**
 * Validate an object against a schema, and throw the appropriate exception if it fails.
 * @param schema Yup schema to validate the request body against.
 * @param requestBody Request body to validate.
 */
export async function validateRequestBody(schema: ObjectSchema<{}>, requestBody: DirectDeposit): Promise<void> {
  await schema.validate(requestBody, { abortEarly: false }).catch((error) => {
    console.error(error.errors[0]);
    throw errorService.getErrorResponse(30).setDeveloperMessage(error.errors[0]);
  });
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

  const client = new AWS.SecretsManager({
    endpoint: configService.getSecretsAwsEndpoint(),
    region: configService.getAwsRegion()
  });

  const data = await client.getSecretValue({ SecretId: id }).promise();
  return data.SecretString;
}

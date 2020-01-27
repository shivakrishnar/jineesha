import { APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { SecurityContextProvider } from './internal-api/authentication/securityContextProvider';
import * as mockData from './mock-data/gateway-event-mock-data';
import * as utilService from './util.service';
jest.mock('./internal-api/authentication/securityContextProvider');

describe('utilService.gatewayEventHandlerV2', () => {
    let apiGatewayEvent: APIGatewayEvent;
    let context: Context;

    beforeEach(() => {
        apiGatewayEvent = mockData.apiGatewayEvent;
        context = mockData.context;
    });

    test('correctly parses a valid JSON body', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const testRequestBody = {
            testProp: 123,
        };
        apiGatewayEvent.body = JSON.stringify(testRequestBody);

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(true);
            expect(body.requestBody).toEqual(testRequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });

    test('sets requestBody to the initial JSON string when supplied with invalid JSON', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const invalidJSONRequestBody = '{ property: "Invalid" }';
        apiGatewayEvent.body = invalidJSONRequestBody;

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(false);
            expect(body.requestBody).toEqual(invalidJSONRequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });

    test('decodes and correctly parses a valid base64 encoded JSON request body', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const testRequestBody = {
            testProp: 123,
        };
        const base64RequestBody = btoa(JSON.stringify(testRequestBody));
        apiGatewayEvent.body = base64RequestBody;
        apiGatewayEvent.isBase64Encoded = true;

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(true);
            expect(body.requestBody).toEqual(testRequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });

    test('sets requestBody to the initial string when supplied with a non-JSON base64 encoded request body', async (done) => {
        const mockGetSecurityContext = jest.fn();
        SecurityContextProvider.prototype.getSecurityContext = mockGetSecurityContext;
        mockGetSecurityContext.mockReturnValue(Promise.resolve({}));

        const base64RequestBody = btoa('This is not a json');
        apiGatewayEvent.body = base64RequestBody;
        apiGatewayEvent.isBase64Encoded = true;

        const handler = utilService.gatewayEventHandlerV2(
            async ({ securityContext, event, requestBody }: utilService.IGatewayEventInput) => {
                return {
                    statusCode: 200,
                    body: {
                        isObject: typeof requestBody === 'object',
                        requestBody,
                    },
                };
            },
        );

        const callback: ProxyCallback = (error, result) => {
            const body = JSON.parse(result.body);
            expect(body.isObject).toEqual(false);
            expect(body.requestBody).toEqual(base64RequestBody);
            done();
        };

        return await handler(apiGatewayEvent, context, callback);
    });
});

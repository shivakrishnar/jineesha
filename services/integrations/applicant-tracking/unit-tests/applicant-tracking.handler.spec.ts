// import 'reflect-metadata'; // required by asure.auth dependency

// import { IGatewayEventInput } from '../../../util.service';
// import { eventCallbackDelegate } from '../src/handler';
// import { ErrorMessage } from '../../../errors/errorMessage';
// import * as applicantTrackingService from '../src/applicant-tracking.service';
// import * as jzMockCallbackData from './mock-data/jazzhrCallback-mock-data';

// describe('Configuring Webhook in JazzHR', () => {
//     test('returns response 200 verifying JazzHR special header', () => {
//         const handlerInput: IGatewayEventInput = {
//             securityContext: null,
//             event: jzMockCallbackData.jzVerifyCallback,
//             requestBody: jzMockCallbackData.jzRequestBody,
//         };

//         (applicantTrackingService as any).validateCompanySecret = jest.fn(() => {
//             return {};
//         });

//         return eventCallbackDelegate(handlerInput).then((response) => {
//             expect(response.statusCode).toEqual(200);
//         });
//     });

//     test('returns 400 error.Not authorized when query string parameter id is missing', () => {
//         const handlerInput: IGatewayEventInput = {
//             securityContext: null,
//             event: jzMockCallbackData.jzUnsupportedQueryParam,
//             requestBody: jzMockCallbackData.jzRequestBody,
//         };

//         return eventCallbackDelegate(handlerInput).catch((error: any) => {
//             expect(error).toBeInstanceOf(ErrorMessage);
//             expect(error.statusCode).toEqual(400);
//             expect(error.code).toEqual(30);
//             expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
//             const developerMessage = 'Unsupported query parameter(s) supplied';
//             expect(error.developerMessage).toEqual(developerMessage);
//             const moreInfo = 'Available query parameters: id. See documentation for usage.';
//             expect(error.moreInfo).toEqual(moreInfo);
//         });
//     });

//     test('returns 400 error.Not authorized when delimiter is missing in query string value format', () => {
//         const handlerInput: IGatewayEventInput = {
//             securityContext: null,
//             event: jzMockCallbackData.jzUnsupportedQueryValueFormat,
//             requestBody: jzMockCallbackData.jzRequestBody,
//         };

//         return eventCallbackDelegate(handlerInput).catch((error: any) => {
//             expect(error).toBeInstanceOf(ErrorMessage);
//             expect(error.statusCode).toEqual(400);
//             expect(error.code).toEqual(30);
//             expect(error.message).toEqual('The provided request object was not valid for the requested operation.');
//             const developerMessage = 'Unsupported value';
//             expect(error.developerMessage).toContain(developerMessage);
//             const moreInfo = 'Value format for id: tenantId_companyId.';
//             expect(error.moreInfo).toEqual(moreInfo);
//         });
//     });

//     test('returns 401 error.Not authorized when request is without JazzHR special header', () => {
//         const handlerInput: IGatewayEventInput = {
//             securityContext: null,
//             event: jzMockCallbackData.jzNoSpecialHeader,
//             requestBody: jzMockCallbackData.jzRequestBody,
//         };

//         return eventCallbackDelegate(handlerInput).catch((error: any) => {
//             expect(error).toBeInstanceOf(ErrorMessage);
//             expect(error.statusCode).toEqual(401);
//             expect(error.code).toEqual(11);
//             expect(error.message).toEqual('User is not authorized.');
//             const developerMessage = 'The user does not have authorization to use this endpoint.';
//             expect(error.developerMessage).toEqual(developerMessage);
//         });
//     });
// });

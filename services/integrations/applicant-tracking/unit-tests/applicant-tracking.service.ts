// import 'reflect-metadata'; // required by asure.auth dependency

// import * as utilService from '../../../util.service';
// import * as applicantTrackingService from '../src/applicant-tracking.service';
// import * as mockData from './mock-data/mock-data';
// import { setup } from '../../../unit-test-mocks/mock';
// import * as request from 'request-promise-native';
// import { ErrorMessage } from '../../../errors/errorMessage';

// describe('applicantTrackingService.applicantDataImport', () => {
//     beforeEach(() => {
//         setup();
//     });

//     test('creates applicant data', async () => {
//         (request as any).get = jest.fn(() => {
//             return Promise.resolve(JSON.stringify(mockData.documentResponse));
//         });

//         (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
//             if (payload.queryName === 'ApplicantCreate') {
//                 return Promise.resolve(mockData.outputResponseObject);
//             } else if (payload.queryName === 'DocumentCreate') {
//                 return Promise.resolve(mockData.emptyDBResponse);
//             }
//         });

//         expect(
//             await applicantTrackingService.createApplicantData(mockData.tenantId, mockData.companyId, mockData.postObject),
//         ).toBeUndefined();
//     });
// });

// describe('applicantTrackingService.validateCompanySecret', () => {
//     test('accepts valid company secret in signature', async () => {
//         (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
//             if (payload.queryName === 'GetJazzhrSecretKeyByCompanyId') {
//                 return Promise.resolve(mockData.jazzhrSecretKeyDBResponse);
//             }
//         });

//         expect(
//             await applicantTrackingService.validateCompanySecret(
//                 mockData.tenantId,
//                 mockData.companyId,
//                 mockData.verifyContent,
//                 mockData.incomingValidSignature,
//             ),
//         ).toBeUndefined();
//     });

//     test('returns 401 error.Not authorized when company secret in signature is invalid', async () => {
//         (utilService as any).invokeInternalService = jest.fn((serviceName, payload) => {
//             if (payload.queryName === 'GetJazzhrSecretKeyByCompanyId') {
//                 return Promise.resolve(mockData.jazzhrSecretKeyDBResponse);
//             }
//         });

//         return await applicantTrackingService
//             .validateCompanySecret(mockData.tenantId, mockData.companyId, mockData.verifyContent, mockData.incomingInvalidSignature)
//             .catch((error: any) => {
//                 expect(error).toBeInstanceOf(ErrorMessage);
//                 expect(error.statusCode).toEqual(401);
//                 expect(error.code).toEqual(11);
//                 expect(error.message).toEqual('User is not authorized.');
//                 const developerMessage = 'The user does not have authorization to use this endpoint.';
//                 expect(error.developerMessage).toEqual(developerMessage);
//             });
//     });
// });

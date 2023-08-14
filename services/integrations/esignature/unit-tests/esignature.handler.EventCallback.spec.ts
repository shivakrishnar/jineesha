// import 'reflect-metadata'; // required by asure.auth dependency

// import { setup } from '../../../unit-test-mocks/mock';
// import * as utilService from '../../../util.service';
// import { IGatewayEventInput } from '../../../util.service';
// import { eventCallbackDelegate } from '../src/handler';

// import {
//     hsSignatureRequestDownloadableCallback,
//     hsSignatureRequestDownloadableDecodedBody,
//     hsSignatureRequestSentCallback,
//     hsSignatureRequestSentDecodedBody,
//     hsTestCallback,
//     hsTestDecodedBody,
//     invalidCallback,
//     invalidCallbackDecodedBody,
//     nonHsCallback,
//     nonHsDecodedBody,
// } from './mock-data/hellosignCallback-mock-data';

// const actualConsoleInfo = global.console.info;

// describe('esignatureHandler.eventCallback', () => {
//     beforeEach(() => {
//         setup();
//         global.console.info = jest.fn();
//     });

//     afterAll(() => {
//         global.console.info = actualConsoleInfo;
//     });

//     test('Passes parsed event body to the callback service if it is signature request downloadable callback', () => {
//         const handlerInput: IGatewayEventInput = {
//             securityContext: null,
//             event: hsSignatureRequestDownloadableCallback,
//             requestBody: hsSignatureRequestDownloadableDecodedBody,
//         };
//         return eventCallbackDelegate(handlerInput).then((response) => {
//             expect(console.info).toHaveBeenCalledWith('signature request downloadable');
//             expect(utilService.invokeInternalService).toHaveBeenCalledWith(
//                 'uploadSignedDocument',
//                 hsSignatureRequestDownloadableDecodedBody,
//                 utilService.InvocationType.Event,
//             );
//             expect(response).toEqual('Hello API Event Received');
//         });
//     });

//     test('Logs callback test event and responds if it is a HelloSign test callback', () => {
//         const handlerInput: IGatewayEventInput = { securityContext: null, event: hsTestCallback, requestBody: hsTestDecodedBody };
//         return eventCallbackDelegate(handlerInput).then((response) => {
//             expect(console.info).toHaveBeenCalledWith('callback test');
//             expect(utilService.invokeInternalService).not.toHaveBeenCalled();
//             expect(response).toEqual('Hello API Event Received');
//         });
//     });

//     //the following tests describe behavior that has not yet been implemented (described in MJ-5577)

//     test.skip('Logs general event and responds if it is any other HelloSign callback', () => {
//         const handlerInput: IGatewayEventInput = {
//             securityContext: null,
//             event: hsSignatureRequestSentCallback,
//             requestBody: hsSignatureRequestSentDecodedBody,
//         };
//         return eventCallbackDelegate(handlerInput).then((response) => {
//             expect(console.info).toHaveBeenCalled();
//             expect(utilService.invokeInternalService).not.toHaveBeenCalled();
//             expect(response).toEqual('Hello API Event Received');
//         });
//     });

//     test.skip('Does not log an event or respond if the event is not a HelloSign event', () => {
//         const handlerInput: IGatewayEventInput = { securityContext: null, event: nonHsCallback, requestBody: nonHsDecodedBody };
//         return eventCallbackDelegate(handlerInput).then((response) => {
//             expect(console.info).not.toHaveBeenCalled();
//             expect(utilService.invokeInternalService).not.toHaveBeenCalled();
//             expect(response).toEqual(null);
//         });
//     });

//     //this test not only is not yet implemented, but throws an error from the handler
//     test.skip('Does not log an event or respond if the event does not have a valid JSON body', () => {
//         const handlerInput: IGatewayEventInput = { securityContext: null, event: invalidCallback, requestBody: invalidCallbackDecodedBody };
//         return eventCallbackDelegate(handlerInput).then((response) => {
//             expect(console.info).not.toHaveBeenCalled();
//             expect(utilService.invokeInternalService).not.toHaveBeenCalled();
//             expect(response).toEqual(null);
//         });
//     });
// });

import { IGatewayEventInput } from '../../../util.service';
import * as mockData from './mock-data/jazzhrCallback-mock-data';
import { eventCallbackDelegate } from '../src/handler';
import { ErrorMessage } from '../../../errors/errorMessage';


describe('Configuring Webhook in JazzHR', () => {
    test('returns response 200 verifying JazzHR special header', () => {
        const handlerInput: IGatewayEventInput = {
            securityContext: null,
            event: mockData.jzVerifyCallback,
            requestBody: mockData.jzRequestBody,
        };

        return eventCallbackDelegate(handlerInput).then((response) => {
            expect(response.statusCode).toEqual(200);
        });
    });

    test('returns 401 error.Not authorized when request is without JazzHR special header X-JazzHR-Event', () => {
        const handlerInput: IGatewayEventInput = {
            securityContext: null,
            event: mockData.jzNoSpecialHeader,
            requestBody: mockData.jzRequestBody,
        };

        return eventCallbackDelegate(handlerInput)
            .catch((error: any) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(401);
                expect(error.code).toEqual(11);
                expect(error.message).toEqual('User is not authorized.');
                const developerMessage = 'The user does not have authorization to use this endpoint.';
                expect(error.developerMessage).toEqual(developerMessage);
            });
    });

    test('returns 401 error.Not authorized when tenantId missing in event path parameters', () => {
        const handlerInput: IGatewayEventInput = {
            securityContext: null,
            event: mockData.jzNoTenantId,
            requestBody: mockData.jzRequestBody,
        };

        return eventCallbackDelegate(handlerInput)
            .catch((error: any) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(401);
                expect(error.code).toEqual(11);
                expect(error.message).toEqual('User is not authorized.');
                const developerMessage = 'The user does not have authorization to use this endpoint.';
                expect(error.developerMessage).toEqual(developerMessage);
            });
    });

    test('returns 401 error.Not authorized when companyId missing in event path parameters', () => {
        const handlerInput: IGatewayEventInput = {
            securityContext: null,
            event: mockData.jzNoCompanyId,
            requestBody: mockData.jzRequestBody,
        };

        return eventCallbackDelegate(handlerInput)
            .catch((error: any) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(401);
                expect(error.code).toEqual(11);
                expect(error.message).toEqual('User is not authorized.');
                const developerMessage = 'The user does not have authorization to use this endpoint.';
                expect(error.developerMessage).toEqual(developerMessage);
            });
    });
});
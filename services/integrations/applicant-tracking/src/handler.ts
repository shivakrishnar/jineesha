import 'reflect-metadata'; // required by asure.auth dependency
import { IGatewayEventInput } from '../../../util.service';
import { Headers } from '../../models/headers';
import * as utilService from '../../../util.service';
import * as applicantTrackingService from './applicant-tracking.service';
import * as errorService from '../../../errors/error.service';
import { ErrorMessage } from '../../../errors/errorMessage';

/**
 *
 * Handles event callbacks from JazzHR
 */

export const eventCallbackDelegate = async ({ event, requestBody }: IGatewayEventInput) => {
    console.info('applicant-tracking.handler.eventCallback');

    const validQueryStringParameters: string[] = ['id'];

    const queryParams: any = event.queryStringParameters;

    if (queryParams) {
        // Check for unsupported query params
        if (!Object.keys(queryParams).every((param) => validQueryStringParameters.includes(param))) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error
                .setDeveloperMessage('Unsupported query parameter(s) supplied')
                .setMoreInfo(`Available query parameters: ${validQueryStringParameters.join(', ')}. See documentation for usage.`);
            throw error;
        }

        if (queryParams.id && !((queryParams.id as string).split('_').length == 2)) {
            const error: ErrorMessage = errorService.getErrorResponse(30);
            error.setDeveloperMessage(`Unsupported value: ${queryParams.id}`).setMoreInfo(`Value format for id: tenantId_companyId.`);
            throw error;
        }
    }

    const [tenantId, companyId] = (queryParams.id as string).split('_');

    utilService.checkBoundedIntegralValues({ company_request_id: companyId });

    await utilService.requirePayload(requestBody);

    utilService.normalizeHeaders(event);

    //check for JazzHR Special Header
    if (!(event.headers && event.headers['x-jazzhr-event'])) {
        //not authorized
        throw errorService.getErrorResponse(11);
    }

    //Verifying the JazzHR webhook configuration with Company Secret
    if (event.headers['x-jazzhr-event'] == 'VERIFY') {
        const signature = event.headers['x-jazzhr-signature'];

        //check if incoming signature is valid
        await applicantTrackingService.validateCompanySecret(tenantId, companyId, event.body, signature);

        return { statusCode: 200, headers: new Headers() };
    }

    if (event.headers['x-jazzhr-event'] == 'CANDIDATE-EXPORT') {
        await applicantTrackingService.createApplicantData(tenantId, companyId, requestBody);

        return { statusCode: 204, headers: new Headers() };
    }
};

/**
 * Handles the Candidate Export Event From JazzHR
 */
export const applicantDataImport = utilService.gatewayEventHandlerV2({
    allowAnonymous: true,
    delegate: eventCallbackDelegate,
});

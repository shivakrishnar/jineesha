import 'reflect-metadata'; // required by asure.auth dependency
import * as UUID from '@smallwins/validate/uuid';
import { IGatewayEventInput } from '../../../util.service';
import { Headers } from '../../models/headers';
import * as utilService from '../../../util.service';
import * as applicantTrackingService from './applicant-tracking.service';
import * as errorService from '../../../errors/error.service';

const companyResourceUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
};


 /**
  * 
  * Handles event callbacks from JazzHR
  */
export const eventCallbackDelegate = async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
        console.info('applicant-tracking.handler.eventCallback');

        utilService.normalizeHeaders(event);
        
        //check if source is JazzHR
        if (!(event.headers && event.headers['x-jazzhr-event'])) {
            //not authorized
            throw errorService.getErrorResponse(11);
        }

        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);

        if (event.headers['x-jazzhr-event'] == 'VERIFY') {
            return { statusCode: 200, headers: new Headers() };
        }


        if (event.headers['x-jazzhr-event'] == 'CANDIDATE-EXPORT') {
            await utilService.requirePayload(requestBody);

            const { tenantId, companyId } = event.pathParameters;

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


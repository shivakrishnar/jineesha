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

        utilService.validateAndThrow(event.pathParameters, companyResourceUriSchema);
        utilService.checkBoundedIntegralValues(event.pathParameters);
        
        const { tenantId, companyId } = event.pathParameters;
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


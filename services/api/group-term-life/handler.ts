import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../util.service';
import * as gtlService from './gtl.service';
import * as Yup from 'yup';

import * as UUID from '@smallwins/validate/uuid';
import { IGatewayEventInput } from '../../util.service';
import { Headers } from '../models/headers';

const headerSchema = {
    authorization: { required: true, type: String },
};

const employeeUriSchema = {
    tenantId: { required: true, type: UUID },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
};

const postSchema = Yup.object().shape({
  flatCoverage: Yup.boolean().required(),
  flatAmount: Yup.number(),
  earningsMultiplier: Yup.number(),
  workHours: Yup.number(),
});

const postValidationSchema = {
  flatCoverage: { required: true, type: Boolean },
  flatAmount: { required: false, type: Number },
  earningsMultiplier: { required: false, type: Number },
  workHours: { required: false, type: Number },
};

/**
 * Creates a GTL record
 */
 export const createGtlRecord = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
  console.info('gtl.handler.createGtlRecord');

  const { tenantId, companyId, employeeId } = event.pathParameters;

  utilService.normalizeHeaders(event);
  utilService.validateAndThrow(event.headers, headerSchema);
  utilService.validateAndThrow(event.pathParameters, employeeUriSchema);
  await utilService.validateRequestBody(postSchema, requestBody);
  utilService.checkAdditionalProperties(postValidationSchema, requestBody, 'group term life');

  const { principal: { email }, roleMemberships } = securityContext;

  const results = await gtlService.createGtlRecord(tenantId, companyId, employeeId, requestBody, email, roleMemberships);

  return results || { statusCode: 200, headers: new Headers() };
});

/**
* Retrieves GTL records for an employee
*/
export const listGtlRecordsByEmployee = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
  console.info('gtl.handler.listGtlRecordsByEmployee');

  const { tenantId, companyId, employeeId } = event.pathParameters;

  utilService.normalizeHeaders(event);
  utilService.validateAndThrow(event.headers, headerSchema);
  utilService.validateAndThrow(event.pathParameters, employeeUriSchema);

  const { principal: { email }, roleMemberships } = securityContext;

  const results = await gtlService.listGtlRecordsByEmployee(tenantId, companyId, employeeId, email, roleMemberships);

  return results || { statusCode: 200, headers: new Headers() };
});
import * as utilService from '../../util.service';
import * as directDepositService from './direct-deposit.service';

import { IGatewayEventInput } from '../../util.service';

const headerSchema = {
  authorization: { required: true, type: String}
};

const directDepositsResourceUriSchema = {
    employeeId:   { required: true, type: String},
};

/**
 * Returns a listing of an employee's direct deposits.
 */
export const list = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
  console.info('directDeposits.handler.list');

  // TODO: MJ-1177: Check role and apply appropriate security permissions

  utilService.normalizeHeaders(event);
  utilService.validateAndThrow(event.headers, headerSchema);
  utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchema);

  const employeeId = event.pathParameters.employeeId;

  const tenantId =  securityContext.principal.tenantId;
  return await directDepositService.list(employeeId, tenantId);
});
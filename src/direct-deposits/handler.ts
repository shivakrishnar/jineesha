import * as utilService from '../util.service';
import { IGatewayEventInput } from '../util.service';

export const list = utilService.gatewayEventHandler(async ({ event: { pathParameters } }: IGatewayEventInput) => {
  console.info('accessKey.handler.get');

  return 'all direct deposits';
});

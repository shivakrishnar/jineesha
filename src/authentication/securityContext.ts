import { IAccount } from './account';
import { IRoleMembership } from './roleMembership';

import * as configService from '../config.service';
import * as errorService from '../errors/error.service';

/**
 * SecurityContext represents data pulled from the token when it is verified. AWS requires the
 * data to be a string when it is passed on to Lambda via an event, so we JSON stringify
 * this object to return a serialized string from the tokenVerifier lambda. Later, this is
 * parsed from requestContext.authorizer.principalId, and then provided to each lambda handler
 * by the utilService.gatewayEventHandler helper.
 */
export class SecurityContext {
  principal: IAccount;
  roleMemberships: IRoleMembership[];
  accessToken: string;

  public constructor(principal: IAccount, roleMemberships: IRoleMembership[] = [], accessToken: string) {
    this.principal = principal;
    this.roleMemberships = roleMemberships;
    this.accessToken = accessToken;
  }

  public static fromJSON(json: string): SecurityContext {
    const data = JSON.parse(json);
    return new SecurityContext(data.principal, data.roleMemberships, data.accessToken);
  }

  /**
   * This should be invoked at the start of a handler that must be restricted to users with the
   * an hr employee role. It will throw a "403" exception if the authenticated user does not
   * meet this requirement.
   */
  public requireHrEmployee(): void {
    this.requireRole(configService.getEvoHrGroupEmployee(), 'hr-employee');
  }

  private requireRole(roleId ?: string, roleName ?: string): void {
    if (!roleId || !this.roleMemberships || !this.roleMemberships.some((r) => r.roleId === roleId)) {
      throw errorService.notAuthorized(roleName || roleId || 'undefined');
    }
  }
}

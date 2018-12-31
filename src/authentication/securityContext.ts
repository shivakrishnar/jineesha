import * as directDepositDao from '../api/direct-deposits/direct-deposit.dao';
import { IAccount } from './account';
import { IRoleMembership } from './roleMembership';

import { ConnectionPool, IResult } from 'mssql';
import * as configService from '../config.service';
import * as dbConnections from '../dbConnections';
import * as errorService from '../errors/error.service';
import { ErrorMessage } from '../errors/errorMessage';
import { ParameterizedQuery } from '../queries/parameterizedQuery';
import { Queries } from '../queries/queries';
import * as utilService from '../util.service';
import { ApplicationRoleLevel } from './ApplicationRoleLevelEnum';

import { IPayrollApiCredentials } from '../models/IPayrollApiCredentials';

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
  payrollApiCredentials: IPayrollApiCredentials;
  currentRoleLevel: ApplicationRoleLevel;

  public constructor(principal: IAccount, roleMemberships: IRoleMembership[] = [], accessToken: string, payrollApiCredentials: any) {
    this.principal = principal;
    this.roleMemberships = roleMemberships;
    this.accessToken = accessToken;
    this.payrollApiCredentials = payrollApiCredentials;
  }

  public static fromJSON(json: string): SecurityContext {
    const data = JSON.parse(json);
    return new SecurityContext(data.principal, data.roleMemberships, data.accessToken, data.payrollApiCredentials);
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

  /**
   * Checks to see if the user has the appropriate security roles for the endpoint
   * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
   * @param {string} email: The email of the user
   * @param {string} resource: The type of resource requested. Typically, this is equivalent to the name of the screen in ADHR 2.0
   * @param {string} action: The type of action requested (CanRead, CanCreate, CanDelete, CanUpdate)
   */
  public async checkSecurityRoles(tenantId: string, email: string, resource: string, action: string): Promise<void> {
      console.info('securityContext.checkSecurityRoles');

      let pool: ConnectionPool;

      try {
          const connectionString = dbConnections.findConnectionString(tenantId);
          const rdsCredentials = JSON.parse(await utilService.getSecret(configService.getRdsCredentials()));

          pool = await directDepositDao.createConnectionPool(
              rdsCredentials.username,
              rdsCredentials.password,
              connectionString.rdsEndpoint,
              connectionString.databaseName,
          );

          const query = new ParameterizedQuery('CheckSecurityRoles', Queries.checkSecurityRoles);
          query.setParameter('@userEmail', email);

          const result: IResult<any> = await directDepositDao.executeQuery(pool.transaction(), query);
          const recordSet: any[] = result.recordset;
          if (recordSet.length === 0) {
              throw errorService.getErrorResponse(11);
          }

          const resources = recordSet.filter((value) => value.ResourceName === resource);
          if (resources.length > 0) {
              // action should be CanRead, CanCreate, CanUpdate, or CanDelete
              if (!resources[0][action]) {
                  throw errorService.getErrorResponse(11);
              }
          }

          if (recordSet.filter((record) => record.ApplicationRoleLevel === ApplicationRoleLevel.Employee).length === 0) {
              const moreInfo = 'The user does not have the appropriate role level to use this endpoint.';
              throw errorService.getErrorResponse(11).setMoreInfo(moreInfo);
          }

          this.currentRoleLevel = recordSet[0].ApplicationRoleLevel;
      } catch (error) {
          console.error(error);
          if (error instanceof ErrorMessage) {
              throw error;
          }
          throw errorService.getErrorResponse(0);
      } finally {
          if (pool && pool.connected) {
              await pool.close();
          }
      }
  }
}

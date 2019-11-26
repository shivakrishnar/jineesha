import { IAccount } from './account';

import { Role } from '../../api/models/Role';
import * as errorService from '../../errors/error.service';
import { ErrorMessage } from '../../errors/errorMessage';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { Queries } from '../../queries/queries';
import * as utilService from '../../util.service';
import { InvocationType } from '../../util.service';
import { DatabaseEvent, QueryType } from '../database/events';
import { ApplicationRoleLevel } from './ApplicationRoleLevelEnum';
import { ISecurityPolicy } from './securityPolicyAuthorizer';

/**
 * SecurityContext represents data pulled from the token when it is verified.
 * 
 * If an endpoint has an "authorizer" defined in serverless.yml, the securityContext is
 * returned as a serialized string from the tokenVerifier lambda, then later parsed from
 * requestContext.authorizer.principalId, and by the utilService.gatewayEventHandler helper.
 * 
 * If an endpoint instead uses the enhanced helper utilService.gatewayEventHandlerV2, the
 * securityContext is constructed entirely inside the helper using SecurityContextProvider,
 * and does not need to be serialized/deserialized. This approach is recommended, as it
 * keeps our authorization logic in once place, and allows the service to be run locally.
 * 
 * In either case, the same SecurityContext object is passed to the lambda handler code.
 */
export class SecurityContext {
    principal: IAccount;
    roleMemberships: string[];
    accessToken: string;
    currentRoleLevel: ApplicationRoleLevel;
    policy: ISecurityPolicy;

    public constructor(principal: IAccount, roleMemberships: string[] = [], accessToken: string, policy: ISecurityPolicy) {
        this.principal = principal;
        this.roleMemberships = roleMemberships;
        this.accessToken = accessToken;
        this.policy = policy;
    }

    public static fromJSON(json: string): SecurityContext {
        const data = JSON.parse(json);
        return new SecurityContext(data.principal, data.roleMemberships, data.accessToken, data.policy);
    }

    /**
     * This should be invoked at the start of a handler that must be restricted to users with the
     * an hr employee role. It will throw a "403" exception if the authenticated user does not
     * meet this requirement.
     */

    public requireRole(role: Role): void {
        if (!role || !this.roleMemberships || !this.roleMemberships.some((r) => r === role)) {
            throw errorService.notAuthorized(role || 'undefined');
        }
    }

    /**
     * Checks to see if the user has the appropriate security roles for the endpoint
     * @param {string} tenantId: The unique identifier for the tenant the user belongs to.
     * @param {string} employeeId: The user's employee identifier
     * @param {string} email: The email of the user
     * @param {string} resource: The type of resource requested. Typically, this is equivalent to the name of the screen in ADHR 2.0
     * @param {string} action: The type of action requested (CanRead, CanCreate, CanDelete, CanUpdate)
     */
    public async checkSecurityRoles(tenantId: string, employeeId: string, email: string, resource: string, action: string): Promise<void> {
        console.info('securityContext.checkSecurityRoles');

        try {
            const query = new ParameterizedQuery('CheckSecurityRoles', Queries.checkSecurityRoles);
            query.setParameter('@userEmail', email);
            query.setParameter('@employeeId', employeeId);

            const payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);

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
        }
    }
}

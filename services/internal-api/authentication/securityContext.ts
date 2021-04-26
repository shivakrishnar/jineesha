import { IAccount, ISecurityPolicy, ISecurityRequest, SecurityContext as BaseSecurityContext } from '@asuresoftware/asure.auth';
import { Role } from '../../api/models/Role';
import * as errorService from '../../errors/error.service';
import { ErrorMessage } from '../../errors/errorMessage';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { Queries } from '../../queries/queries';
import * as utilService from '../../util.service';
import { InvocationType } from '../../util.service';
import { DatabaseEvent, QueryType } from '../database/events';
import { ApplicationRoleLevel } from './ApplicationRoleLevelEnum';

/**
 * SecurityContext represents data pulled from the token when it is verified,
 * and is passed to the lambda handler code.
 *
 * This class extends SecurityContext from the asure.auth package, adding
 * functionality specific to hr-services.
 */
export class SecurityContext extends BaseSecurityContext {
    roleMemberships: string[];
    currentRoleLevel: ApplicationRoleLevel;

    public constructor(principal: IAccount, roleMemberships: string[] = [], accessToken: string, policy: ISecurityPolicy) {
        super(principal, accessToken, policy);
        this.roleMemberships = roleMemberships;
    }

    /**
     * Invoked in any handler where the user must be restricted to their "own" data; throws a 403 if not.
     * We override the base implementation here so we can throw an exception with the expected hr-services code.
     * @param {string} tenantId: the sso tenantId from the endpoint path.
     * @param {string} accountId: the sso accountId from the endpoint path.
     */
    requireSelf = ({ tenantId, accountId }: { tenantId: string; accountId: string }) => {
        try {
            super.requireSelf({ tenantId, accountId });
        } catch (e) {
            throw errorService
                .getErrorResponse(20)
                .setMoreInfo(`This endpoint can only be used by a user with an admin role, or to request the authenticated user's data.`);
        }
    };

    /**
     * Invoked in any handler that must be restricted to users with a specific policy rule; throws a 403 if not.
     * We override the base implementation here so we can throw an exception with the expected hr-services code.
     * @param {ISecurityRequest} request: the action/resource the user requires in order to be granted access.
     * @param {ISecurityRequest[]} deprecatedRequests: for backward compatability, will not throw if any match.
     */
    requireAuthorizedTo = (request: ISecurityRequest, ...deprecatedRequests: ISecurityRequest[]) => {
        try {
            super.requireAuthorizedTo(request, ...deprecatedRequests);
        } catch (e) {
            throw errorService.getErrorResponse(20).setMoreInfo(e.moreInfo);
        }
    };

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

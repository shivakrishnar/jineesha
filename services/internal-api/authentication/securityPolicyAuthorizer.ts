import * as errorService from '../../errors/error.service';

export const SUPPORTED_POLICY_VERSION = 'v1';

export interface ISecurityRequest {
    action: string;
    resource?: string;
    params?: { [key: string]: string };
}

export interface ISecurityPolicyRule {
    action: string;
    resource?: string;
    paramConditions?: { [key: string]: string };
}

export interface ISecurityPolicy {
    version: string;
    rules: ISecurityPolicyRule[];
}

export interface IAssumeRoleRequest {
    roleName: string;
    params?: { [key: string]: string };
}

// tslint:disable max-classes-per-file
class PolicyAuthorizerRuleChecker {
    public constructor(private rule: ISecurityPolicyRule) {}

    public isAuthorized({ action, resource, params }: ISecurityRequest): boolean {
        return this.isActionAuthorized(action) && this.isResourceAuthorized(resource) && this.areParamsAuthorized(params);
    }

    private isActionAuthorized(action: string): boolean {
        return this.rule.action === action || this.rule.action === '*';
    }

    private isResourceAuthorized(resource?: string): boolean {
        // if resources match (or both undefined) OR its a wildcard rule, we're good
        if (this.rule.resource === resource || this.rule.resource === '*') {
            return true;
        }

        // if we didn't pass a resource, and we didn't match (undefined) in the previous check, we're not good
        if (!resource) {
            return false;
        }

        if (this.isResourceAuthorizedByWildcard(resource)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a resource is authorized because the policy has a wildcard ('*') in the resource
     * Note this doesn't check for the global wildcard, which we check earlier in isResourceAuthorized
     * This is so we can support an admin policy with '*' for both action and resource that grants all permissions, even when there is no resource
     */
    private isResourceAuthorizedByWildcard(resource: string): boolean {
        return this.rule.resource === this.buildResourceWildcard(resource);
    }

    private buildResourceWildcard(resource: string): string {
        const resourceParts = resource.split('/');
        const resourcePrefix = resourceParts.slice(0, resourceParts.length - 1).join('/');
        return `${resourcePrefix}/*`;
    }

    private areParamsAuthorized(params?: { [key: string]: string }): boolean {
        // If there are no param conditions, its ok
        if (!this.rule.paramConditions) {
            return true;
        }

        // Must provide all params for a rule with paramConditions
        const validationErrors = new Array<string>();
        for (const paramKey of Object.keys(this.rule.paramConditions)) {
            if (!params || !params[paramKey]) {
                validationErrors.push(paramKey);
            }
        }

        if (validationErrors.length > 0) {
            throw errorService
                .getErrorResponse(30)
                .setMessage('Missing params for a rule with paramConditions')
                .setMoreInfo(JSON.stringify({ validationErrors: { missingParams: Object.values(validationErrors) } }));
        }

        // All params must be allowed values
        for (const paramKey of Object.keys(params)) {
            const value = params[paramKey];
            const condition = this.rule.paramConditions[paramKey];
            if (!this.isAllowedParamValue({ value, condition })) {
                return false;
            }
        }

        return true;
    }

    private isAllowedParamValue({ value, condition }: { value: string; condition: string }): boolean {
        // Must have a value
        if (!value) {
            return false;
        } else if (condition === '*') {
            return true;
        }

        return value === condition;
    }
}

export class SecurityPolicyAuthorizer {
    private ruleCheckers: PolicyAuthorizerRuleChecker[];

    public constructor(policy: ISecurityPolicy) {
        if (policy.version !== SUPPORTED_POLICY_VERSION) {
            // throw a standard Error for this developer failure, so this code is reusable in the browser
            throw new Error(`Expected supported policy version ${SUPPORTED_POLICY_VERSION} but got ${policy.version}.`);
        }

        this.ruleCheckers = this.buildRuleCheckers(policy);
    }

    private buildRuleCheckers(policy: ISecurityPolicy): PolicyAuthorizerRuleChecker[] {
        return policy.rules.map((rule) => new PolicyAuthorizerRuleChecker(rule));
    }

    public isAuthorizedTo({ action, resource, params }: ISecurityRequest): boolean {
        this.guardAgainstInvalidResource(resource);

        for (const checker of this.ruleCheckers) {
            if (checker.isAuthorized({ action, resource, params })) {
                return true;
            }
        }

        return false;
    }

    private guardAgainstInvalidResource(resource?: string): void {
        if (!resource) {
            return;
        }

        if (resource.indexOf('*') !== -1) {
            throw errorService
                .getErrorResponse(30)
                .setMessage(`Resource cannot contain asterisks, but got ${resource}. This is likely a developer error.`)
                .setMoreInfo(`Resource cannot contain asterisks, but got ${resource}.`);
        }
    }
}

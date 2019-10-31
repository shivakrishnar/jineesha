import { ISecurityPolicy, SecurityPolicyAuthorizer } from './securityPolicyAuthorizer';

/**
 * These tests do not assert anything about the ErrorMessages thrown by the authorizer, for example that they have the right status code or error code
 * The intent is that those types of checks will be covered by the negative integration tests on the endpoints and duplicating it here does not add value
 * The intent of these tests is solely to ensure they have the correct behavior when given a policy
 */
describe('SecurityPolicyAuthorizer', () => {
    test('It throws for policies with the wrong version', () => {
        expect(() => {
            const sut = new SecurityPolicyAuthorizer(
                createPolicy({
                    version: 'unknownVersion',
                    rules: [
                        {
                            action: 'tenant:manage-logo',
                            resource: 'tenants/*',
                        },
                    ],
                }),
            );
            console.info(sut);
        }).toThrow();
    });

    test('It throws when passed a resource with a wildcard', () => {
        expect(() => {
            const sut = new SecurityPolicyAuthorizer(createEmptyPolicy());
            sut.isAuthorizedTo({ action: 'doesnt:matter', resource: 'tenants/*' });
        }).toThrow();
    });

    test('Not Authorized for empty policy', () => {
        const sut = new SecurityPolicyAuthorizer(createEmptyPolicy());
        expect(sut.isAuthorizedTo({ action: 'doesnt:matter', resource: 'totally/irrelevant' })).toEqual(false);
    });

    test('Authorized for resource matching wildcard', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [
                    { action: 'tenant:manage-logo', resource: 'tenants/*' },
                    { action: 'tenant:get-account', resource: 'tenants/1/accounts/*' },
                ],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:manage-logo', resource: 'tenants/1' })).toEqual(true);
        expect(sut.isAuthorizedTo({ action: 'tenant:get-account', resource: 'tenants/1/accounts/1' })).toEqual(true);
    });

    test('Authorized for wildcard action and resource', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [{ action: '*', resource: '*' }],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:manage-logo', resource: 'tenants/1' })).toEqual(true);
        expect(sut.isAuthorizedTo({ action: 'tenant:create' })).toEqual(true);
    });

    test('Authorized for specific resource in the policy', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [{ action: 'tenant:manage-logo', resource: 'tenants/1' }, { action: 'tenant:manage-logo', resource: 'tenants/2' }],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:manage-logo', resource: 'tenants/1' })).toEqual(true);
        expect(sut.isAuthorizedTo({ action: 'tenant:manage-logo', resource: 'tenants/2' })).toEqual(true);
    });

    test('Not authorized for a specific resource not in the policy', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [
                    { action: 'tenant:manage-logo', resource: 'tenants/1' },
                    { action: 'tenant:get-account', resource: 'tenants/1/accounts/*' },
                ],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:manage-logo', resource: 'tenants/2' })).toEqual(false);
        expect(sut.isAuthorizedTo({ action: 'tenant:get-account', resource: 'tenants/2/accounts/1' })).toEqual(false);
    });

    test('Not authorized if resource in policy but no resource provided', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [{ action: 'tenant:manage-logo', resource: 'tenants/*' }],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:manage-logo' })).toEqual(false);
    });

    test('Authorized if no resource in policy and no resource provided', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [{ action: 'tenant:create' }],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:create' })).toEqual(true);
    });

    test('Not authorized if no resource in policy and resource provided', () => {
        const sut = new SecurityPolicyAuthorizer(
            createPolicy({
                rules: [{ action: 'tenant:create' }],
            }),
        );
        expect(sut.isAuthorizedTo({ action: 'tenant:create', resource: 'tenants/1' })).toEqual(false);
    });

    describe('params', () => {
        test('Authorized if params are provided and match the rules param-conditions', () => {
            const sut = new SecurityPolicyAuthorizer(
                createPolicy({
                    rules: [{ action: 'iam:assumerole', resource: 'roles/someRole', paramConditions: { tenantId: '123' } }],
                }),
            );
            expect(sut.isAuthorizedTo({ action: 'iam:assumerole', resource: 'roles/someRole', params: { tenantId: '123' } })).toEqual(true);
        });

        test('Can use * in a paramCondition', () => {
            const sut = new SecurityPolicyAuthorizer(
                createPolicy({
                    rules: [{ action: 'iam:assumerole', resource: 'roles/someRole', paramConditions: { tenantId: '*' } }],
                }),
            );
            expect(sut.isAuthorizedTo({ action: 'iam:assumerole', resource: 'roles/someRole', params: { tenantId: '123' } })).toEqual(true);
        });

        test('Not authorized if params are provided but do not match param-conditions', () => {
            const sut = new SecurityPolicyAuthorizer(
                createPolicy({
                    rules: [{ action: 'iam:assumerole', resource: 'roles/someRole', paramConditions: { tenantId: '2' } }],
                }),
            );
            expect(sut.isAuthorizedTo({ action: 'iam:assumerole', resource: 'roles/someRole', params: { tenantId: 'notMatch' } })).toEqual(
                false,
            );
        });

        test('Authorized if no paramConditions even if param is provided', () => {
            /**
             * the use case is some what complex... imagine an endpoint that asserts that following
             * new SecurityPolicyAuthorizer(policy).isAuthorizedTo({
             *  action: 'assign-role',
             *  resource: 'user/1',
             *  params: { roleId: 'role-a' }
             * }))
             *
             * we would expect the following policy to work
             *  {
             *    action: 'assign-role',
             *    resource: 'user/1',
             *    paramsConditions: { roleId: 'role-a' }
             *  }
             *
             * and this
             *  {
             *    action: 'assign-role',
             *    resource: 'user/1',
             *    paramsConditions: { roleId: '*' }
             *  }
             *
             * but we also expect this to work
             *  {
             *    action: '*',
             *    resource: '*'
             *  }
             *
             * It would be unacceptable if we needed to add another paramCondition of * to the previous policy
             *  everytime we added a new param to any endpoint
             *
             * What causes that to work, means this also works
             * {
             *    action: 'assign-role',
             *    resource: 'user/1'
             *  }
             *
             * Which is acceptable, as we're saying you get this permission with no param conditions (just because the endpoint
             *  supports paramCondiditions doesn't mean the policy has to use it).
             *
             * Another use case that supports this is that there may be more than one params supported by an endpoint and we shouldn't need to specify both
             *  for all policies... For example, imagine some users with
             *  {
             *    action: 'assign-role',
             *    resource: 'user/1',
             *    paramsConditions: { roleId: 'role-a' }
             *  }
             * and then imagine a new requirement that evolves the surface area, now there is a role type, resulting in some users getting the following
             * {
             *    action: 'assign-role',
             *    resource: 'user/1',
             *    paramsConditions: { roleType: 'employee-roles' }
             *  }
             * It would be unacceptable that we would need to change all the previous roles that were working fine that have no opinion of roleType
             */
            const sut = new SecurityPolicyAuthorizer(
                createPolicy({
                    rules: [{ action: '*', resource: '*' }],
                }),
            );
            expect(sut.isAuthorizedTo({ action: 'iam:assumerole', resource: 'roles/someRole', params: { tenantId: '2' } })).toEqual(true);
        });

        test('Not authorized if there are param-conditions but no params are provided', async () => {
            const sut = new SecurityPolicyAuthorizer(
                createPolicy({
                    rules: [{ action: 'iam:assumerole', resource: 'roles/someRole', paramConditions: { tenantId: '*' } }],
                }),
            );

            expect.assertions(1);

            try {
                sut.isAuthorizedTo({ action: 'iam:assumerole', resource: 'roles/someRole' });
            } catch (error) {
                expect(error.code).toBe(30);
            }
        });
    });
});

function createEmptyPolicy(): ISecurityPolicy {
    return createPolicy({ rules: [] });
}

function createPolicy({ version = 'v1', rules }: any = {}): ISecurityPolicy {
    return { version, rules };
}

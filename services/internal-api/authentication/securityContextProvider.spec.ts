import * as jwt from 'jsonwebtoken';
import * as configService from '../../config.service';
import * as ssoService from '../../remote-services/sso.service';
import * as utilService from '../../util.service';

jest.mock('jsonwebtoken');
jest.mock('../../config.service');
jest.mock('../../remote-services/sso.service');
jest.mock('../../util.service');

import { SecurityContextProvider } from './securityContextProvider';

describe('SecurityContextProvider', () => {

    const sut = new SecurityContextProvider();

    beforeEach(() => {
        jest.clearAllMocks();

        (configService.getHrApplicationId as jest.Mock).mockReturnValue('ahr-id');
        (configService.getGoldilocksPublicKeys as jest.Mock).mockReturnValue([ { keyId: 'key-id', publicKey: 'the-secret' }]);

        (ssoService.exchangeToken as jest.Mock).mockResolvedValue({ access_token: 'ahr-token' });

        (utilService.getApplicationSecret as jest.Mock).mockReturnValue('the-secret');
        (utilService.parseRoles as jest.Mock).mockImplementation(ss => ss.map(s => s.replace('prefix/', '')));

        (jwt.verify as jest.Mock).mockImplementation((t, s) => s === 'the-secret' ? {} : undefined);
        (jwt.decode as jest.Mock).mockImplementation(token =>
            token === 'ahr-token' ? ({ header: {}, payload: { applicationId: 'ahr-id', account: { id: 'acct-id' }, scope: [ 'prefix/ahr-role' ], policy: { rules: [{ action: 'test' }] }} }) :
            token === 'other-token' ? ({ header: {}, payload: { applicationId: 'other-id', account: { id: 'acct-id' }, scope: [ 'prefix/other-role' ], policy: {} } }) :
            token === 'v2-token' ? ({ header: { kid: 'key-id' }, payload: { account: { id: 'acct-id' }, scope: [ 'prefix/ahr-role', 'prefix/other-role' ], policy: { rules: [{ action: 'test' }] }} }) :
            undefined
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('if anonymous not allowed', () => {

        test('throws 401 if auth header missing', async () => {
            await expect(sut.getSecurityContext({ event: {} })).rejects.toMatchObject({ statusCode: 401 });
        });

        test('accepts capitalized auth header', async () => {
            const sc = await sut.getSecurityContext({ event: { headers: { Authorization: 'Bearer ahr-token' }} });
            expect(sc).toBeDefined();
        });

        describe('with v1 token', () => {

            test('throws 401 if token cannot be verified', async () => {
                (jwt.verify as jest.Mock).mockReturnValue(undefined);
                await expect(sut.getSecurityContext({ event: { headers: { authorization: 'Bearer ahr-token' }}})).rejects.toMatchObject({ statusCode: 401 });
            });

            test('returns full security context', async () => {
                const sc = await sut.getSecurityContext({ event: { headers: { authorization: 'Bearer ahr-token' }} });
                expect(sc).toEqual({
                    accessToken: 'ahr-token',
                    principal: { id: 'acct-id' },
                    roleMemberships: [ 'ahr-role' ],
                    policy: { rules: [{ action: 'test' }] }
                });
            });

            test('appends ahr roles if not ahr token', async () => {
                const sc = await sut.getSecurityContext({ event: { headers: { authorization: 'Bearer other-token' }} });
                expect(sc).toEqual({
                    accessToken: 'other-token',
                    principal: { id: 'acct-id' },
                    roleMemberships: [ 'other-role', 'ahr-role' ],
                    policy: {} // NOTE: doesn't append ahr policy
                });
            });
        });

        describe('with v2 token', () => {

            test('throws 401 if public key not found', async () => {
                (jwt.decode as jest.Mock).mockReturnValue({ header: { kid: 'other-kid' }, payload: {} });
                await expect(sut.getSecurityContext({ event: { headers: { authorization: 'Bearer v2-token' }}})).rejects.toMatchObject({ statusCode: 401 });
            });

            test('throws 401 if token cannot be verified', async () => {
                (jwt.verify as jest.Mock).mockReturnValue(undefined);
                await expect(sut.getSecurityContext({ event: { headers: { authorization: 'Bearer v2-token' }}})).rejects.toMatchObject({ statusCode: 401 });
            });

            test('returns full security context', async () => {
                const sc = await sut.getSecurityContext({ event: { headers: { authorization: 'Bearer v2-token' }} });
                expect(sc).toEqual({
                    accessToken: 'v2-token',
                    principal: { id: 'acct-id' },
                    roleMemberships: [ 'ahr-role', 'other-role' ],
                    policy: { rules: [{ action: 'test' }] }
                });
            });
        });
    });

    describe('if anonymous allowed', () => {

        test('returns undefined if no auth header', async () => {
            expect(await sut.getSecurityContext({ event: {}, allowAnonymous: true })).toBeUndefined();
        });

        test('returns security context if auth header provided', async () => {
            const sc = await sut.getSecurityContext({ event: { headers: { authorization: 'Bearer ahr-token' }}, allowAnonymous: true });
            expect(sc).toBeDefined();
        });
    });
});

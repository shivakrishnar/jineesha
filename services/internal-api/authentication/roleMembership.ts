import * as t from 'io-ts';

const TRoleMembership = t.exact(
    t.interface({
        id: t.string,
        accountId: t.string,
        roleId: t.string,
        enabled: t.boolean,
    }),
);

export interface IRoleMembership extends t.TypeOf<typeof TRoleMembership> {}

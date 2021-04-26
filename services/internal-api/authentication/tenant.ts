import * as t from 'io-ts';
import { uuid } from 'io-ts-types/lib/string/uuid';

const TTenant = t.exact(
    t.interface({
        id: uuid,
        name: t.string,
        logo: t.string,
        subdomain: t.string,
        enabled: t.boolean,
    }),
    'Tenant',
);

export type ITenant = t.TypeOf<typeof TTenant>;

const TTenantUnsaved = t.interface(
    {
        name: t.string,
        logo: t.string,
        subdomain: t.string,
        enabled: t.boolean,
    },
    'TenantUnsaved',
);

export type ITenantUnsaved = t.TypeOf<typeof TTenantUnsaved>;

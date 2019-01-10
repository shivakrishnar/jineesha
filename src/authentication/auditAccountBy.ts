import * as t from 'io-ts';
import { uuid } from 'io-ts-types/lib/string/uuid';

export const TAuditAccountBy = t.exact(
    t.interface({
        id: uuid,
        username: t.string,
    }),
);

export interface IAuditAccountBy extends t.TypeOf<typeof TAuditAccountBy> {}

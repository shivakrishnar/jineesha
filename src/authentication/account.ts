import * as t from 'io-ts';
import { uuid } from 'io-ts-types/lib/string/uuid';

const TAccount = t.exact(t.interface({
  tenantId: uuid,
  id: uuid,
  username: t.string,
  email: t.string,
  password: t.string,
  enabled: t.boolean
}), 'Account');

export interface IAccount extends t.TypeOf<typeof TAccount> {}

import type { Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.alterTable('aposta').addColumn('conferida_em', 'timestamptz').execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.alterTable('aposta').dropColumn('conferida_em').execute();
};

import type { Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.alterTable('analise').addColumn('parametros', 'jsonb').execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.alterTable('analise').dropColumn('parametros').execute();
};

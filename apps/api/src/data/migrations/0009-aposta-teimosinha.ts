import type { Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .alterTable('aposta')
    .addColumn('teimosinha_grupo', 'uuid')
    .addColumn('teimosinha_posicao', 'smallint')
    .addColumn('teimosinha_total', 'smallint')
    .execute();
  await db.schema
    .createIndex('aposta_teimosinha_idx')
    .on('aposta')
    .column('teimosinha_grupo')
    .where('teimosinha_grupo', 'is not', null)
    .execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.dropIndex('aposta_teimosinha_idx').execute();
  await db.schema
    .alterTable('aposta')
    .dropColumn('teimosinha_grupo')
    .dropColumn('teimosinha_posicao')
    .dropColumn('teimosinha_total')
    .execute();
};

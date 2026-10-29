import { sql, type Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .createTable('aposta')
    .addColumn('id', 'bigint', (coluna) => coluna.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('jogo', 'text', (coluna) => coluna.notNull().references('jogo.codigo'))
    .addColumn('nome', 'text')
    .addColumn('dezenas', sql`smallint[]`, (coluna) => coluna.notNull())
    .addColumn('favorita', 'boolean', (coluna) => coluna.notNull().defaultTo(false))
    .addColumn('criada_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .addColumn('atualizada_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('aposta_favorita_idx')
    .on('aposta')
    .columns(['favorita', 'id desc'])
    .execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.dropTable('aposta').ifExists().execute();
};

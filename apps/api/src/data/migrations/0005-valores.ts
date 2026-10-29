import { sql, type Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .createTable('valor_jogo')
    .addColumn('jogo', 'text', (coluna) => coluna.primaryKey())
    .addColumn('valor_aposta', 'numeric(10, 2)', (coluna) => coluna.notNull())
    .addColumn('atualizado_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.alterTable('aposta').addColumn('valor', 'numeric(14, 2)').execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.alterTable('aposta').dropColumn('valor').execute();
  await db.schema.dropTable('valor_jogo').ifExists().execute();
};

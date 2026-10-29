import { sql, type Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.dropIndex('aposta_favorita_idx').ifExists().execute();
  await db.schema.alterTable('aposta').renameTo('favorito').execute();
  await db.schema.alterTable('favorito').dropColumn('favorita').execute();
  await db.schema.alterTable('favorito').renameColumn('criada_em', 'criado_em').execute();
  await db.schema.alterTable('favorito').renameColumn('atualizada_em', 'atualizado_em').execute();

  await db.schema
    .createTable('aposta')
    .addColumn('id', 'bigint', (coluna) => coluna.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('jogo', 'text', (coluna) => coluna.notNull().references('jogo.codigo'))
    .addColumn('nome', 'text')
    .addColumn('dezenas', sql`smallint[]`, (coluna) => coluna.notNull())
    .addColumn('favorito_id', 'bigint', (coluna) =>
      coluna.references('favorito.id').onDelete('set null'),
    )
    .addColumn('concurso', 'integer')
    .addColumn('criada_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('aposta_jogo_idx')
    .on('aposta')
    .columns(['jogo', 'id desc'])
    .execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.dropTable('aposta').ifExists().execute();
  await db.schema.alterTable('favorito').renameColumn('criado_em', 'criada_em').execute();
  await db.schema.alterTable('favorito').renameColumn('atualizado_em', 'atualizada_em').execute();
  await db.schema
    .alterTable('favorito')
    .addColumn('favorita', 'boolean', (coluna) => coluna.notNull().defaultTo(true))
    .execute();
  await db.schema.alterTable('favorito').renameTo('aposta').execute();
};

import { sql, type Kysely } from 'kysely';

const TABELAS_COM_DONO = ['favorito', 'aposta', 'analise'] as const;

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .createTable('usuario')
    .addColumn('id', 'bigint', (coluna) => coluna.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('nome', 'text', (coluna) => coluna.notNull())
    .addColumn('login', 'text', (coluna) => coluna.notNull().unique())
    .addColumn('senha_hash', 'text', (coluna) => coluna.notNull())
    .addColumn('criado_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('sessao')
    .addColumn('id', 'text', (coluna) => coluna.primaryKey())
    .addColumn('usuario_id', 'bigint', (coluna) =>
      coluna.notNull().references('usuario.id').onDelete('cascade'),
    )
    .addColumn('criada_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .addColumn('expira_em', 'timestamptz', (coluna) => coluna.notNull())
    .execute();

  for (const tabela of TABELAS_COM_DONO) {
    await db.schema
      .alterTable(tabela)
      .addColumn('usuario_id', 'bigint', (coluna) =>
        coluna.references('usuario.id').onDelete('cascade'),
      )
      .execute();
    await db.schema
      .createIndex(`${tabela}_usuario_idx`)
      .on(tabela)
      .columns(['usuario_id', 'id desc'])
      .execute();
  }
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  for (const tabela of TABELAS_COM_DONO) {
    await db.schema.dropIndex(`${tabela}_usuario_idx`).ifExists().execute();
    await db.schema.alterTable(tabela).dropColumn('usuario_id').execute();
  }
  await db.schema.dropTable('sessao').ifExists().execute();
  await db.schema.dropTable('usuario').ifExists().execute();
};

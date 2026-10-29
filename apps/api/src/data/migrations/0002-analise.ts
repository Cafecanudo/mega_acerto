import { sql, type Kysely } from 'kysely';

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .createTable('analise')
    .addColumn('id', 'bigint', (coluna) => coluna.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('jogo', 'text', (coluna) => coluna.notNull().references('jogo.codigo'))
    .addColumn('tipo', 'text', (coluna) => coluna.notNull())
    .addColumn('versao_prompt', 'smallint', (coluna) => coluna.notNull())
    .addColumn('modelo', 'text', (coluna) => coluna.notNull())
    .addColumn('esforco', 'text', (coluna) => coluna.notNull())
    .addColumn('status', 'text', (coluna) => coluna.notNull())
    .addColumn('ultimo_concurso', 'integer', (coluna) => coluna.notNull())
    .addColumn('hash_dataset', 'char(64)')
    .addColumn('resultado', 'jsonb')
    .addColumn('conferencia_sistema', 'jsonb')
    .addColumn('scripts', 'jsonb')
    .addColumn('metadados', 'jsonb')
    .addColumn('custo_usd', 'numeric(12, 4)')
    .addColumn('duracao_ms', 'integer')
    .addColumn('erro', 'text')
    .addColumn('criado_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .addColumn('iniciado_em', 'timestamptz')
    .addColumn('finalizado_em', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('analise_status_idx')
    .on('analise')
    .columns(['status', 'id'])
    .execute();

  await db.schema
    .createIndex('analise_jogo_idx')
    .on('analise')
    .columns(['jogo', 'id desc'])
    .execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema.dropTable('analise').ifExists().execute();
};

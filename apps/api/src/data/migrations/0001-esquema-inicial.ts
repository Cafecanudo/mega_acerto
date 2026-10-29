import { sql, type Kysely } from 'kysely';

const tabelas = [
  'ingestao_execucao',
  'payload_bruto',
  'premiacao',
  'dezena_sorteada',
  'concurso',
  'jogo',
] as const;

export const up = async (db: Kysely<unknown>): Promise<void> => {
  await db.schema
    .createTable('jogo')
    .addColumn('codigo', 'text', (coluna) => coluna.primaryKey())
    .addColumn('nome', 'text', (coluna) => coluna.notNull())
    .addColumn('universo_minimo', 'smallint', (coluna) => coluna.notNull())
    .addColumn('universo_maximo', 'smallint', (coluna) => coluna.notNull())
    .addColumn('dezenas_por_sorteio', 'smallint', (coluna) => coluna.notNull())
    .addColumn('sorteios_por_concurso', 'smallint', (coluna) => coluna.notNull())
    .execute();

  await db.schema
    .createTable('concurso')
    .addColumn('jogo', 'text', (coluna) => coluna.notNull().references('jogo.codigo'))
    .addColumn('numero', 'integer', (coluna) => coluna.notNull())
    .addColumn('data_apuracao', 'date', (coluna) => coluna.notNull())
    .addColumn('acumulado', 'boolean', (coluna) => coluna.notNull())
    .addColumn('valor_arrecadado', 'numeric(18, 2)')
    .addColumn('valor_acumulado_proximo', 'numeric(18, 2)')
    .addColumn('valor_estimado_proximo', 'numeric(18, 2)')
    .addColumn('data_proximo', 'date')
    .addColumn('local_sorteio', 'text')
    .addColumn('municipio_uf', 'text')
    .addColumn('importado_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('concurso_pk', ['jogo', 'numero'])
    .execute();

  await db.schema
    .createTable('dezena_sorteada')
    .addColumn('jogo', 'text', (coluna) => coluna.notNull())
    .addColumn('numero', 'integer', (coluna) => coluna.notNull())
    .addColumn('sorteio', 'smallint', (coluna) => coluna.notNull())
    .addColumn('dezena', 'smallint', (coluna) => coluna.notNull())
    .addColumn('ordem_extracao', 'smallint')
    .addPrimaryKeyConstraint('dezena_sorteada_pk', ['jogo', 'numero', 'sorteio', 'dezena'])
    .addForeignKeyConstraint(
      'dezena_sorteada_concurso_fk',
      ['jogo', 'numero'],
      'concurso',
      ['jogo', 'numero'],
      (fk) => fk.onDelete('cascade'),
    )
    .execute();

  await db.schema
    .createIndex('dezena_sorteada_jogo_dezena_idx')
    .on('dezena_sorteada')
    .columns(['jogo', 'dezena', 'numero'])
    .execute();

  await db.schema
    .createTable('premiacao')
    .addColumn('jogo', 'text', (coluna) => coluna.notNull())
    .addColumn('numero', 'integer', (coluna) => coluna.notNull())
    .addColumn('faixa', 'smallint', (coluna) => coluna.notNull())
    .addColumn('descricao', 'text', (coluna) => coluna.notNull())
    .addColumn('ganhadores', 'integer', (coluna) => coluna.notNull())
    .addColumn('valor_premio', 'numeric(18, 2)', (coluna) => coluna.notNull())
    .addPrimaryKeyConstraint('premiacao_pk', ['jogo', 'numero', 'faixa'])
    .addForeignKeyConstraint(
      'premiacao_concurso_fk',
      ['jogo', 'numero'],
      'concurso',
      ['jogo', 'numero'],
      (fk) => fk.onDelete('cascade'),
    )
    .execute();

  await db.schema
    .createTable('payload_bruto')
    .addColumn('jogo', 'text', (coluna) => coluna.notNull())
    .addColumn('numero', 'integer', (coluna) => coluna.notNull())
    .addColumn('payload', 'jsonb', (coluna) => coluna.notNull())
    .addColumn('hash', 'char(64)', (coluna) => coluna.notNull())
    .addColumn('obtido_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('payload_bruto_pk', ['jogo', 'numero'])
    .addForeignKeyConstraint(
      'payload_bruto_concurso_fk',
      ['jogo', 'numero'],
      'concurso',
      ['jogo', 'numero'],
      (fk) => fk.onDelete('cascade'),
    )
    .execute();

  await db.schema
    .createTable('ingestao_execucao')
    .addColumn('id', 'bigint', (coluna) => coluna.primaryKey().generatedAlwaysAsIdentity())
    .addColumn('jogo', 'text', (coluna) => coluna.notNull().references('jogo.codigo'))
    .addColumn('gatilho', 'text', (coluna) => coluna.notNull())
    .addColumn('status', 'text', (coluna) => coluna.notNull())
    .addColumn('iniciado_em', 'timestamptz', (coluna) => coluna.notNull().defaultTo(sql`now()`))
    .addColumn('finalizado_em', 'timestamptz')
    .addColumn('ultimo_concurso_caixa', 'integer')
    .addColumn('total_previsto', 'integer', (coluna) => coluna.notNull().defaultTo(0))
    .addColumn('importados', 'integer', (coluna) => coluna.notNull().defaultTo(0))
    .addColumn('erro', 'text')
    .execute();

  await db.schema
    .createIndex('ingestao_execucao_jogo_idx')
    .on('ingestao_execucao')
    .columns(['jogo', 'iniciado_em desc'])
    .execute();
};

export const down = async (db: Kysely<unknown>): Promise<void> => {
  for (const tabela of tabelas) {
    await db.schema.dropTable(tabela).ifExists().execute();
  }
};

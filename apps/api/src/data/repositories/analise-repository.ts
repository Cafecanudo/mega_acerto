import { sql, type Kysely, type Selectable } from 'kysely';
import type { EsforcoAnalise, ModeloAnalise, StatusAnalise, TipoAnalise } from '@mega/analises';
import type { AnaliseTabela, Database } from '../database.ts';

export interface ScriptAnalise {
  readonly nome: string;
  readonly conteudo: string;
}

export interface ConferenciaSistema {
  readonly ok: boolean;
  readonly divergencias: string[];
}

export interface Analise {
  readonly id: number;
  readonly jogo: string;
  readonly tipo: TipoAnalise;
  readonly versaoPrompt: number;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly status: StatusAnalise;
  readonly ultimoConcurso: number;
  readonly hashDataset: string | null;
  readonly resultado: unknown;
  readonly conferenciaSistema: ConferenciaSistema | null;
  readonly scripts: ScriptAnalise[];
  readonly metadados: unknown;
  readonly custoUsd: number | null;
  readonly duracaoMs: number | null;
  readonly erro: string | null;
  readonly criadoEm: string;
  readonly iniciadoEm: string | null;
  readonly finalizadoEm: string | null;
}

export type ResumoAnalise = Omit<Analise, 'resultado' | 'scripts' | 'metadados'> & {
  readonly resumoConclusao: string | null;
};

export interface NovaAnalise {
  readonly jogo: string;
  readonly tipo: TipoAnalise;
  readonly versaoPrompt: number;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly ultimoConcurso: number;
}

export interface ConclusaoAnalise {
  readonly hashDataset: string;
  readonly resultado: unknown;
  readonly conferenciaSistema: ConferenciaSistema;
  readonly scripts: readonly ScriptAnalise[];
  readonly metadados: unknown;
  readonly custoUsd: number | null;
  readonly duracaoMs: number;
}

export interface FalhaAnalise {
  readonly erro: string;
  readonly hashDataset?: string | undefined;
  readonly scripts?: readonly ScriptAnalise[] | undefined;
  readonly metadados?: unknown;
  readonly duracaoMs?: number | undefined;
}

const iso = (data: Date | null): string | null => data?.toISOString() ?? null;

type LinhaBase = Omit<Selectable<AnaliseTabela>, 'resultado' | 'scripts' | 'metadados'>;

const paraBase = (linha: LinhaBase): Omit<Analise, 'resultado' | 'scripts' | 'metadados'> => ({
  id: linha.id,
  jogo: linha.jogo,
  tipo: linha.tipo as TipoAnalise,
  versaoPrompt: linha.versao_prompt,
  modelo: linha.modelo as ModeloAnalise,
  esforco: linha.esforco as EsforcoAnalise,
  status: linha.status as StatusAnalise,
  ultimoConcurso: linha.ultimo_concurso,
  hashDataset: linha.hash_dataset,
  conferenciaSistema: linha.conferencia_sistema as ConferenciaSistema | null,
  custoUsd: linha.custo_usd,
  duracaoMs: linha.duracao_ms,
  erro: linha.erro,
  criadoEm: linha.criado_em.toISOString(),
  iniciadoEm: iso(linha.iniciado_em),
  finalizadoEm: iso(linha.finalizado_em),
});

const paraAnalise = (linha: Selectable<AnaliseTabela>): Analise => ({
  ...paraBase(linha),
  resultado: linha.resultado,
  scripts: (linha.scripts as ScriptAnalise[] | null) ?? [],
  metadados: linha.metadados,
});

const json = (valor: unknown) => JSON.stringify(valor);

export class AnaliseRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async criar(nova: NovaAnalise): Promise<number> {
    const { id } = await this.#db
      .insertInto('analise')
      .values({
        jogo: nova.jogo,
        tipo: nova.tipo,
        versao_prompt: nova.versaoPrompt,
        modelo: nova.modelo,
        esforco: nova.esforco,
        ultimo_concurso: nova.ultimoConcurso,
        status: 'pendente' satisfies StatusAnalise,
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    return id;
  }

  async buscarEquivalente(nova: NovaAnalise): Promise<number | null> {
    const linha = await this.#db
      .selectFrom('analise')
      .select('id')
      .where('jogo', '=', nova.jogo)
      .where('tipo', '=', nova.tipo)
      .where('versao_prompt', '=', nova.versaoPrompt)
      .where('modelo', '=', nova.modelo)
      .where('esforco', '=', nova.esforco)
      .where('ultimo_concurso', '=', nova.ultimoConcurso)
      .where('status', 'in', ['pendente', 'executando', 'concluida'] satisfies StatusAnalise[])
      .orderBy('id', 'desc')
      .limit(1)
      .executeTakeFirst();
    return linha?.id ?? null;
  }

  async obter(id: number): Promise<Analise | undefined> {
    const linha = await this.#db
      .selectFrom('analise')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return linha ? paraAnalise(linha) : undefined;
  }

  async listar(limite: number): Promise<ResumoAnalise[]> {
    const linhas = await this.#db
      .selectFrom('analise')
      .select([
        'id',
        'jogo',
        'tipo',
        'versao_prompt',
        'modelo',
        'esforco',
        'status',
        'ultimo_concurso',
        'hash_dataset',
        'conferencia_sistema',
        'custo_usd',
        'duracao_ms',
        'erro',
        'criado_em',
        'iniciado_em',
        'finalizado_em',
        sql<string | null>`resultado -> 'conclusao' ->> 'resumo'`.as('resumo_conclusao'),
      ])
      .orderBy('id', 'desc')
      .limit(limite)
      .execute();

    return linhas.map(({ resumo_conclusao, ...linha }) => ({
      ...paraBase(linha),
      resumoConclusao: resumo_conclusao,
    }));
  }

  async reivindicarProxima(): Promise<Analise | undefined> {
    const linha = await this.#db
      .updateTable('analise')
      .set({ status: 'executando' satisfies StatusAnalise, iniciado_em: new Date() })
      .where(
        'id',
        '=',
        sql<number>`(
          select id from analise where status = 'pendente'
          order by id limit 1 for update skip locked
        )`,
      )
      .returningAll()
      .executeTakeFirst();
    return linha ? paraAnalise(linha) : undefined;
  }

  async concluir(id: number, conclusao: ConclusaoAnalise): Promise<void> {
    await this.#db
      .updateTable('analise')
      .set({
        status: 'concluida' satisfies StatusAnalise,
        hash_dataset: conclusao.hashDataset,
        resultado: json(conclusao.resultado),
        conferencia_sistema: json(conclusao.conferenciaSistema),
        scripts: json(conclusao.scripts),
        metadados: json(conclusao.metadados),
        custo_usd: conclusao.custoUsd,
        duracao_ms: conclusao.duracaoMs,
        erro: null,
        finalizado_em: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  async falhar(id: number, falha: FalhaAnalise): Promise<void> {
    await this.#db
      .updateTable('analise')
      .set({
        status: 'falhou' satisfies StatusAnalise,
        erro: falha.erro,
        hash_dataset: falha.hashDataset ?? null,
        scripts: falha.scripts ? json(falha.scripts) : null,
        metadados: falha.metadados === undefined ? null : json(falha.metadados),
        duracao_ms: falha.duracaoMs ?? null,
        finalizado_em: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  async interromperEmExecucao(): Promise<number> {
    const resultado = await this.#db
      .updateTable('analise')
      .set({
        status: 'falhou' satisfies StatusAnalise,
        erro: 'Worker reiniciado durante a execução',
        finalizado_em: new Date(),
      })
      .where('status', '=', 'executando' satisfies StatusAnalise)
      .executeTakeFirst();
    return Number(resultado.numUpdatedRows);
  }
}

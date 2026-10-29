import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export interface ResumoConcurso {
  readonly numero: number;
  readonly dataApuracao: string;
  readonly acumulado: boolean;
  readonly valorArrecadado: number | null;
  readonly ganhadoresFaixaPrincipal: number | null;
  readonly sorteios: number[][];
}

export interface SorteioDetalhado {
  readonly dezenas: number[];
  readonly ordemExtracao: number[] | null;
}

export interface PremiacaoConcurso {
  readonly faixa: number;
  readonly descricao: string;
  readonly ganhadores: number;
  readonly valorPremio: number;
}

export interface DetalheConcurso {
  readonly numero: number;
  readonly dataApuracao: string;
  readonly acumulado: boolean;
  readonly valorArrecadado: number | null;
  readonly valorAcumuladoProximo: number | null;
  readonly valorEstimadoProximo: number | null;
  readonly dataProximo: string | null;
  readonly localSorteio: string | null;
  readonly municipioUf: string | null;
  readonly sorteios: SorteioDetalhado[];
  readonly premiacoes: PremiacaoConcurso[];
  readonly anterior: number | null;
  readonly proximo: number | null;
}

export interface Pagina<T> {
  readonly itens: T[];
  readonly total: number;
}

export interface Paginacao {
  readonly deslocamento: number;
  readonly limite: number;
}

const sorteiosOrdenados = sql<number[][]>`(
  select coalesce(json_agg(s.dezenas order by s.sorteio), '[]'::json)
  from (
    select d.sorteio, array_agg(d.dezena order by d.dezena) as dezenas
    from dezena_sorteada d
    where d.jogo = c.jogo and d.numero = c.numero
    group by d.sorteio
  ) s
)`;

const sorteiosDetalhados = sql<SorteioDetalhado[]>`(
  select coalesce(json_agg(s order by s.sorteio), '[]'::json)
  from (
    select
      d.sorteio,
      array_agg(d.dezena order by d.dezena) as "dezenas",
      case when bool_and(d.ordem_extracao is not null)
        then array_agg(d.dezena order by d.ordem_extracao)
      end as "ordemExtracao"
    from dezena_sorteada d
    where d.jogo = c.jogo and d.numero = c.numero
    group by d.sorteio
  ) s
)`;

const ganhadoresFaixaPrincipal = sql<number | null>`(
  select p.ganhadores from premiacao p
  where p.jogo = c.jogo and p.numero = c.numero and p.faixa = 1
)`;

export class ConcursoLeituraRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  #consultaResumo() {
    return this.#db
      .selectFrom('concurso as c')
      .select([
        'c.numero',
        'c.data_apuracao as dataApuracao',
        'c.acumulado',
        'c.valor_arrecadado as valorArrecadado',
        ganhadoresFaixaPrincipal.as('ganhadoresFaixaPrincipal'),
        sorteiosOrdenados.as('sorteios'),
      ]);
  }

  async listar(jogo: string, paginacao: Paginacao): Promise<Pagina<ResumoConcurso>> {
    const [itens, contagem] = await Promise.all([
      this.#consultaResumo()
        .where('c.jogo', '=', jogo)
        .orderBy('c.numero', 'desc')
        .limit(paginacao.limite)
        .offset(paginacao.deslocamento)
        .execute(),
      this.#db
        .selectFrom('concurso')
        .where('jogo', '=', jogo)
        .select((eb) => eb.fn.countAll<number>().as('total'))
        .executeTakeFirstOrThrow(),
    ]);

    return { itens, total: contagem.total };
  }

  async obter(jogo: string, numero: number): Promise<DetalheConcurso | undefined> {
    const [concurso, premiacoes] = await Promise.all([
      this.#db
        .selectFrom('concurso as c')
        .where('c.jogo', '=', jogo)
        .where('c.numero', '=', numero)
        .select([
          'c.numero',
          'c.data_apuracao as dataApuracao',
          'c.acumulado',
          'c.valor_arrecadado as valorArrecadado',
          'c.valor_acumulado_proximo as valorAcumuladoProximo',
          'c.valor_estimado_proximo as valorEstimadoProximo',
          'c.data_proximo as dataProximo',
          'c.local_sorteio as localSorteio',
          'c.municipio_uf as municipioUf',
          sorteiosDetalhados.as('sorteios'),
          sql<number | null>`(
            select max(a.numero) from concurso a where a.jogo = c.jogo and a.numero < c.numero
          )`.as('anterior'),
          sql<number | null>`(
            select min(p.numero) from concurso p where p.jogo = c.jogo and p.numero > c.numero
          )`.as('proximo'),
        ])
        .executeTakeFirst(),
      this.#db
        .selectFrom('premiacao')
        .where('jogo', '=', jogo)
        .where('numero', '=', numero)
        .select(['faixa', 'descricao', 'ganhadores', 'valor_premio as valorPremio'])
        .orderBy('faixa')
        .execute(),
    ]);

    return concurso ? { ...concurso, premiacoes } : undefined;
  }

  async buscarPorDezenas(
    jogo: string,
    dezenas: readonly number[],
    minimoAcertos: number,
    paginacao: Paginacao,
  ): Promise<Pagina<ResumoConcurso & { readonly acertos: number }>> {
    const coincidencias = await this.#db
      .selectFrom('dezena_sorteada')
      .where('jogo', '=', jogo)
      .where('dezena', 'in', [...dezenas])
      .groupBy('numero')
      .having((eb) => eb.fn.countAll(), '>=', minimoAcertos)
      .select((eb) => [
        'numero',
        eb.fn.countAll<number>().as('acertos'),
        sql<number>`count(*) over ()`.as('total'),
      ])
      .orderBy('acertos', 'desc')
      .orderBy('numero', 'desc')
      .limit(paginacao.limite)
      .offset(paginacao.deslocamento)
      .execute();

    if (coincidencias.length === 0) return { itens: [], total: 0 };

    const resumos = new Map(
      (
        await this.#listarResumos(
          jogo,
          coincidencias.map((linha) => linha.numero),
        )
      ).map((resumo) => [resumo.numero, resumo]),
    );

    const itens = coincidencias.flatMap((linha) => {
      const resumo = resumos.get(linha.numero);
      return resumo ? [{ ...resumo, acertos: linha.acertos }] : [];
    });

    return { itens, total: coincidencias[0]?.total ?? 0 };
  }

  async #listarResumos(jogo: string, numeros: readonly number[]): Promise<ResumoConcurso[]> {
    return this.#consultaResumo()
      .where('c.jogo', '=', jogo)
      .where('c.numero', 'in', [...numeros])
      .execute();
  }
}

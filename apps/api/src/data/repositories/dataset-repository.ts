import { sql, type Kysely } from 'kysely';
import type { RegraJogo } from '@mega/domain';
import type { Database } from '../database.ts';

export interface ConcursoDataset {
  readonly numero: number;
  readonly data: string;
  readonly dezenas: number[];
}

export interface AgregadoDezena {
  readonly dezena: number;
  readonly frequencia: number;
  readonly atrasoAtual: number;
}

export class DatasetRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listarConcursos(jogo: string, ateConcurso: number): Promise<ConcursoDataset[]> {
    return this.#db
      .selectFrom('concurso as c')
      .innerJoin('dezena_sorteada as d', (join) =>
        join.onRef('d.jogo', '=', 'c.jogo').onRef('d.numero', '=', 'c.numero'),
      )
      .where('c.jogo', '=', jogo)
      .where('c.numero', '<=', ateConcurso)
      .where('d.sorteio', '=', 1)
      .groupBy(['c.numero', 'c.data_apuracao'])
      .orderBy('c.numero')
      .select([
        'c.numero',
        'c.data_apuracao as data',
        sql<number[]>`array_agg(d.dezena order by d.dezena)`.as('dezenas'),
      ])
      .execute();
  }

  async agregarDezenas(
    regra: RegraJogo,
    ateConcurso: number,
    desdeConcurso = 1,
  ): Promise<AgregadoDezena[]> {
    const { rows } = await sql<AgregadoDezena>`
      select
        universo.dezena::integer as "dezena",
        count(d.numero)::integer as "frequencia",
        (${ateConcurso}::integer - coalesce(max(d.numero), 0))::integer as "atrasoAtual"
      from generate_series(${regra.universo.minimo}::integer, ${regra.universo.maximo}::integer)
        as universo(dezena)
      left join dezena_sorteada d
        on d.dezena = universo.dezena
        and d.jogo = ${regra.codigo}
        and d.sorteio = 1
        and d.numero <= ${ateConcurso}
        and d.numero >= ${desdeConcurso}
      group by universo.dezena
      order by universo.dezena
    `.execute(this.#db);
    return rows;
  }
}

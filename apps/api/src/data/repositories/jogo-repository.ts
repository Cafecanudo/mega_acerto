import { sql, type Kysely } from 'kysely';
import type { RegraJogo } from '@mega/domain';
import type { Database } from '../database.ts';

export interface ResumoJogo {
  readonly codigo: string;
  readonly totalConcursos: number;
  readonly ultimoConcurso: number | null;
  readonly ultimaData: string | null;
  readonly ultimoAcumulado: boolean | null;
  readonly ultimaSincronizacao: Date | null;
}

export class JogoRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async sincronizarCatalogo(regras: readonly RegraJogo[]): Promise<void> {
    if (regras.length === 0) return;

    await this.#db
      .insertInto('jogo')
      .values(
        regras.map((regra) => ({
          codigo: regra.codigo,
          nome: regra.nome,
          universo_minimo: regra.universo.minimo,
          universo_maximo: regra.universo.maximo,
          dezenas_por_sorteio: regra.dezenasPorSorteio,
          sorteios_por_concurso: regra.sorteiosPorConcurso,
        })),
      )
      .onConflict((conflito) =>
        conflito.column('codigo').doUpdateSet((eb) => ({
          nome: eb.ref('excluded.nome'),
          universo_minimo: eb.ref('excluded.universo_minimo'),
          universo_maximo: eb.ref('excluded.universo_maximo'),
          dezenas_por_sorteio: eb.ref('excluded.dezenas_por_sorteio'),
          sorteios_por_concurso: eb.ref('excluded.sorteios_por_concurso'),
        })),
      )
      .execute();
  }

  async listarResumos(): Promise<readonly ResumoJogo[]> {
    return this.#db
      .selectFrom('jogo as j')
      .select([
        'j.codigo',
        sql<number>`(select count(*) from concurso c where c.jogo = j.codigo)`.as('totalConcursos'),
        sql<number | null>`(select max(c.numero) from concurso c where c.jogo = j.codigo)`.as(
          'ultimoConcurso',
        ),
        sql<
          string | null
        >`(select max(c.data_apuracao) from concurso c where c.jogo = j.codigo)`.as('ultimaData'),
        sql<boolean | null>`(
          select c.acumulado from concurso c where c.jogo = j.codigo order by c.numero desc limit 1
        )`.as('ultimoAcumulado'),
        sql<Date | null>`(
          select max(e.finalizado_em) from ingestao_execucao e
          where e.jogo = j.codigo and e.status = 'concluida'
        )`.as('ultimaSincronizacao'),
      ])
      .execute();
  }
}

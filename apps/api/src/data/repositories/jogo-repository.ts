import type { Kysely } from 'kysely';
import type { RegraJogo } from '@mega/domain';
import type { Database } from '../database.ts';

export interface ResumoJogo {
  readonly codigo: string;
  readonly totalConcursos: number;
  readonly ultimoConcurso: number | null;
  readonly ultimaData: string | null;
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
    const linhas = await this.#db
      .selectFrom('jogo')
      .leftJoin('concurso', 'concurso.jogo', 'jogo.codigo')
      .select((eb) => [
        'jogo.codigo',
        eb.fn.count<number>('concurso.numero').as('totalConcursos'),
        eb.fn.max('concurso.numero').as('ultimoConcurso'),
        eb.fn.max('concurso.data_apuracao').as('ultimaData'),
      ])
      .groupBy('jogo.codigo')
      .execute();

    return linhas.map((linha) => ({
      codigo: linha.codigo,
      totalConcursos: linha.totalConcursos,
      ultimoConcurso: linha.ultimoConcurso,
      ultimaData: linha.ultimaData,
    }));
  }
}

import { sql, type Kysely, type Transaction } from 'kysely';
import type { ConcursoImportado } from '../../models/concurso-importado.ts';
import type { Database } from '../database.ts';

export interface RelatorioIntegridade {
  readonly totalConcursos: number;
  readonly ultimoConcurso: number | null;
  readonly numerosAusentes: number[];
  readonly concursosComDezenasInvalidas: number[];
}

const LIMITE_RELATORIO = 50;

export class ConcursoEscritaRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async salvar(concurso: ConcursoImportado): Promise<void> {
    await this.#db.transaction().execute(async (trx) => {
      await this.#salvarConcurso(trx, concurso);
      await this.#substituirDezenas(trx, concurso);
      await this.#substituirPremiacoes(trx, concurso);
      await this.#salvarPayload(trx, concurso);
    });
  }

  async listarNumerosAusentes(jogo: string, ate: number): Promise<number[]> {
    const { rows } = await sql<{ numero: number }>`
      select serie.numero
      from generate_series(1, ${ate}::integer) as serie(numero)
      where not exists (
        select 1 from concurso c where c.jogo = ${jogo} and c.numero = serie.numero
      )
      order by serie.numero
    `.execute(this.#db);
    return rows.map((linha) => linha.numero);
  }

  async verificarIntegridade(
    jogo: string,
    dezenasPorConcurso: number,
  ): Promise<RelatorioIntegridade> {
    const resumo = await this.#db
      .selectFrom('concurso')
      .where('jogo', '=', jogo)
      .select((eb) => [eb.fn.count<number>('numero').as('total'), eb.fn.max('numero').as('ultimo')])
      .executeTakeFirstOrThrow();

    const ausentes = resumo.ultimo ? await this.listarNumerosAusentes(jogo, resumo.ultimo) : [];

    const invalidos = await this.#db
      .selectFrom('concurso as c')
      .leftJoin('dezena_sorteada as d', (join) =>
        join.onRef('d.jogo', '=', 'c.jogo').onRef('d.numero', '=', 'c.numero'),
      )
      .where('c.jogo', '=', jogo)
      .groupBy('c.numero')
      .having((eb) => eb.fn.count('d.dezena'), '<>', dezenasPorConcurso)
      .select('c.numero')
      .orderBy('c.numero')
      .limit(LIMITE_RELATORIO)
      .execute();

    return {
      totalConcursos: resumo.total,
      ultimoConcurso: resumo.ultimo,
      numerosAusentes: ausentes.slice(0, LIMITE_RELATORIO),
      concursosComDezenasInvalidas: invalidos.map((linha) => linha.numero),
    };
  }

  async #salvarConcurso(trx: Transaction<Database>, concurso: ConcursoImportado): Promise<void> {
    const valores = {
      jogo: concurso.jogo,
      numero: concurso.numero,
      data_apuracao: concurso.dataApuracao,
      acumulado: concurso.acumulado,
      valor_arrecadado: concurso.valorArrecadado,
      valor_acumulado_proximo: concurso.valorAcumuladoProximo,
      valor_estimado_proximo: concurso.valorEstimadoProximo,
      data_proximo: concurso.dataProximo,
      local_sorteio: concurso.localSorteio,
      municipio_uf: concurso.municipioUf,
    };

    await trx
      .insertInto('concurso')
      .values(valores)
      .onConflict((conflito) =>
        conflito.columns(['jogo', 'numero']).doUpdateSet({ ...valores, importado_em: sql`now()` }),
      )
      .execute();
  }

  async #substituirDezenas(trx: Transaction<Database>, concurso: ConcursoImportado): Promise<void> {
    await trx
      .deleteFrom('dezena_sorteada')
      .where('jogo', '=', concurso.jogo)
      .where('numero', '=', concurso.numero)
      .execute();

    if (concurso.dezenas.length === 0) return;

    await trx
      .insertInto('dezena_sorteada')
      .values(
        concurso.dezenas.map((dezena) => ({
          jogo: concurso.jogo,
          numero: concurso.numero,
          sorteio: dezena.sorteio,
          dezena: dezena.dezena,
          ordem_extracao: dezena.ordemExtracao,
        })),
      )
      .execute();
  }

  async #substituirPremiacoes(
    trx: Transaction<Database>,
    concurso: ConcursoImportado,
  ): Promise<void> {
    await trx
      .deleteFrom('premiacao')
      .where('jogo', '=', concurso.jogo)
      .where('numero', '=', concurso.numero)
      .execute();

    if (concurso.premiacoes.length === 0) return;

    await trx
      .insertInto('premiacao')
      .values(
        concurso.premiacoes.map((premiacao) => ({
          jogo: concurso.jogo,
          numero: concurso.numero,
          faixa: premiacao.faixa,
          descricao: premiacao.descricao,
          ganhadores: premiacao.ganhadores,
          valor_premio: premiacao.valorPremio,
        })),
      )
      .execute();
  }

  async #salvarPayload(trx: Transaction<Database>, concurso: ConcursoImportado): Promise<void> {
    const valores = {
      jogo: concurso.jogo,
      numero: concurso.numero,
      payload: JSON.stringify(concurso.payload),
      hash: concurso.hashPayload,
    };

    await trx
      .insertInto('payload_bruto')
      .values(valores)
      .onConflict((conflito) =>
        conflito
          .columns(['jogo', 'numero'])
          .doUpdateSet({ payload: valores.payload, hash: valores.hash, obtido_em: sql`now()` }),
      )
      .execute();
  }
}

import type { Kysely, Selectable } from 'kysely';
import type { Database, IngestaoExecucaoTabela } from '../database.ts';

export type GatilhoIngestao = 'inicializacao' | 'agendada' | 'manual';
export type StatusIngestao = 'executando' | 'concluida' | 'falhou' | 'interrompida';

export interface ExecucaoIngestao {
  readonly id: number;
  readonly jogo: string;
  readonly gatilho: GatilhoIngestao;
  readonly status: StatusIngestao;
  readonly iniciadoEm: string;
  readonly finalizadoEm: string | null;
  readonly ultimoConcursoCaixa: number | null;
  readonly totalPrevisto: number;
  readonly importados: number;
  readonly erro: string | null;
}

const paraExecucao = (linha: Selectable<IngestaoExecucaoTabela>): ExecucaoIngestao => ({
  id: linha.id,
  jogo: linha.jogo,
  gatilho: linha.gatilho as GatilhoIngestao,
  status: linha.status as StatusIngestao,
  iniciadoEm: linha.iniciado_em.toISOString(),
  finalizadoEm: linha.finalizado_em?.toISOString() ?? null,
  ultimoConcursoCaixa: linha.ultimo_concurso_caixa,
  totalPrevisto: linha.total_previsto,
  importados: linha.importados,
  erro: linha.erro,
});

export class IngestaoRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async iniciar(jogo: string, gatilho: GatilhoIngestao): Promise<number> {
    const { id } = await this.#db
      .insertInto('ingestao_execucao')
      .values({ jogo, gatilho, status: 'executando' satisfies StatusIngestao })
      .returning('id')
      .executeTakeFirstOrThrow();
    return id;
  }

  async registrarPlano(
    id: number,
    ultimoConcursoCaixa: number,
    totalPrevisto: number,
  ): Promise<void> {
    await this.#db
      .updateTable('ingestao_execucao')
      .set({ ultimo_concurso_caixa: ultimoConcursoCaixa, total_previsto: totalPrevisto })
      .where('id', '=', id)
      .execute();
  }

  async registrarProgresso(id: number, importados: number): Promise<void> {
    await this.#db
      .updateTable('ingestao_execucao')
      .set({ importados })
      .where('id', '=', id)
      .execute();
  }

  async finalizar(
    id: number,
    status: Exclude<StatusIngestao, 'executando'>,
    importados: number,
    erro: string | null = null,
  ): Promise<void> {
    await this.#db
      .updateTable('ingestao_execucao')
      .set({ status, importados, erro, finalizado_em: new Date() })
      .where('id', '=', id)
      .execute();
  }

  async interromperPendentes(): Promise<number> {
    const resultado = await this.#db
      .updateTable('ingestao_execucao')
      .set({
        status: 'interrompida' satisfies StatusIngestao,
        finalizado_em: new Date(),
        erro: 'Processo encerrado antes da conclusão',
      })
      .where('status', '=', 'executando' satisfies StatusIngestao)
      .executeTakeFirst();
    return Number(resultado.numUpdatedRows);
  }

  async obterUltima(jogo: string): Promise<ExecucaoIngestao | null> {
    const linha = await this.#db
      .selectFrom('ingestao_execucao')
      .selectAll()
      .where('jogo', '=', jogo)
      .orderBy('id', 'desc')
      .limit(1)
      .executeTakeFirst();
    return linha ? paraExecucao(linha) : null;
  }
}

import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export interface ValorJogo {
  readonly jogo: string;
  readonly valorAposta: number;
  readonly atualizadoEm: string;
}

export class ValorJogoRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listar(): Promise<ValorJogo[]> {
    const linhas = await this.#db.selectFrom('valor_jogo').selectAll().execute();
    return linhas.map((linha) => ({
      jogo: linha.jogo,
      valorAposta: linha.valor_aposta,
      atualizadoEm: linha.atualizado_em.toISOString(),
    }));
  }

  async obter(jogo: string): Promise<number | null> {
    const linha = await this.#db
      .selectFrom('valor_jogo')
      .select('valor_aposta')
      .where('jogo', '=', jogo)
      .executeTakeFirst();
    return linha?.valor_aposta ?? null;
  }

  async salvar(jogo: string, valorAposta: number): Promise<void> {
    await this.#db
      .insertInto('valor_jogo')
      .values({ jogo, valor_aposta: valorAposta })
      .onConflict((conflito) =>
        conflito
          .column('jogo')
          .doUpdateSet({ valor_aposta: valorAposta, atualizado_em: sql`now()` }),
      )
      .execute();
  }
}

import { sql, type Kysely, type Selectable } from 'kysely';
import type { Database, FavoritoTabela } from '../database.ts';

export interface Favorito {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

export interface DadosFavorito {
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: readonly number[];
}

const paraFavorito = (linha: Selectable<FavoritoTabela>): Favorito => ({
  id: linha.id,
  jogo: linha.jogo,
  nome: linha.nome,
  dezenas: linha.dezenas,
  criadoEm: linha.criado_em.toISOString(),
  atualizadoEm: linha.atualizado_em.toISOString(),
});

const arrayDezenas = (dezenas: readonly number[]) =>
  sql<number[]>`${sql.val([...dezenas].sort((a, b) => a - b))}::smallint[]`;

export class FavoritoRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listar(): Promise<Favorito[]> {
    const linhas = await this.#db
      .selectFrom('favorito')
      .selectAll()
      .orderBy('id', 'desc')
      .execute();
    return linhas.map(paraFavorito);
  }

  async obter(id: number): Promise<Favorito | undefined> {
    const linha = await this.#db
      .selectFrom('favorito')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return linha ? paraFavorito(linha) : undefined;
  }

  async criar(dados: DadosFavorito): Promise<Favorito> {
    const linha = await this.#db
      .insertInto('favorito')
      .values({ jogo: dados.jogo, nome: dados.nome, dezenas: arrayDezenas(dados.dezenas) })
      .returningAll()
      .executeTakeFirstOrThrow();
    return paraFavorito(linha);
  }

  async atualizar(id: number, dados: DadosFavorito): Promise<Favorito | undefined> {
    const linha = await this.#db
      .updateTable('favorito')
      .set({
        jogo: dados.jogo,
        nome: dados.nome,
        dezenas: arrayDezenas(dados.dezenas),
        atualizado_em: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return linha ? paraFavorito(linha) : undefined;
  }

  async excluir(id: number): Promise<boolean> {
    const resultado = await this.#db.deleteFrom('favorito').where('id', '=', id).executeTakeFirst();
    return resultado.numDeletedRows > 0n;
  }
}

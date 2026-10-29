import { sql, type Kysely, type Selectable } from 'kysely';
import type { ApostaTabela, Database } from '../database.ts';

export interface Aposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favorita: boolean;
  readonly criadaEm: string;
  readonly atualizadaEm: string;
}

export interface DadosAposta {
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: readonly number[];
  readonly favorita: boolean;
}

export interface AcertosPorFaixa {
  readonly apostaId: number;
  readonly acertos: number;
  readonly concursos: number;
}

export interface AcertosUltimoConcurso {
  readonly apostaId: number;
  readonly numero: number;
  readonly data: string;
  readonly dezenasAcertadas: number[];
}

const paraAposta = (linha: Selectable<ApostaTabela>): Aposta => ({
  id: linha.id,
  jogo: linha.jogo,
  nome: linha.nome,
  dezenas: linha.dezenas,
  favorita: linha.favorita,
  criadaEm: linha.criada_em.toISOString(),
  atualizadaEm: linha.atualizada_em.toISOString(),
});

const arrayDezenas = (dezenas: readonly number[]) =>
  sql<number[]>`${sql.val([...dezenas].sort((a, b) => a - b))}::smallint[]`;

export class ApostaRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listar(somenteFavoritas: boolean): Promise<Aposta[]> {
    let consulta = this.#db.selectFrom('aposta').selectAll().orderBy('id', 'desc');
    if (somenteFavoritas) consulta = consulta.where('favorita', '=', true);
    return (await consulta.execute()).map(paraAposta);
  }

  async obter(id: number): Promise<Aposta | undefined> {
    const linha = await this.#db
      .selectFrom('aposta')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return linha ? paraAposta(linha) : undefined;
  }

  async criar(dados: DadosAposta): Promise<Aposta> {
    const linha = await this.#db
      .insertInto('aposta')
      .values({
        jogo: dados.jogo,
        nome: dados.nome,
        dezenas: arrayDezenas(dados.dezenas),
        favorita: dados.favorita,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return paraAposta(linha);
  }

  async atualizar(id: number, dados: DadosAposta): Promise<Aposta | undefined> {
    const linha = await this.#db
      .updateTable('aposta')
      .set({
        jogo: dados.jogo,
        nome: dados.nome,
        dezenas: arrayDezenas(dados.dezenas),
        favorita: dados.favorita,
        atualizada_em: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return linha ? paraAposta(linha) : undefined;
  }

  async excluir(id: number): Promise<boolean> {
    const resultado = await this.#db.deleteFrom('aposta').where('id', '=', id).executeTakeFirst();
    return resultado.numDeletedRows > 0n;
  }

  async contarAcertosHistoricos(
    ids: readonly number[],
    minimoAcertos: number,
  ): Promise<AcertosPorFaixa[]> {
    if (ids.length === 0) return [];
    const { rows } = await sql<AcertosPorFaixa>`
      select a.id::integer as "apostaId", h.acertos::integer as "acertos", count(*)::integer as "concursos"
      from aposta a
      cross join lateral (
        select d.numero, count(*) as acertos
        from dezena_sorteada d
        where d.jogo = a.jogo and d.sorteio = 1 and d.dezena = any(a.dezenas)
        group by d.numero
        having count(*) >= ${minimoAcertos}
      ) h
      where a.id in (${sql.join(ids)})
      group by a.id, h.acertos
    `.execute(this.#db);
    return rows;
  }

  async conferirUltimoConcurso(ids: readonly number[]): Promise<AcertosUltimoConcurso[]> {
    if (ids.length === 0) return [];
    const { rows } = await sql<AcertosUltimoConcurso>`
      select
        a.id::integer as "apostaId",
        c.numero as "numero",
        c.data_apuracao as "data",
        coalesce(
          array_agg(d.dezena order by d.dezena) filter (where d.dezena = any(a.dezenas)),
          '{}'
        ) as "dezenasAcertadas"
      from aposta a
      join lateral (
        select numero, data_apuracao from concurso
        where jogo = a.jogo order by numero desc limit 1
      ) c on true
      left join dezena_sorteada d on d.jogo = a.jogo and d.numero = c.numero and d.sorteio = 1
      where a.id in (${sql.join(ids)})
      group by a.id, c.numero, c.data_apuracao
    `.execute(this.#db);
    return rows;
  }
}

import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export interface Aposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favoritoId: number | null;
  readonly concurso: number | null;
  readonly valor: number | null;
  readonly criadaEm: string;
}

export interface ApostaFiltrada extends Aposta {
  readonly coincidencias: number | null;
}

export interface FiltroApostas {
  readonly dezenas: readonly number[];
  readonly minimoCoincidencias: number;
}

export interface Paginacao {
  readonly deslocamento: number;
  readonly limite: number;
}

interface LinhaAposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favorito_id: number | null;
  readonly concurso: number | null;
  readonly valor: number | null;
  readonly criada_em: Date;
  readonly coincidencias: number | null;
  readonly total: number;
}

const paraAposta = (linha: LinhaAposta): ApostaFiltrada => ({
  id: linha.id,
  jogo: linha.jogo,
  nome: linha.nome,
  dezenas: linha.dezenas,
  favoritoId: linha.favorito_id,
  concurso: linha.concurso,
  valor: linha.valor,
  criadaEm: linha.criada_em.toISOString(),
  coincidencias: linha.coincidencias,
});

export class ApostaRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listar(
    filtro: FiltroApostas,
    paginacao: Paginacao,
  ): Promise<{ readonly itens: ApostaFiltrada[]; readonly total: number }> {
    const filtrar = filtro.dezenas.length > 0;
    const dezenasFiltro = sql`${sql.val([...filtro.dezenas])}::smallint[]`;
    const coincidencias = filtrar
      ? sql<number>`cardinality(array(select unnest(a.dezenas) intersect select unnest(${dezenasFiltro})))`
      : sql<null>`null::integer`;

    const { rows } = await sql<LinhaAposta>`
      select * from (
        select a.*, ${coincidencias} as coincidencias
        from aposta a
      ) a
      where ${filtrar ? sql`a.coincidencias >= ${filtro.minimoCoincidencias}` : sql`true`}
      order by ${filtrar ? sql`a.coincidencias desc,` : sql``} a.id desc
      limit ${paginacao.limite} offset ${paginacao.deslocamento}
    `.execute(this.#db);

    const { rows: contagem } = await sql<{ total: number }>`
      select count(*)::integer as total from (
        select ${coincidencias} as coincidencias from aposta a
      ) a
      where ${filtrar ? sql`a.coincidencias >= ${filtro.minimoCoincidencias}` : sql`true`}
    `.execute(this.#db);

    return { itens: rows.map(paraAposta), total: contagem[0]?.total ?? 0 };
  }

  async listarTodas(): Promise<Aposta[]> {
    const linhas = await this.#db.selectFrom('aposta').selectAll().orderBy('id', 'desc').execute();
    return linhas.map((linha) => ({
      id: linha.id,
      jogo: linha.jogo,
      nome: linha.nome,
      dezenas: linha.dezenas,
      favoritoId: linha.favorito_id,
      concurso: linha.concurso,
      valor: linha.valor,
      criadaEm: linha.criada_em.toISOString(),
    }));
  }

  async criarLote(
    jogo: string,
    concurso: number,
    itens: readonly NovaApostaItem[],
  ): Promise<number[]> {
    return this.#db.transaction().execute(async (trx) => {
      const idsFavoritos = itens.flatMap((item) =>
        item.favoritoId === null ? [] : [item.favoritoId],
      );
      const existentes = new Set(
        idsFavoritos.length === 0
          ? []
          : (
              await trx
                .selectFrom('favorito')
                .select('id')
                .where('id', 'in', idsFavoritos)
                .execute()
            ).map((linha) => linha.id),
      );

      const criadas = await trx
        .insertInto('aposta')
        .values(
          itens.map((item) => ({
            jogo,
            concurso,
            nome: item.nome,
            valor: item.valor,
            dezenas: sql<number[]>`${sql.val([...item.dezenas].sort((a, b) => a - b))}::smallint[]`,
            favorito_id:
              item.favoritoId !== null && existentes.has(item.favoritoId) ? item.favoritoId : null,
          })),
        )
        .returning('id')
        .execute();

      return criadas.map((linha) => linha.id);
    });
  }
}

export interface NovaApostaItem {
  readonly dezenas: readonly number[];
  readonly nome: string | null;
  readonly favoritoId: number | null;
  readonly valor: number | null;
}

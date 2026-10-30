import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export interface Teimosinha {
  readonly grupo: string;
  readonly posicao: number;
  readonly total: number;
}

export interface Aposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favoritoId: number | null;
  readonly concurso: number | null;
  readonly valor: number | null;
  readonly criadaEm: string;
  readonly teimosinha: Teimosinha | null;
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
  readonly teimosinha_grupo: string | null;
  readonly teimosinha_posicao: number | null;
  readonly teimosinha_total: number | null;
  readonly coincidencias: number | null;
  readonly total: number;
}

type ColunasTeimosinha = Pick<
  LinhaAposta,
  'teimosinha_grupo' | 'teimosinha_posicao' | 'teimosinha_total'
>;

const paraTeimosinha = (linha: ColunasTeimosinha): Teimosinha | null =>
  linha.teimosinha_grupo === null ||
  linha.teimosinha_posicao === null ||
  linha.teimosinha_total === null
    ? null
    : {
        grupo: linha.teimosinha_grupo,
        posicao: linha.teimosinha_posicao,
        total: linha.teimosinha_total,
      };

const paraApostaBase = (linha: Omit<LinhaAposta, 'coincidencias' | 'total'>): Aposta => ({
  id: linha.id,
  jogo: linha.jogo,
  nome: linha.nome,
  dezenas: linha.dezenas,
  favoritoId: linha.favorito_id,
  concurso: linha.concurso,
  valor: linha.valor,
  criadaEm: linha.criada_em.toISOString(),
  teimosinha: paraTeimosinha(linha),
});

const paraAposta = (linha: LinhaAposta): ApostaFiltrada => ({
  ...paraApostaBase(linha),
  coincidencias: linha.coincidencias,
});

export class ApostaRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listar(
    usuarioId: number,
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
        where a.usuario_id = ${usuarioId}
      ) a
      where ${filtrar ? sql`a.coincidencias >= ${filtro.minimoCoincidencias}` : sql`true`}
      order by ${filtrar ? sql`a.coincidencias desc,` : sql``} a.id desc
      limit ${paginacao.limite} offset ${paginacao.deslocamento}
    `.execute(this.#db);

    const { rows: contagem } = await sql<{ total: number }>`
      select count(*)::integer as total from (
        select ${coincidencias} as coincidencias from aposta a where a.usuario_id = ${usuarioId}
      ) a
      where ${filtrar ? sql`a.coincidencias >= ${filtro.minimoCoincidencias}` : sql`true`}
    `.execute(this.#db);

    return { itens: rows.map(paraAposta), total: contagem[0]?.total ?? 0 };
  }

  async listarTodas(usuarioId: number): Promise<Aposta[]> {
    return this.#listarSelecionadas(usuarioId, false);
  }

  async listarNaoConferidas(usuarioId: number): Promise<Aposta[]> {
    return this.#listarSelecionadas(usuarioId, true);
  }

  async marcarConferidas(usuarioId: number, ids: readonly number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const resultado = await this.#db
      .updateTable('aposta')
      .set({ conferida_em: sql`now()` })
      .where('usuario_id', '=', usuarioId)
      .where('id', 'in', [...ids])
      .where('conferida_em', 'is', null)
      .executeTakeFirst();
    return Number(resultado.numUpdatedRows);
  }

  async #listarSelecionadas(usuarioId: number, somenteNaoConferidas: boolean): Promise<Aposta[]> {
    const linhas = await this.#db
      .selectFrom('aposta')
      .selectAll()
      .where('usuario_id', '=', usuarioId)
      .$if(somenteNaoConferidas, (consulta) => consulta.where('conferida_em', 'is', null))
      .orderBy('id', 'desc')
      .execute();
    return linhas.map(paraApostaBase);
  }

  async obter(usuarioId: number, id: number): Promise<Aposta | undefined> {
    const linha = await this.#db
      .selectFrom('aposta')
      .selectAll()
      .where('usuario_id', '=', usuarioId)
      .where('id', '=', id)
      .executeTakeFirst();
    return linha ? paraApostaBase(linha) : undefined;
  }

  async atualizarPendentes(
    usuarioId: number,
    alvo: AlvoEdicao,
    dados: DadosEdicaoAposta,
  ): Promise<number[]> {
    const linhas = await this.#db
      .updateTable('aposta')
      .set({
        nome: dados.nome,
        valor: dados.valor,
        favorito_id: dados.favoritoId,
        dezenas: sql<number[]>`${sql.val([...dados.dezenas].sort((a, b) => a - b))}::smallint[]`,
      })
      .where('usuario_id', '=', usuarioId)
      .where('concurso', '>', alvo.aposDoConcurso)
      .$if(alvo.teimosinhaGrupo === null, (consulta) => consulta.where('id', '=', alvo.id))
      .$if(alvo.teimosinhaGrupo !== null, (consulta) =>
        consulta.where('teimosinha_grupo', '=', alvo.teimosinhaGrupo),
      )
      .returning('id')
      .execute();
    return linhas.map((linha) => linha.id);
  }

  async criarLote(usuarioId: number, itens: readonly NovaApostaItem[]): Promise<number[]> {
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
                .where('usuario_id', '=', usuarioId)
                .where('id', 'in', idsFavoritos)
                .execute()
            ).map((linha) => linha.id),
      );

      const criadas = await trx
        .insertInto('aposta')
        .values(
          itens.map((item) => ({
            usuario_id: usuarioId,
            jogo: item.jogo,
            concurso: item.concurso,
            nome: item.nome,
            valor: item.valor,
            dezenas: sql<number[]>`${sql.val([...item.dezenas].sort((a, b) => a - b))}::smallint[]`,
            favorito_id:
              item.favoritoId !== null && existentes.has(item.favoritoId) ? item.favoritoId : null,
            teimosinha_grupo: item.teimosinha?.grupo ?? null,
            teimosinha_posicao: item.teimosinha?.posicao ?? null,
            teimosinha_total: item.teimosinha?.total ?? null,
          })),
        )
        .returning('id')
        .execute();

      return criadas.map((linha) => linha.id);
    });
  }
}

export interface NovaApostaItem {
  readonly jogo: string;
  readonly concurso: number;
  readonly dezenas: readonly number[];
  readonly nome: string | null;
  readonly favoritoId: number | null;
  readonly valor: number | null;
  readonly teimosinha: Teimosinha | null;
}

export interface AlvoEdicao {
  readonly id: number;
  readonly teimosinhaGrupo: string | null;
  readonly aposDoConcurso: number;
}

export interface DadosEdicaoAposta {
  readonly dezenas: readonly number[];
  readonly nome: string | null;
  readonly valor: number | null;
  readonly favoritoId: number | null;
}

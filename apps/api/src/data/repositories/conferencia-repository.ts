import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export interface ItemConferivel {
  readonly id: number;
  readonly jogo: string;
  readonly dezenas: readonly number[];
  readonly concurso: number | null;
}

export interface AcertosPorFaixa {
  readonly itemId: number;
  readonly acertos: number;
  readonly concursos: number;
}

export interface AcertosNoConcurso {
  readonly itemId: number;
  readonly numero: number;
  readonly data: string;
  readonly dezenasAcertadas: number[];
}

const comoJson = (itens: readonly ItemConferivel[]) =>
  sql`${JSON.stringify(
    itens.map((item) => ({
      id: item.id,
      jogo: item.jogo,
      dezenas: item.dezenas,
      concurso: item.concurso,
    })),
  )}::jsonb`;

export class ConferenciaRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async contarAcertosHistoricos(
    itens: readonly ItemConferivel[],
    minimoAcertos: number,
  ): Promise<AcertosPorFaixa[]> {
    if (itens.length === 0) return [];
    const { rows } = await sql<AcertosPorFaixa>`
      with alvo as (
        select * from jsonb_to_recordset(${comoJson(itens)})
          as x(id integer, jogo text, dezenas smallint[], concurso integer)
      )
      select a.id as "itemId", h.acertos::integer as "acertos", count(*)::integer as "concursos"
      from alvo a
      cross join lateral (
        select d.numero, count(*) as acertos
        from dezena_sorteada d
        where d.jogo = a.jogo and d.sorteio = 1 and d.dezena = any(a.dezenas)
        group by d.numero
        having count(*) >= ${minimoAcertos}
      ) h
      group by a.id, h.acertos
    `.execute(this.#db);
    return rows;
  }

  async conferirConcurso(itens: readonly ItemConferivel[]): Promise<AcertosNoConcurso[]> {
    if (itens.length === 0) return [];
    const { rows } = await sql<AcertosNoConcurso>`
      with alvo as (
        select * from jsonb_to_recordset(${comoJson(itens)})
          as x(id integer, jogo text, dezenas smallint[], concurso integer)
      ),
      referencia as (
        select a.id, a.jogo, a.dezenas,
          case when a.concurso is null
            then (select max(c.numero) from concurso c where c.jogo = a.jogo)
            else (select c.numero from concurso c where c.jogo = a.jogo and c.numero = a.concurso)
          end as numero
        from alvo a
      )
      select
        r.id as "itemId",
        c.numero as "numero",
        c.data_apuracao as "data",
        coalesce(
          array_agg(d.dezena order by d.dezena) filter (where d.dezena = any(r.dezenas)),
          '{}'
        ) as "dezenasAcertadas"
      from referencia r
      join concurso c on c.jogo = r.jogo and c.numero = r.numero
      left join dezena_sorteada d on d.jogo = r.jogo and d.numero = r.numero and d.sorteio = 1
      group by r.id, c.numero, c.data_apuracao
    `.execute(this.#db);
    return rows;
  }
}

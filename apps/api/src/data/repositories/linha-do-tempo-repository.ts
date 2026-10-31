import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.ts';

export type OrigemAcerto = 'aposta' | 'favorito';

export interface SorteioLinhaDoTempo {
  readonly numero: number;
  readonly data: string;
  readonly dezenas: number[];
}

export interface AcertosAgrupados {
  readonly numero: number;
  readonly origem: OrigemAcerto;
  readonly quantidadeDezenas: number;
  readonly acertos: number;
  readonly itens: number;
}

export interface IntervaloConcursos {
  readonly de: number;
  readonly ate: number;
}

export class LinhaDoTempoRepository {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async listarSorteios(jogo: string, ultimos: number): Promise<SorteioLinhaDoTempo[]> {
    const { rows } = await sql<SorteioLinhaDoTempo>`
      with recentes as (
        select numero, data_apuracao from concurso
        where jogo = ${jogo}
        order by numero desc
        limit ${ultimos}
      )
      select
        r.numero as "numero",
        r.data_apuracao as "data",
        array_agg(d.dezena order by d.dezena) as "dezenas"
      from recentes r
      join dezena_sorteada d on d.jogo = ${jogo} and d.numero = r.numero and d.sorteio = 1
      group by r.numero, r.data_apuracao
      order by r.numero
    `.execute(this.#db);
    return rows;
  }

  async listarAcertos(
    usuarioId: number,
    jogo: string,
    intervalo: IntervaloConcursos,
  ): Promise<AcertosAgrupados[]> {
    const { rows } = await sql<AcertosAgrupados>`
      with sorteio as (
        select numero, array_agg(dezena) as dezenas
        from dezena_sorteada
        where jogo = ${jogo} and sorteio = 1 and numero between ${intervalo.de} and ${intervalo.ate}
        group by numero
      ),
      apostas as (
        select concurso as numero, dezenas
        from aposta
        where usuario_id = ${usuarioId}
          and jogo = ${jogo}
          and concurso between ${intervalo.de} and ${intervalo.ate}
      ),
      favoritos as (
        select c.numero, f.dezenas
        from favorito f
        join concurso c
          on c.jogo = f.jogo
          and c.numero between ${intervalo.de} and ${intervalo.ate}
          and c.data_apuracao >= f.criado_em::date
        where f.usuario_id = ${usuarioId}
          and f.jogo = ${jogo}
          and not exists (
            select 1 from apostas a
            where a.numero = c.numero and a.dezenas @> f.dezenas and a.dezenas <@ f.dezenas
          )
      ),
      itens as (
        select 'aposta' as origem, numero, dezenas from apostas
        union all
        select 'favorito' as origem, numero, dezenas from favoritos
      ),
      conferidos as (
        select
          i.numero,
          i.origem,
          cardinality(i.dezenas) as quantidade_dezenas,
          (select count(*) from unnest(i.dezenas) as d(dezena) where d.dezena = any(s.dezenas))
            as acertos
        from itens i
        join sorteio s on s.numero = i.numero
      )
      select
        numero as "numero",
        origem as "origem",
        quantidade_dezenas::int as "quantidadeDezenas",
        acertos::int as "acertos",
        count(*)::int as "itens"
      from conferidos
      group by numero, origem, quantidade_dezenas, acertos
    `.execute(this.#db);
    return rows;
  }
}

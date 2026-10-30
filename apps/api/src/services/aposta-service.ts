import { randomUUID } from 'node:crypto';
import {
  calcularValorAposta,
  contarPremiosAposta,
  isCodigoJogo,
  obterRegraJogo,
  TEIMOSINHA_MAXIMA,
  validarAposta,
  type PremioAposta,
  type RegraJogo,
} from '@mega/domain';
import type { ValorJogoRepository } from '../data/repositories/valor-jogo-repository.ts';
import type {
  Aposta,
  ApostaFiltrada,
  ApostaRepository,
  NovaApostaItem,
} from '../data/repositories/aposta-repository.ts';
import type { ConcursoLeituraRepository } from '../data/repositories/concurso-leitura-repository.ts';
import { entradaInvalida } from '../shared/erros.ts';
import type { Conferencia, ConferenciaService } from './conferencia-service.ts';

export interface ApostaConferida extends ApostaFiltrada {
  readonly conferencia: Conferencia;
}

export interface ConsultaApostas {
  readonly dezenas: readonly number[];
  readonly minimoCoincidencias?: number | undefined;
  readonly pagina: number;
  readonly tamanho: number;
}

export interface PaginaApostas {
  readonly itens: ApostaConferida[];
  readonly total: number;
  readonly pagina: number;
  readonly tamanho: number;
}

export interface PremioConferido extends PremioAposta {
  readonly valorUnitario: number | null;
}

export interface ApostaAConferir extends Aposta {
  readonly conferencia: Conferencia;
  readonly premios: PremioConferido[];
  readonly premioTotal: number | null;
}

export interface AcertosConcurso {
  readonly jogo: string;
  readonly concurso: number;
  readonly dezenas: number[];
}

export interface ResumoApostas {
  readonly total: number;
  readonly comAcertos: number;
  readonly maiorAcerto: number;
  readonly melhor: {
    readonly id: number;
    readonly nome: string | null;
    readonly concurso: number;
  } | null;
}

interface ItemEfetivacao {
  readonly jogo: string;
  readonly dezenas: readonly number[];
  readonly nome?: string | null | undefined;
  readonly favoritoId?: number | null | undefined;
  readonly teimosinha?: number | undefined;
}

export interface EfetivacaoApostas {
  readonly itens: readonly ItemEfetivacao[];
}

export interface ApostasEfetivadas {
  readonly concursos: { jogo: string; concurso: number }[];
  readonly ids: number[];
  readonly valorTotal: number | null;
}

interface ContextoJogo {
  readonly regra: RegraJogo;
  readonly concurso: number;
  readonly valorSimples: number | null;
}

const CONFERENCIA_PENDENTE: Conferencia = { concursoConferido: null, historico: [] };

const somarPremios = (premios: readonly PremioConferido[]): number | null =>
  premios.some((premio) => premio.valorUnitario === null)
    ? null
    : Math.round(
        premios.reduce(
          (soma, premio) => soma + premio.quantidade * (premio.valorUnitario ?? 0),
          0,
        ) * 100,
      ) / 100;

const ordenarParaConferencia = (a: ApostaAConferir, b: ApostaAConferir): number => {
  const sorteioA = a.conferencia.concursoConferido?.numero ?? null;
  const sorteioB = b.conferencia.concursoConferido?.numero ?? null;
  if (sorteioA !== null && sorteioB !== null) return sorteioB - sorteioA || b.id - a.id;
  if (sorteioA !== null) return -1;
  if (sorteioB !== null) return 1;
  return (a.concurso ?? 0) - (b.concurso ?? 0) || b.id - a.id;
};

const expandirTeimosinha = (item: NovaApostaItem, quantidade: number): NovaApostaItem[] => {
  if (quantidade === 1) return [item];
  const grupo = randomUUID();
  return Array.from({ length: quantidade }, (_, indice) => ({
    ...item,
    concurso: item.concurso + indice,
    teimosinha: { grupo, posicao: indice + 1, total: quantidade },
  }));
};

const somenteProximaDaTeimosinha = (apostas: readonly ApostaAConferir[]): ApostaAConferir[] => {
  const proximas = new Map<string, number>();
  for (const aposta of apostas) {
    if (!aposta.teimosinha || aposta.conferencia.concursoConferido) continue;
    const atual = proximas.get(aposta.teimosinha.grupo);
    if (atual === undefined || (aposta.concurso ?? 0) < atual)
      proximas.set(aposta.teimosinha.grupo, aposta.concurso ?? 0);
  }
  return apostas.filter(
    (aposta) =>
      !aposta.teimosinha ||
      aposta.conferencia.concursoConferido !== null ||
      proximas.get(aposta.teimosinha.grupo) === aposta.concurso,
  );
};

const LIMITE_DEZENAS_FILTRO = 20;
const LIMITE_ITENS_EFETIVACAO = 200;
const TAMANHO_MAXIMO_NOME = 80;

export class ApostaService {
  readonly #repository: ApostaRepository;
  readonly #conferencia: ConferenciaService;
  readonly #concursos: ConcursoLeituraRepository;
  readonly #valores: ValorJogoRepository;

  constructor(
    repository: ApostaRepository,
    conferencia: ConferenciaService,
    concursos: ConcursoLeituraRepository,
    valores: ValorJogoRepository,
  ) {
    this.#repository = repository;
    this.#conferencia = conferencia;
    this.#concursos = concursos;
    this.#valores = valores;
  }

  async efetivar(usuarioId: number, efetivacao: EfetivacaoApostas): Promise<ApostasEfetivadas> {
    if (efetivacao.itens.length === 0 || efetivacao.itens.length > LIMITE_ITENS_EFETIVACAO) {
      throw entradaInvalida(`Informe de 1 a ${LIMITE_ITENS_EFETIVACAO} apostas`);
    }

    const contextos = await this.#prepararJogos(efetivacao.itens.map((item) => item.jogo));

    const itens: NovaApostaItem[] = efetivacao.itens.flatMap((item, indice) => {
      const contexto = contextos.get(item.jogo);
      if (!contexto) throw entradaInvalida(`Jogo ${item.jogo} ainda não está disponível`);
      const erros = validarAposta(contexto.regra, item.dezenas);
      if (erros.length > 0) {
        throw entradaInvalida(`Aposta ${indice + 1} inválida: ${JSON.stringify(erros)}`);
      }
      const teimosinha = item.teimosinha ?? 1;
      if (!Number.isInteger(teimosinha) || teimosinha < 1 || teimosinha > TEIMOSINHA_MAXIMA) {
        throw entradaInvalida(`Teimosinha deve ser de 1 a ${TEIMOSINHA_MAXIMA} concursos`);
      }
      const nome = item.nome?.trim().slice(0, TAMANHO_MAXIMO_NOME) ?? '';
      return expandirTeimosinha(
        {
          jogo: item.jogo,
          concurso: contexto.concurso,
          dezenas: item.dezenas,
          nome: nome.length > 0 ? nome : null,
          favoritoId: item.favoritoId ?? null,
          valor:
            contexto.valorSimples === null
              ? null
              : calcularValorAposta(contexto.regra, item.dezenas.length, contexto.valorSimples),
          teimosinha: null,
        },
        teimosinha,
      );
    });

    const ids = await this.#repository.criarLote(usuarioId, itens);
    const valorTotal = itens.some((item) => item.valor === null)
      ? null
      : Math.round(itens.reduce((soma, item) => soma + (item.valor ?? 0), 0) * 100) / 100;
    const concursos = [...contextos.values()].map(({ regra, concurso }) => ({
      jogo: regra.codigo,
      concurso,
    }));
    return { concursos, ids, valorTotal };
  }

  async #prepararJogos(jogos: readonly string[]): Promise<Map<string, ContextoJogo>> {
    const contextos = new Map<string, ContextoJogo>();
    for (const jogo of new Set(jogos)) {
      if (!isCodigoJogo(jogo)) throw entradaInvalida(`Jogo ${jogo} ainda não está disponível`);
      const [ultimo, valorSimples] = await Promise.all([
        this.#concursos.obterNumeroUltimo(jogo),
        this.#valores.obter(jogo),
      ]);
      if (ultimo === null) throw entradaInvalida(`Não há concursos importados para ${jogo}`);
      contextos.set(jogo, { regra: obterRegraJogo(jogo), concurso: ultimo + 1, valorSimples });
    }
    return contextos;
  }

  async listar(usuarioId: number, consulta: ConsultaApostas): Promise<PaginaApostas> {
    const dezenas = [...new Set(consulta.dezenas)];
    if (dezenas.length > LIMITE_DEZENAS_FILTRO) {
      throw entradaInvalida(`Informe até ${LIMITE_DEZENAS_FILTRO} dezenas no filtro`);
    }
    const minimo = consulta.minimoCoincidencias ?? Math.min(dezenas.length, 6);

    const { itens, total } = await this.#repository.listar(
      usuarioId,
      { dezenas, minimoCoincidencias: minimo },
      { deslocamento: (consulta.pagina - 1) * consulta.tamanho, limite: consulta.tamanho },
    );
    const conferencias = await this.#conferencia.conferir(itens);

    return {
      itens: itens.flatMap((aposta) => {
        const conferencia = conferencias.get(aposta.id);
        return conferencia ? [{ ...aposta, conferencia }] : [];
      }),
      total,
      pagina: consulta.pagina,
      tamanho: consulta.tamanho,
    };
  }

  async listarAConferir(usuarioId: number): Promise<ApostaAConferir[]> {
    const apostas = await this.#repository.listarNaoConferidas(usuarioId);
    const conferencias = await this.#conferencia.conferir(apostas);
    const premiacoes = await this.#concursos.listarPremiacoes(
      apostas.flatMap((aposta) => {
        const numero = conferencias.get(aposta.id)?.concursoConferido?.numero;
        return numero === undefined ? [] : [{ jogo: aposta.jogo, numero }];
      }),
    );
    const valores = new Map(
      premiacoes.map((linha) => [
        `${linha.jogo}:${String(linha.numero)}:${String(linha.faixa)}`,
        linha.valorPremio,
      ]),
    );

    return somenteProximaDaTeimosinha(
      apostas.map((aposta) => {
        const conferencia = conferencias.get(aposta.id) ?? CONFERENCIA_PENDENTE;
        const premios = this.#calcularPremios(aposta, conferencia, valores);
        return { ...aposta, conferencia, premios, premioTotal: somarPremios(premios) };
      }),
    ).sort(ordenarParaConferencia);
  }

  async marcarConferidas(usuarioId: number, ids: readonly number[]): Promise<{ marcadas: number }> {
    const pendentes = await this.#repository.listarNaoConferidas(usuarioId);
    const solicitados = new Set(ids);
    const alvos = pendentes.filter((aposta) => solicitados.has(aposta.id));
    const conferencias = await this.#conferencia.conferir(alvos);
    const sorteadas = alvos.flatMap((aposta) =>
      conferencias.get(aposta.id)?.concursoConferido ? [aposta.id] : [],
    );
    return { marcadas: await this.#repository.marcarConferidas(usuarioId, sorteadas) };
  }

  #calcularPremios(
    aposta: Aposta,
    conferencia: Conferencia,
    valores: ReadonlyMap<string, number>,
  ): PremioConferido[] {
    const concurso = conferencia.concursoConferido;
    if (!concurso || !isCodigoJogo(aposta.jogo)) return [];
    return contarPremiosAposta(
      obterRegraJogo(aposta.jogo),
      aposta.dezenas.length,
      concurso.acertos,
    ).map((premio) => ({
      ...premio,
      valorUnitario:
        valores.get(`${aposta.jogo}:${String(concurso.numero)}:${String(premio.faixa)}`) ?? null,
    }));
  }

  async listarAcertosPorConcurso(usuarioId: number): Promise<AcertosConcurso[]> {
    const apostas = await this.#repository.listarTodas(usuarioId);
    const conferencias = await this.#conferencia.conferir(apostas);
    const grupos = new Map<string, { jogo: string; concurso: number; dezenas: Set<number> }>();

    for (const aposta of apostas) {
      const concurso = conferencias.get(aposta.id)?.concursoConferido;
      if (!concurso || concurso.acertos === 0) continue;
      const chave = `${aposta.jogo}:${String(concurso.numero)}`;
      const grupo = grupos.get(chave) ?? {
        jogo: aposta.jogo,
        concurso: concurso.numero,
        dezenas: new Set<number>(),
      };
      for (const dezena of concurso.dezenasAcertadas) grupo.dezenas.add(dezena);
      grupos.set(chave, grupo);
    }

    return [...grupos.values()].map(({ jogo, concurso, dezenas }) => ({
      jogo,
      concurso,
      dezenas: [...dezenas].sort((a, b) => a - b),
    }));
  }

  async resumir(usuarioId: number): Promise<ResumoApostas> {
    const apostas = await this.#repository.listarTodas(usuarioId);
    const conferencias = await this.#conferencia.conferir(apostas);

    let total = 0;
    let comAcertos = 0;
    let melhor: ResumoApostas['melhor'] = null;
    let maiorAcerto = 0;

    for (const aposta of apostas) {
      const concurso = conferencias.get(aposta.id)?.concursoConferido;
      if (!concurso) continue;
      total++;
      if (concurso.acertos === 0) continue;
      comAcertos++;
      if (concurso.acertos > maiorAcerto) {
        maiorAcerto = concurso.acertos;
        melhor = { id: aposta.id, nome: aposta.nome, concurso: concurso.numero };
      }
    }

    return { total, comAcertos, maiorAcerto, melhor };
  }
}

import { contarPremiosAposta, obterRegraJogo, type CodigoJogo, type RegraJogo } from '@mega/domain';
import type { ConcursoLeituraRepository } from '../data/repositories/concurso-leitura-repository.ts';
import type {
  AcertosAgrupados,
  LinhaDoTempoRepository,
  OrigemAcerto,
} from '../data/repositories/linha-do-tempo-repository.ts';

export interface DesempenhoConcurso {
  readonly itens: number;
  readonly melhorAcerto: number;
  readonly premio: number | null;
}

export interface PontoLinhaDoTempo {
  readonly numero: number;
  readonly data: string;
  readonly dezenas: number[];
  readonly apostas: DesempenhoConcurso | null;
  readonly favoritos: DesempenhoConcurso | null;
}

type ValoresPremiacao = ReadonlyMap<string, number>;

const chavePremio = (numero: number, faixa: number): string => `${String(numero)}:${String(faixa)}`;

const premioDoGrupo = (
  regra: RegraJogo,
  grupo: AcertosAgrupados,
  valores: ValoresPremiacao,
): number | null => {
  let total = 0;
  for (const premio of contarPremiosAposta(regra, grupo.quantidadeDezenas, grupo.acertos)) {
    const unitario = valores.get(chavePremio(grupo.numero, premio.faixa));
    if (unitario === undefined) return null;
    total += unitario * premio.quantidade * grupo.itens;
  }
  return total;
};

const resumirDesempenho = (
  regra: RegraJogo,
  grupos: readonly AcertosAgrupados[],
  valores: ValoresPremiacao,
): DesempenhoConcurso | null => {
  if (grupos.length === 0) return null;
  const premios = grupos.map((grupo) => premioDoGrupo(regra, grupo, valores));
  return {
    itens: grupos.reduce((soma, grupo) => soma + grupo.itens, 0),
    melhorAcerto: Math.max(...grupos.map((grupo) => grupo.acertos)),
    premio: premios.includes(null)
      ? null
      : Math.round(premios.reduce<number>((soma, premio) => soma + (premio ?? 0), 0) * 100) / 100,
  };
};

const filtrar = (
  grupos: readonly AcertosAgrupados[],
  numero: number,
  origem: OrigemAcerto,
): AcertosAgrupados[] =>
  grupos.filter((grupo) => grupo.numero === numero && grupo.origem === origem);

export class LinhaDoTempoService {
  readonly #repository: LinhaDoTempoRepository;
  readonly #concursos: ConcursoLeituraRepository;

  constructor(repository: LinhaDoTempoRepository, concursos: ConcursoLeituraRepository) {
    this.#repository = repository;
    this.#concursos = concursos;
  }

  async listar(usuarioId: number, jogo: CodigoJogo, ultimos: number): Promise<PontoLinhaDoTempo[]> {
    const sorteios = await this.#repository.listarSorteios(jogo, ultimos);
    const primeiro = sorteios.at(0);
    const ultimo = sorteios.at(-1);
    if (!primeiro || !ultimo) return [];

    const regra = obterRegraJogo(jogo);
    const grupos = await this.#repository.listarAcertos(usuarioId, jogo, {
      de: primeiro.numero,
      ate: ultimo.numero,
    });
    const valores = await this.#valoresPremiacao(jogo, regra, grupos);

    return sorteios.map((sorteio) => ({
      ...sorteio,
      apostas: resumirDesempenho(regra, filtrar(grupos, sorteio.numero, 'aposta'), valores),
      favoritos: resumirDesempenho(regra, filtrar(grupos, sorteio.numero, 'favorito'), valores),
    }));
  }

  async #valoresPremiacao(
    jogo: CodigoJogo,
    regra: RegraJogo,
    grupos: readonly AcertosAgrupados[],
  ): Promise<ValoresPremiacao> {
    const premiados = new Set(
      grupos
        .filter(
          (grupo) => contarPremiosAposta(regra, grupo.quantidadeDezenas, grupo.acertos).length > 0,
        )
        .map((grupo) => grupo.numero),
    );
    const premiacoes = await this.#concursos.listarPremiacoes(
      [...premiados].map((numero) => ({ jogo, numero })),
    );
    return new Map(
      premiacoes.map((linha) => [chavePremio(linha.numero, linha.faixa), linha.valorPremio]),
    );
  }
}

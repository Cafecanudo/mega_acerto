import { isCodigoJogo, menorFaixaPremiada, obterRegraJogo } from '@mega/domain';
import type {
  AcertosNoConcurso,
  AcertosPorFaixa,
  ConferenciaRepository,
  ItemConferivel,
} from '../data/repositories/conferencia-repository.ts';

export interface Conferencia {
  readonly concursoConferido: {
    readonly numero: number;
    readonly data: string;
    readonly acertos: number;
    readonly dezenasAcertadas: number[];
  } | null;
  readonly historico: {
    readonly acertos: number;
    readonly nome: string;
    readonly concursos: number;
  }[];
}

const CONFERENCIA_VAZIA: Conferencia = { concursoConferido: null, historico: [] };

const montar = (
  item: ItemConferivel,
  historico: readonly AcertosPorFaixa[],
  concurso: AcertosNoConcurso | undefined,
): Conferencia => {
  if (!isCodigoJogo(item.jogo)) return CONFERENCIA_VAZIA;
  const regra = obterRegraJogo(item.jogo);
  const porAcertos = new Map(
    historico
      .filter((linha) => linha.itemId === item.id)
      .map((linha) => [linha.acertos, linha.concursos]),
  );

  return {
    concursoConferido: concurso
      ? {
          numero: concurso.numero,
          data: concurso.data,
          acertos: concurso.dezenasAcertadas.length,
          dezenasAcertadas: concurso.dezenasAcertadas,
        }
      : null,
    historico: regra.faixasPremiadas.map((faixa) => ({
      acertos: faixa.acertos,
      nome: faixa.nome,
      concursos: porAcertos.get(faixa.acertos) ?? 0,
    })),
  };
};

export class ConferenciaService {
  readonly #repository: ConferenciaRepository;

  constructor(repository: ConferenciaRepository) {
    this.#repository = repository;
  }

  async conferir(itens: readonly ItemConferivel[]): Promise<Map<number, Conferencia>> {
    const disponiveis = itens.filter((item) => isCodigoJogo(item.jogo));
    const faixas = disponiveis.map((item) =>
      isCodigoJogo(item.jogo) ? menorFaixaPremiada(obterRegraJogo(item.jogo)) : 1,
    );
    const minimo = faixas.length > 0 ? Math.min(...faixas) : 1;

    const [historico, concursos] = await Promise.all([
      this.#repository.contarAcertosHistoricos(disponiveis, minimo),
      this.#repository.conferirConcurso(disponiveis),
    ]);
    const porItem = new Map(concursos.map((linha) => [linha.itemId, linha]));

    return new Map(itens.map((item) => [item.id, montar(item, historico, porItem.get(item.id))]));
  }
}

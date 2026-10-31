import type { RegraJogo } from '@mega/domain';
import type { PontoLinhaDoTempo, SerieLinhaDoTempo } from './types';

export interface Margens {
  readonly topo: number;
  readonly direita: number;
  readonly base: number;
  readonly esquerda: number;
}

export interface Escala {
  readonly largura: number;
  readonly altura: number;
  readonly margens: Margens;
  readonly passo: number;
  readonly x: (indice: number) => number;
  readonly y: (acertos: number) => number;
}

export const criarEscala = (
  largura: number,
  altura: number,
  margens: Margens,
  pontos: number,
  maximoAcertos: number,
): Escala => {
  const util = Math.max(largura - margens.esquerda - margens.direita, 1);
  const passo = util / Math.max(pontos, 1);
  const alturaUtil = altura - margens.topo - margens.base;
  return {
    largura,
    altura,
    margens,
    passo,
    x: (indice) => margens.esquerda + passo * (indice + 0.5),
    y: (acertos) => margens.topo + alturaUtil * (1 - acertos / maximoAcertos),
  };
};

export const trechosDaSerie = (
  pontos: readonly PontoLinhaDoTempo[],
  serie: SerieLinhaDoTempo,
  escala: Escala,
): string[] => {
  const trechos: string[] = [];
  let atual: string[] = [];
  pontos.forEach((ponto, indice) => {
    const desempenho = ponto[serie];
    if (!desempenho) {
      if (atual.length > 1) trechos.push(atual.join(' '));
      atual = [];
      return;
    }
    const comando = atual.length === 0 ? 'M' : 'L';
    atual.push(
      `${comando}${String(escala.x(indice))},${String(escala.y(desempenho.melhorAcerto))}`,
    );
  });
  if (atual.length > 1) trechos.push(atual.join(' '));
  return trechos;
};

export const isPontoIsolado = (
  pontos: readonly PontoLinhaDoTempo[],
  serie: SerieLinhaDoTempo,
  indice: number,
): boolean => !pontos[indice - 1]?.[serie] && !pontos[indice + 1]?.[serie];

export const acertosEsperadosAoAcaso = (regra: RegraJogo): number =>
  (regra.dezenasPorSorteio * regra.dezenasPorAposta.minimo) /
  (regra.universo.maximo - regra.universo.minimo + 1);

export const indicesDoEixoX = (total: number, maximoRotulos: number): number[] => {
  if (total === 0) return [];
  const intervalo = Math.max(1, Math.ceil(total / maximoRotulos));
  const indices: number[] = [];
  for (let indice = total - 1; indice >= 0; indice -= intervalo) indices.unshift(indice);
  return indices;
};

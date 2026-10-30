import type { RegraJogo } from '@mega/domain';

export const tamanhosPossiveis = (regra: RegraJogo, totalBase: number): number[] => {
  const { minimo, maximo } = regra.dezenasPorAposta;
  const limite = Math.min(maximo, totalBase);
  return limite < minimo
    ? []
    : Array.from({ length: limite - minimo + 1 }, (_, indice) => minimo + indice);
};

export const chaveJogo = (jogo: string, dezenas: readonly number[]): string =>
  `${jogo}:${dezenas.join(',')}`;

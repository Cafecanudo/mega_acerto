import type { RegraJogo } from '@mega/domain';
import type { AgregadoDezena } from '../../data/repositories/dataset-repository.ts';

export const tamanhoUniverso = (regra: RegraJogo): number =>
  regra.universo.maximo - regra.universo.minimo + 1;

export const posicaoNoRanking = (
  agregados: readonly AgregadoDezena[],
  frequencia: number,
): number => 1 + agregados.filter((agregado) => agregado.frequencia > frequencia).length;

import type { SerieLinhaDoTempo } from './types';

export const CLASSE_SERIE: Record<SerieLinhaDoTempo, string> = {
  apostas: 'stroke-emerald-600',
  favoritos: 'stroke-blue-600 dark:stroke-blue-500',
};

export const PREENCHIMENTO_SERIE: Record<SerieLinhaDoTempo, string> = {
  apostas: 'fill-emerald-600',
  favoritos: 'fill-blue-600 dark:fill-blue-500',
};

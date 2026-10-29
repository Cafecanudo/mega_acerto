import type { Aposta } from './types';

export interface ResumoDeFavoritas {
  readonly total: number;
  readonly comAcertos: number;
  readonly maiorAcerto: number;
  readonly melhor: Aposta | null;
}

const acertosNoUltimo = (aposta: Aposta): number => aposta.conferencia.ultimoConcurso?.acertos ?? 0;

export const resumirFavoritas = (apostas: readonly Aposta[]): ResumoDeFavoritas => {
  const melhor = apostas.reduce<Aposta | null>(
    (atual, aposta) =>
      atual === null || acertosNoUltimo(aposta) > acertosNoUltimo(atual) ? aposta : atual,
    null,
  );

  return {
    total: apostas.length,
    comAcertos: apostas.filter((aposta) => acertosNoUltimo(aposta) > 0).length,
    maiorAcerto: melhor ? acertosNoUltimo(melhor) : 0,
    melhor,
  };
};

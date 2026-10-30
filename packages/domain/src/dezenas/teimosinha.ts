export const TEIMOSINHA_MAXIMA = 12;

export const opcoesTeimosinha: readonly number[] = Array.from(
  { length: TEIMOSINHA_MAXIMA },
  (_, indice) => indice + 1,
);

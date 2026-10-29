import type { RegraJogo } from '../jogos/regra-jogo.ts';

export type ErroDezenas =
  | { readonly tipo: 'quantidade'; readonly esperado: number; readonly recebido: number }
  | { readonly tipo: 'fora-do-universo'; readonly dezenas: readonly number[] }
  | { readonly tipo: 'repetida'; readonly dezenas: readonly number[] }
  | { readonly tipo: 'nao-inteira'; readonly dezenas: readonly number[] };

const encontrarRepetidas = (dezenas: readonly number[]): number[] => {
  const vistas = new Set<number>();
  const repetidas = new Set<number>();
  for (const dezena of dezenas) {
    if (vistas.has(dezena)) repetidas.add(dezena);
    vistas.add(dezena);
  }
  return [...repetidas];
};

export const validarDezenas = (
  regra: RegraJogo,
  dezenas: readonly number[],
  quantidadeEsperada: number = regra.dezenasPorSorteio,
): readonly ErroDezenas[] => {
  const erros: ErroDezenas[] = [];

  if (dezenas.length !== quantidadeEsperada) {
    erros.push({ tipo: 'quantidade', esperado: quantidadeEsperada, recebido: dezenas.length });
  }

  const naoInteiras = dezenas.filter((dezena) => !Number.isInteger(dezena));
  if (naoInteiras.length > 0) erros.push({ tipo: 'nao-inteira', dezenas: naoInteiras });

  const foraDoUniverso = dezenas.filter(
    (dezena) => dezena < regra.universo.minimo || dezena > regra.universo.maximo,
  );
  if (foraDoUniverso.length > 0) erros.push({ tipo: 'fora-do-universo', dezenas: foraDoUniverso });

  const repetidas = encontrarRepetidas(dezenas);
  if (repetidas.length > 0) erros.push({ tipo: 'repetida', dezenas: repetidas });

  return erros;
};

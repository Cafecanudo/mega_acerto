import type { RegraJogo } from '../jogos/regra-jogo.ts';
import { validarDezenas, type ErroDezenas } from './validar-dezenas.ts';

export type ErroAposta =
  | ErroDezenas
  | { readonly tipo: 'tamanho-aposta'; readonly minimo: number; readonly maximo: number };

export const validarAposta = (
  regra: RegraJogo,
  dezenas: readonly number[],
): readonly ErroAposta[] => {
  const { minimo, maximo } = regra.dezenasPorAposta;
  const erros: ErroAposta[] = [...validarDezenas(regra, dezenas, dezenas.length)];

  if (dezenas.length < minimo || dezenas.length > maximo) {
    erros.unshift({ tipo: 'tamanho-aposta', minimo, maximo });
  }

  return erros;
};

export const menorFaixaPremiada = (regra: RegraJogo): number =>
  Math.min(...regra.faixasPremiadas.map((faixa) => faixa.acertos));

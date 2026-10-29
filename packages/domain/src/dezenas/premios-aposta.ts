import type { RegraJogo } from '../jogos/regra-jogo.ts';
import { combinacoes } from './custo-aposta.ts';

export interface PremioAposta {
  readonly faixa: number;
  readonly acertos: number;
  readonly nome: string;
  readonly quantidade: number;
}

export const contarPremiosAposta = (
  regra: RegraJogo,
  quantidadeDezenas: number,
  acertos: number,
): PremioAposta[] => {
  const tamanhoSimples = regra.dezenasPorAposta.minimo;
  const erros = quantidadeDezenas - acertos;

  return regra.faixasPremiadas.flatMap((faixa, indice) => {
    const quantidade =
      combinacoes(acertos, faixa.acertos) * combinacoes(erros, tamanhoSimples - faixa.acertos);
    return quantidade > 0
      ? [{ faixa: indice + 1, acertos: faixa.acertos, nome: faixa.nome, quantidade }]
      : [];
  });
};

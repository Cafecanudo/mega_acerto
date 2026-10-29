import type { RegraJogo } from '../jogos/regra-jogo.ts';

const combinacoes = (total: number, escolhidos: number): number => {
  if (escolhidos < 0 || escolhidos > total) return 0;
  let resultado = 1;
  for (let indice = 1; indice <= escolhidos; indice++) {
    resultado = (resultado * (total - escolhidos + indice)) / indice;
  }
  return Math.round(resultado);
};

export const contarApostasSimples = (regra: RegraJogo, quantidadeDezenas: number): number =>
  combinacoes(quantidadeDezenas, regra.dezenasPorAposta.minimo);

export const calcularValorAposta = (
  regra: RegraJogo,
  quantidadeDezenas: number,
  valorApostaSimples: number,
): number =>
  Math.round(contarApostasSimples(regra, quantidadeDezenas) * valorApostaSimples * 100) / 100;

import type { RegraJogo } from '../jogos/regra-jogo.ts';
import type { SortearInteiro } from './gerar-combinacoes.ts';

const sortearSemReposicao = (regra: RegraJogo, sortearInteiro: SortearInteiro): number[] => {
  const { minimo, maximo } = regra.universo;
  const globo = Array.from({ length: maximo - minimo + 1 }, (_, indice) => minimo + indice);
  for (let posicao = 0; posicao < regra.dezenasPorSorteio; posicao++) {
    const escolhida = posicao + sortearInteiro(globo.length - posicao);
    [globo[posicao], globo[escolhida]] = [globo[escolhida] ?? 0, globo[posicao] ?? 0];
  }
  return globo.slice(0, regra.dezenasPorSorteio);
};

export const sortearConcursoNaOrdem = (
  regra: RegraJogo,
  sortearInteiro: SortearInteiro,
): number[][] =>
  Array.from({ length: regra.sorteiosPorConcurso }, () =>
    sortearSemReposicao(regra, sortearInteiro),
  );

export const sortearConcurso = (regra: RegraJogo, sortearInteiro: SortearInteiro): number[][] =>
  sortearConcursoNaOrdem(regra, sortearInteiro).map((dezenas) => dezenas.sort((a, b) => a - b));

export const criarSorteioReutilizavel = (
  regra: RegraJogo,
  sortearInteiro: SortearInteiro,
): (() => Int32Array) => {
  const { minimo, maximo } = regra.universo;
  const globo = Int32Array.from({ length: maximo - minimo + 1 }, (_, indice) => minimo + indice);
  const tamanho = regra.dezenasPorSorteio;
  return () => {
    for (let posicao = 0; posicao < tamanho; posicao++) {
      const escolhida = posicao + sortearInteiro(globo.length - posicao);
      const temporaria = globo[posicao] ?? 0;
      globo[posicao] = globo[escolhida] ?? 0;
      globo[escolhida] = temporaria;
    }
    return globo.subarray(0, tamanho);
  };
};

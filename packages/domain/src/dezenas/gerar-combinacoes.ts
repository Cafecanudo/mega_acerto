import { combinacoes } from './custo-aposta.ts';

export type SortearInteiro = (limiteExclusivo: number) => number;

export const desranquearCombinacao = (
  dezenas: readonly number[],
  tamanho: number,
  posicao: number,
): number[] => {
  const combinacao: number[] = [];
  let restante = posicao;
  let indice = 0;
  while (combinacao.length < tamanho) {
    const faltam = tamanho - combinacao.length - 1;
    const comEsteInicio = combinacoes(dezenas.length - indice - 1, faltam);
    if (restante < comEsteInicio) {
      combinacao.push(dezenas[indice] ?? 0);
    } else {
      restante -= comEsteInicio;
    }
    indice++;
  }
  return combinacao;
};

export const listarCombinacoes = (
  dezenas: readonly number[],
  tamanho: number,
  limite: number,
): number[][] => {
  const ordenadas = [...dezenas].sort((a, b) => a - b);
  const quantidade = Math.min(combinacoes(ordenadas.length, tamanho), limite);
  return Array.from({ length: quantidade }, (_, posicao) =>
    desranquearCombinacao(ordenadas, tamanho, posicao),
  );
};

const sortearPosicoesDistintas = (
  total: number,
  quantidade: number,
  sortearInteiro: SortearInteiro,
): number[] => {
  const escolhidas = new Set<number>();
  for (let limite = total - quantidade; limite < total; limite++) {
    const sorteada = sortearInteiro(limite + 1);
    escolhidas.add(escolhidas.has(sorteada) ? limite : sorteada);
  }
  return [...escolhidas].sort((a, b) => a - b);
};

export const sortearCombinacoes = (
  dezenas: readonly number[],
  tamanho: number,
  quantidade: number,
  sortearInteiro: SortearInteiro,
): number[][] => {
  const ordenadas = [...dezenas].sort((a, b) => a - b);
  const total = combinacoes(ordenadas.length, tamanho);
  return sortearPosicoesDistintas(total, Math.min(quantidade, total), sortearInteiro).map(
    (posicao) => desranquearCombinacao(ordenadas, tamanho, posicao),
  );
};

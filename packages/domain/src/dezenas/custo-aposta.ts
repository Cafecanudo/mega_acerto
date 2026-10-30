import type { RegraJogo } from '../jogos/regra-jogo.ts';

export const combinacoes = (total: number, escolhidos: number): number => {
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

const SEMANAS_POR_MES = 52 / 12;

export interface CustoAposta {
  readonly regra: RegraJogo;
  readonly valor: number | null;
}

export interface CustoProjetado {
  readonly porConcurso: number | null;
  readonly porSemana: number | null;
  readonly porMes: number | null;
}

const arredondar = (valor: number): number => Math.round(valor * 100) / 100;

export const projetarCusto = (custos: readonly CustoAposta[]): CustoProjetado => {
  if (custos.some((custo) => custo.valor === null))
    return { porConcurso: null, porSemana: null, porMes: null };
  const somar = (fator: (regra: RegraJogo) => number) =>
    arredondar(custos.reduce((soma, custo) => soma + (custo.valor ?? 0) * fator(custo.regra), 0));
  return {
    porConcurso: somar(() => 1),
    porSemana: somar((regra) => regra.concursosPorSemana),
    porMes: somar((regra) => regra.concursosPorSemana * SEMANAS_POR_MES),
  };
};

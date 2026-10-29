import type { RegraJogo } from '@mega/domain';

export const MINIMO_ACERTOS_COMBINACOES = 3;

export interface ParametrosBusca {
  readonly dezenas: readonly number[];
  readonly incluirCombinacoes: boolean;
  readonly pagina: number;
}

export interface FaixaAcertos {
  readonly minimo: number;
  readonly maximo: number;
}

export const calcularFaixaAcertos = (regra: RegraJogo, busca: ParametrosBusca): FaixaAcertos => {
  const maximo = Math.min(busca.dezenas.length, regra.dezenasPorSorteio);
  const minimo = busca.incluirCombinacoes ? Math.min(MINIMO_ACERTOS_COMBINACOES, maximo) : maximo;
  return { minimo, maximo };
};

export const descreverFaixa = (regra: RegraJogo, busca: ParametrosBusca): string => {
  const { minimo, maximo } = calcularFaixaAcertos(regra, busca);
  const rotulo = maximo === 1 ? 'acerto' : 'acertos';
  return minimo === maximo ? `${maximo} ${rotulo}` : `${minimo} a ${maximo} ${rotulo}`;
};

export const lerBuscaDaUrl = (parametros: URLSearchParams): ParametrosBusca => {
  const dezenas = (parametros.get('dezenas') ?? '')
    .split(',')
    .map((dezena) => Number.parseInt(dezena, 10))
    .filter((dezena) => Number.isInteger(dezena));
  const pagina = Number.parseInt(parametros.get('pagina') ?? '', 10);

  return {
    dezenas,
    incluirCombinacoes: parametros.get('combinacoes') !== '0',
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
};

export const buscaParaUrl = (busca: ParametrosBusca): Record<string, string> => {
  const pagina = { pagina: String(busca.pagina) };
  if (busca.dezenas.length === 0) return pagina;
  return {
    ...pagina,
    dezenas: busca.dezenas.join(','),
    ...(busca.incluirCombinacoes ? {} : { combinacoes: '0' }),
  };
};

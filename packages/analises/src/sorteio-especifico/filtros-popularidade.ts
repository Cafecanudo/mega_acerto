export interface ContextoPopularidade {
  readonly ultimoSorteio: readonly number[];
  readonly combinacoesSorteadas: ReadonlySet<string>;
}

export interface FiltroPopularidade {
  readonly codigo: string;
  readonly descricao: string;
  readonly atende: (dezenas: readonly number[], contexto: ContextoPopularidade) => boolean;
}

const MAIOR_DIA_DO_MES = 31;
const MAXIMO_ATE_31 = 2;
const MAIOR_SEQUENCIA_PERMITIDA = 2;
const MAXIMO_POR_LINHA = 2;
const MAXIMO_POR_COLUNA = 2;
const MAXIMO_MULTIPLOS_DE_5 = 2;
const MAXIMO_DO_ULTIMO_SORTEIO = 1;
const DEZENAS_POR_LINHA = 10;

export const chaveCombinacao = (dezenas: readonly number[]): string =>
  [...dezenas].sort((a, b) => a - b).join('-');

const maiorSequencia = (dezenas: readonly number[]): number => {
  const ordenadas = [...dezenas].sort((a, b) => a - b);
  let maior = ordenadas.length > 0 ? 1 : 0;
  let atual = maior;
  for (let indice = 1; indice < ordenadas.length; indice++) {
    atual = ordenadas[indice] === (ordenadas[indice - 1] ?? 0) + 1 ? atual + 1 : 1;
    maior = Math.max(maior, atual);
  }
  return maior;
};

const maiorGrupo = (dezenas: readonly number[], agrupar: (dezena: number) => number): number => {
  const contagem = new Map<number, number>();
  for (const dezena of dezenas) {
    const grupo = agrupar(dezena);
    contagem.set(grupo, (contagem.get(grupo) ?? 0) + 1);
  }
  return Math.max(0, ...contagem.values());
};

export const filtrosPopularidade: readonly FiltroPopularidade[] = [
  {
    codigo: 'datas',
    descricao: `No máximo ${MAXIMO_ATE_31} dezenas até ${MAIOR_DIA_DO_MES}, para fugir de datas de aniversário`,
    atende: (dezenas) =>
      dezenas.filter((dezena) => dezena <= MAIOR_DIA_DO_MES).length <= MAXIMO_ATE_31,
  },
  {
    codigo: 'sequencias',
    descricao: `Sem ${MAIOR_SEQUENCIA_PERMITIDA + 1} ou mais dezenas consecutivas`,
    atende: (dezenas) => maiorSequencia(dezenas) <= MAIOR_SEQUENCIA_PERMITIDA,
  },
  {
    codigo: 'linhas',
    descricao: `No máximo ${MAXIMO_POR_LINHA} dezenas na mesma linha do volante (mesma dezena: 1–10, 11–20…)`,
    atende: (dezenas) =>
      maiorGrupo(dezenas, (dezena) => Math.ceil(dezena / DEZENAS_POR_LINHA)) <= MAXIMO_POR_LINHA,
  },
  {
    codigo: 'colunas',
    descricao: `No máximo ${MAXIMO_POR_COLUNA} dezenas na mesma coluna do volante (mesmo algarismo final)`,
    atende: (dezenas) =>
      maiorGrupo(dezenas, (dezena) => dezena % DEZENAS_POR_LINHA) <= MAXIMO_POR_COLUNA,
  },
  {
    codigo: 'multiplos-de-5',
    descricao: `No máximo ${MAXIMO_MULTIPLOS_DE_5} múltiplos de 5`,
    atende: (dezenas) =>
      dezenas.filter((dezena) => dezena % 5 === 0).length <= MAXIMO_MULTIPLOS_DE_5,
  },
  {
    codigo: 'ultimo-sorteio',
    descricao: `No máximo ${MAXIMO_DO_ULTIMO_SORTEIO} dezena do último sorteio`,
    atende: (dezenas, { ultimoSorteio }) =>
      dezenas.filter((dezena) => ultimoSorteio.includes(dezena)).length <= MAXIMO_DO_ULTIMO_SORTEIO,
  },
  {
    codigo: 'ja-sorteada',
    descricao: 'Combinação que nunca foi sorteada',
    atende: (dezenas, { combinacoesSorteadas }) =>
      !combinacoesSorteadas.has(chaveCombinacao(dezenas)),
  },
];

export const filtrosNaoAtendidos = (
  dezenas: readonly number[],
  contexto: ContextoPopularidade,
): FiltroPopularidade[] =>
  filtrosPopularidade.filter((filtro) => !filtro.atende(dezenas, contexto));

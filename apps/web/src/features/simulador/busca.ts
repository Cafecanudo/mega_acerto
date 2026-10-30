import { calcularValorAposta, contarPremiosAposta, type RegraJogo } from '@mega/domain';
import { formatarDecimal, formatarDuracao, formatarInteiro } from '@/lib/formatadores';
import type { JogoReferencia, ReferenciasSimulacao } from './types';

export interface ReferenciaCompilada {
  readonly pertence: Uint8Array;
  readonly ganha: readonly boolean[];
}

export interface OpcaoFaixa {
  readonly faixa: number;
  readonly rotulo: string;
}

export const opcoesFaixa = (regra: RegraJogo): OpcaoFaixa[] =>
  regra.faixasPremiadas.map((faixa, indice) => ({
    faixa: indice + 1,
    rotulo: indice === 0 ? faixa.nome : `${faixa.nome} ou melhor`,
  }));

export const todasReferencias = (referencias: ReferenciasSimulacao): JogoReferencia[] => [
  ...referencias.apostas,
  ...referencias.favoritos,
];

export const compilarReferencias = (
  regra: RegraJogo,
  referencias: readonly (readonly number[])[],
  faixaAlvo: number,
): ReferenciaCompilada[] =>
  referencias.map((dezenas) => {
    const pertence = new Uint8Array(regra.universo.maximo + 1);
    for (const dezena of dezenas) pertence[dezena] = 1;
    const ganha = Array.from({ length: dezenas.length + 1 }, (_, acertos) => {
      const [melhor] = contarPremiosAposta(regra, dezenas.length, acertos);
      return melhor !== undefined && melhor.faixa <= faixaAlvo;
    });
    return { pertence, ganha };
  });

export const linhaGanhou = (
  compiladas: readonly ReferenciaCompilada[],
  dezenas: Iterable<number>,
): boolean => {
  for (const referencia of compiladas) {
    let acertos = 0;
    for (const dezena of dezenas) acertos += referencia.pertence[dezena] ?? 0;
    if (referencia.ganha[acertos]) return true;
  }
  return false;
};

export const sorteioGanhou = (
  compiladas: readonly ReferenciaCompilada[],
  sorteio: readonly (readonly number[])[],
): boolean => sorteio.some((dezenas) => linhaGanhou(compiladas, dezenas));

export const custoPorTentativa = (
  regra: RegraJogo,
  referencias: readonly JogoReferencia[],
  valorApostaSimples: number | null,
): number | null =>
  valorApostaSimples === null
    ? null
    : referencias.reduce(
        (soma, referencia) =>
          soma + calcularValorAposta(regra, referencia.dezenas.length, valorApostaSimples),
        0,
      );

const LIMITE_TEMPO_COM_DECIMAL_MS = 10_000;

export const formatarTempoBusca = (milissegundos: number): string => {
  if (milissegundos < 1000) return `${formatarInteiro(Math.round(milissegundos))} ms`;
  if (milissegundos < LIMITE_TEMPO_COM_DECIMAL_MS) {
    return `${formatarDecimal(milissegundos / 1000, 1)} s`;
  }
  return formatarDuracao(milissegundos);
};

import {
  ParametrosEstrategiaSchema,
  ResultadoEstrategiaSchema,
  type ParametrosEstrategia,
  type ResultadoEstrategia,
} from '@mega/analises';
import type { RegraJogo } from '@mega/domain';
import type { ConferenciaSistema } from '../../data/repositories/analise-repository.ts';
import type { AgregadoDezena } from '../../data/repositories/dataset-repository.ts';
import type { DatasetExportado } from './exportador-dataset.ts';
import { ErroValidacaoResultado, validarContraSchema } from './validacao-schema.ts';

const TOLERANCIA_MEDIA_TEORICA = 0.01;

type Criterio = (agregado: AgregadoDezena) => number;

const criteriosOrdenacao: Partial<Record<ParametrosEstrategia['estrategia'], Criterio>> = {
  'mais-sorteadas': (agregado) => agregado.frequencia,
  'menos-sorteadas': (agregado) => -agregado.frequencia,
  'mais-atrasadas': (agregado) => agregado.atrasoAtual,
};

export const lerParametrosEstrategia = (parametros: unknown): ParametrosEstrategia =>
  validarContraSchema(ParametrosEstrategiaSchema, parametros, 'Parâmetros da estratégia');

const validarPalpite = (
  regra: RegraJogo,
  parametros: ParametrosEstrategia,
  dezenas: readonly number[],
): void => {
  const problemas: string[] = [];
  if (dezenas.length !== parametros.quantidadeDezenas) {
    problemas.push(
      `Palpite com ${dezenas.length} dezenas; esperado ${parametros.quantidadeDezenas}`,
    );
  }
  if (new Set(dezenas).size !== dezenas.length) problemas.push('Palpite com dezenas repetidas');
  const fora = dezenas.filter(
    (dezena) => dezena < regra.universo.minimo || dezena > regra.universo.maximo,
  );
  if (fora.length > 0) problemas.push(`Dezenas fora do universo: ${fora.join(', ')}`);
  if (problemas.length > 0) throw new ErroValidacaoResultado(problemas.join('; '));
};

const compararFrequencias = (
  dataset: DatasetExportado,
  resultado: ResultadoEstrategia,
): string[] => {
  const informadas = new Map(
    resultado.conferencia.frequencias.map((item) => [item.dezena, item.frequencia]),
  );
  return dataset.agregados.flatMap((agregado) => {
    const informada = informadas.get(agregado.dezena);
    if (informada === undefined) return [`Dezena ${agregado.dezena}: frequência não informada`];
    return informada === agregado.frequencia
      ? []
      : [`Dezena ${agregado.dezena}: frequência ${informada}, SQL ${agregado.frequencia}`];
  });
};

const conferirPalpiteDeterministico = (
  parametros: ParametrosEstrategia,
  dataset: DatasetExportado,
  dezenas: readonly number[],
): string[] => {
  const criterio = criteriosOrdenacao[parametros.estrategia];
  if (!criterio || parametros.janela !== null) return [];

  const ordenados = [...dataset.agregados].sort((a, b) => criterio(b) - criterio(a));
  const corte = ordenados[parametros.quantidadeDezenas - 1];
  if (!corte) return [];
  const limite = criterio(corte);
  const porDezena = new Map(dataset.agregados.map((agregado) => [agregado.dezena, agregado]));

  const obrigatorias = ordenados.filter((agregado) => criterio(agregado) > limite);
  const faltando = obrigatorias.filter((agregado) => !dezenas.includes(agregado.dezena));
  const indevidas = dezenas.filter((dezena) => {
    const agregado = porDezena.get(dezena);
    return !agregado || criterio(agregado) < limite;
  });

  return [
    ...faltando.map((agregado) => `Palpite deveria incluir a dezena ${agregado.dezena}`),
    ...indevidas.map((dezena) => `Palpite não deveria incluir a dezena ${dezena}`),
  ];
};

const conferirBacktest = (
  regra: RegraJogo,
  parametros: ParametrosEstrategia,
  resultado: ResultadoEstrategia,
): string[] => {
  const universo = regra.universo.maximo - regra.universo.minimo + 1;
  const teorica = (parametros.quantidadeDezenas * regra.dezenasPorSorteio) / universo;
  const divergencias: string[] = [];
  if (resultado.backtest.concursosTestados === 0) divergencias.push('Backtest sem concursos');
  if (Math.abs(resultado.backtest.mediaAcertosTeorica - teorica) > TOLERANCIA_MEDIA_TEORICA) {
    divergencias.push(
      `Média teórica informada ${resultado.backtest.mediaAcertosTeorica}; esperada ${teorica.toFixed(4)}`,
    );
  }
  return divergencias;
};

export const validarEstrategia = (
  regra: RegraJogo,
  dataset: DatasetExportado,
  ultimoConcurso: number,
  parametrosBrutos: unknown,
  saida: unknown,
): { readonly resultado: ResultadoEstrategia; readonly conferencia: ConferenciaSistema } => {
  const parametros = lerParametrosEstrategia(parametrosBrutos);
  const resultado = validarContraSchema(ResultadoEstrategiaSchema, saida, 'Resultado');
  validarPalpite(regra, parametros, resultado.palpite.dezenas);

  const divergencias = [
    ...compararFrequencias(dataset, resultado),
    ...(resultado.palpite.concursoAlvo === ultimoConcurso + 1
      ? []
      : [`Concurso-alvo ${resultado.palpite.concursoAlvo}; esperado ${ultimoConcurso + 1}`]),
    ...conferirPalpiteDeterministico(parametros, dataset, resultado.palpite.dezenas),
    ...conferirBacktest(regra, parametros, resultado),
  ];

  return {
    resultado: {
      ...resultado,
      palpite: {
        ...resultado.palpite,
        dezenas: [...resultado.palpite.dezenas].sort((a, b) => a - b),
      },
    },
    conferencia: { ok: divergencias.length === 0, divergencias },
  };
};

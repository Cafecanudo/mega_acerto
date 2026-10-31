import {
  ParametrosFrequenciaRecenteSchema,
  ResultadoFrequenciaRecenteSchema,
  type ParametrosFrequenciaRecente,
  type ResultadoFrequenciaRecente,
} from '@mega/analises';
import type { RegraJogo } from '@mega/domain';
import type { ConferenciaSistema } from '../../data/repositories/analise-repository.ts';
import type { AgregadoDezena } from '../../data/repositories/dataset-repository.ts';
import type { DatasetExportado } from './exportador-dataset.ts';
import { ErroValidacaoResultado, validarContraSchema } from './validacao-schema.ts';

const TOLERANCIA_ESPERADO = 0.01;

export const lerParametrosFrequenciaRecente = (parametros: unknown): ParametrosFrequenciaRecente =>
  validarContraSchema(ParametrosFrequenciaRecenteSchema, parametros, 'Parâmetros da análise');

const tamanhoUniverso = (regra: RegraJogo): number =>
  regra.universo.maximo - regra.universo.minimo + 1;

const posicao = (agregados: readonly AgregadoDezena[], frequencia: number): number =>
  1 + agregados.filter((agregado) => agregado.frequencia > frequencia).length;

const validarTop = (
  regra: RegraJogo,
  parametros: ParametrosFrequenciaRecente,
  resultado: ResultadoFrequenciaRecente,
): void => {
  const dezenas = resultado.top.map((item) => item.dezena);
  const problemas: string[] = [];
  if (dezenas.length !== parametros.tamanhoTop) {
    problemas.push(`Top com ${dezenas.length} dezenas; esperado ${parametros.tamanhoTop}`);
  }
  if (new Set(dezenas).size !== dezenas.length) problemas.push('Top com dezenas repetidas');
  const fora = dezenas.filter(
    (dezena) => dezena < regra.universo.minimo || dezena > regra.universo.maximo,
  );
  if (fora.length > 0) problemas.push(`Dezenas fora do universo: ${fora.join(', ')}`);
  if (problemas.length > 0) throw new ErroValidacaoResultado(problemas.join('; '));
};

const compararFrequenciasJanela = (
  janela: readonly AgregadoDezena[],
  resultado: ResultadoFrequenciaRecente,
): string[] => {
  const informadas = new Map(
    resultado.conferencia.frequenciasJanela.map((item) => [item.dezena, item.frequencia]),
  );
  return janela.flatMap((agregado) => {
    const informada = informadas.get(agregado.dezena);
    if (informada === undefined) return [`Dezena ${agregado.dezena}: frequência na janela ausente`];
    return informada === agregado.frequencia
      ? []
      : [`Dezena ${agregado.dezena}: ${informada} na janela, SQL ${agregado.frequencia}`];
  });
};

const conferirJanela = (
  regra: RegraJogo,
  parametros: ParametrosFrequenciaRecente,
  ultimoConcurso: number,
  resultado: ResultadoFrequenciaRecente,
): string[] => {
  const { janela } = resultado;
  const esperado = (parametros.janela * regra.dezenasPorSorteio) / tamanhoUniverso(regra);
  const primeiro = ultimoConcurso - parametros.janela + 1;
  return [
    ...(janela.concursos === parametros.janela
      ? []
      : [`Janela com ${janela.concursos} concursos; esperado ${parametros.janela}`]),
    ...(janela.primeiroConcurso === primeiro && janela.ultimoConcurso === ultimoConcurso
      ? []
      : [
          `Janela ${janela.primeiroConcurso}–${janela.ultimoConcurso}; esperada ${primeiro}–${ultimoConcurso}`,
        ]),
    ...(Math.abs(janela.frequenciaEsperada - esperado) <= TOLERANCIA_ESPERADO
      ? []
      : [`Frequência esperada ${janela.frequenciaEsperada}; esperada ${esperado.toFixed(4)}`]),
  ];
};

const ordenarTop = (janela: readonly AgregadoDezena[], tamanho: number): number[] =>
  [...janela]
    .sort((a, b) => b.frequencia - a.frequencia || a.dezena - b.dezena)
    .slice(0, tamanho)
    .map((agregado) => agregado.dezena);

const conferirItensTop = (
  dataset: DatasetExportado,
  janela: readonly AgregadoDezena[],
  resultado: ResultadoFrequenciaRecente,
): string[] => {
  const naJanela = new Map(janela.map((agregado) => [agregado.dezena, agregado.frequencia]));
  const noHistorico = new Map(
    dataset.agregados.map((agregado) => [agregado.dezena, agregado.frequencia]),
  );
  return resultado.top.flatMap((item) => {
    const frequenciaJanela = naJanela.get(item.dezena) ?? 0;
    const frequenciaHistorica = noHistorico.get(item.dezena) ?? 0;
    const divergencias: string[] = [];
    if (item.frequenciaJanela !== frequenciaJanela) {
      divergencias.push(
        `Top ${item.dezena}: ${item.frequenciaJanela} na janela, SQL ${frequenciaJanela}`,
      );
    }
    if (item.frequenciaHistorica !== frequenciaHistorica) {
      divergencias.push(
        `Top ${item.dezena}: ${item.frequenciaHistorica} no histórico, SQL ${frequenciaHistorica}`,
      );
    }
    if (item.posicaoJanela !== posicao(janela, frequenciaJanela)) {
      divergencias.push(`Top ${item.dezena}: posição na janela ${item.posicaoJanela} incorreta`);
    }
    if (item.posicaoHistorica !== posicao(dataset.agregados, frequenciaHistorica)) {
      divergencias.push(`Top ${item.dezena}: posição histórica ${item.posicaoHistorica} incorreta`);
    }
    return divergencias;
  });
};

const conferirOrdemTop = (
  janela: readonly AgregadoDezena[],
  parametros: ParametrosFrequenciaRecente,
  resultado: ResultadoFrequenciaRecente,
): string[] => {
  const esperado = ordenarTop(janela, parametros.tamanhoTop).join(', ');
  const informado = resultado.top.map((item) => item.dezena).join(', ');
  return esperado === informado ? [] : [`Top informado ${informado}; esperado ${esperado}`];
};

const conferirBacktest = (
  regra: RegraJogo,
  parametros: ParametrosFrequenciaRecente,
  resultado: ResultadoFrequenciaRecente,
): string[] => {
  const esperada = (parametros.tamanhoTop * regra.dezenasPorSorteio) / tamanhoUniverso(regra);
  return [
    ...(resultado.backtest.concursosTestados > 0 ? [] : ['Backtest sem concursos']),
    ...(Math.abs(resultado.backtest.mediaAcertosEsperada - esperada) <= TOLERANCIA_ESPERADO
      ? []
      : [
          `Média esperada informada ${resultado.backtest.mediaAcertosEsperada}; esperada ${esperada.toFixed(4)}`,
        ]),
  ];
};

export const validarFrequenciaRecente = (
  regra: RegraJogo,
  dataset: DatasetExportado,
  ultimoConcurso: number,
  parametrosBrutos: unknown,
  saida: unknown,
): { readonly resultado: ResultadoFrequenciaRecente; readonly conferencia: ConferenciaSistema } => {
  const parametros = lerParametrosFrequenciaRecente(parametrosBrutos);
  const resultado = validarContraSchema(ResultadoFrequenciaRecenteSchema, saida, 'Resultado');
  validarTop(regra, parametros, resultado);
  const janela = dataset.agregadosJanela;
  if (!janela) throw new Error('Dataset exportado sem agregados da janela');

  const divergencias = [
    ...compararFrequenciasJanela(janela, resultado),
    ...conferirJanela(regra, parametros, ultimoConcurso, resultado),
    ...conferirOrdemTop(janela, parametros, resultado),
    ...conferirItensTop(dataset, janela, resultado),
    ...conferirBacktest(regra, parametros, resultado),
  ];
  return { resultado, conferencia: { ok: divergencias.length === 0, divergencias } };
};

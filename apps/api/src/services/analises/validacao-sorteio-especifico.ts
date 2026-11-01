import {
  chaveCombinacao,
  filtrosNaoAtendidos,
  filtrosPopularidade,
  ParametrosSorteioEspecificoSchema,
  ResultadoSorteioEspecificoSchema,
  type ParametrosSorteioEspecifico,
  type ResultadoSorteioEspecifico,
} from '@mega/analises';
import type { RegraJogo } from '@mega/domain';
import type { ConferenciaSistema } from '../../data/repositories/analise-repository.ts';
import type {
  AgregadoDezena,
  ConcursoDataset,
} from '../../data/repositories/dataset-repository.ts';
import type { DatasetExportado } from './exportador-dataset.ts';
import { posicaoNoRanking, tamanhoUniverso } from './ranking.ts';
import { ErroValidacaoResultado, validarContraSchema } from './validacao-schema.ts';

const TOLERANCIA_PROBABILIDADE = 0.001;

type DezenaAnalisada = ResultadoSorteioEspecifico['dezenas'][number];

interface Referencias {
  readonly regra: RegraJogo;
  readonly antes: readonly AgregadoDezena[];
  readonly janela: readonly AgregadoDezena[];
}

export const lerParametrosSorteioEspecifico = (parametros: unknown): ParametrosSorteioEspecifico =>
  validarContraSchema(ParametrosSorteioEspecificoSchema, parametros, 'Parâmetros da análise');

const validarPalpite = (regra: RegraJogo, dezenas: readonly number[]): void => {
  const problemas: string[] = [];
  const esperado = regra.dezenasPorAposta.minimo;
  if (dezenas.length !== esperado) {
    problemas.push(`Palpite com ${dezenas.length} dezenas; esperado ${esperado}`);
  }
  if (new Set(dezenas).size !== dezenas.length) problemas.push('Palpite com dezenas repetidas');
  const fora = dezenas.filter(
    (dezena) => dezena < regra.universo.minimo || dezena > regra.universo.maximo,
  );
  if (fora.length > 0) problemas.push(`Dezenas fora do universo: ${fora.join(', ')}`);
  if (problemas.length > 0) throw new ErroValidacaoResultado(problemas.join('; '));
};

const conferirConcurso = (
  alvo: ConcursoDataset,
  resultado: ResultadoSorteioEspecifico,
): string[] => {
  const divergencias: string[] = [];
  if (resultado.concurso.numero !== alvo.numero) {
    divergencias.push(`Concurso ${resultado.concurso.numero}; esperado ${alvo.numero}`);
  }
  if (chaveCombinacao(resultado.concurso.dezenas) !== chaveCombinacao(alvo.dezenas)) {
    divergencias.push(
      `Dezenas do concurso ${resultado.concurso.dezenas.join(', ')}; SQL ${alvo.dezenas.join(', ')}`,
    );
  }
  const analisadas = resultado.dezenas.map((item) => item.dezena);
  if (chaveCombinacao(analisadas) !== chaveCombinacao(alvo.dezenas)) {
    divergencias.push(`Dezenas analisadas ${analisadas.join(', ')} não são as do concurso`);
  }
  return divergencias;
};

const conferirJanela = (
  parametros: ParametrosSorteioEspecifico,
  resultado: ResultadoSorteioEspecifico,
): string[] => {
  const { janela } = resultado;
  const primeiro = parametros.concurso - parametros.janela;
  const ultimo = parametros.concurso - 1;
  return [
    ...(janela.concursos === parametros.janela
      ? []
      : [`Janela com ${janela.concursos} concursos; esperado ${parametros.janela}`]),
    ...(janela.primeiroConcurso === primeiro && janela.ultimoConcurso === ultimo
      ? []
      : [
          `Janela ${janela.primeiroConcurso}–${janela.ultimoConcurso}; esperada ${primeiro}–${ultimo}`,
        ]),
  ];
};

const conferirDezena = (referencias: Referencias, item: DezenaAnalisada): string[] => {
  const antes = referencias.antes.find((agregado) => agregado.dezena === item.dezena);
  const naJanela = referencias.janela.find((agregado) => agregado.dezena === item.dezena);
  if (!antes || !naJanela) return [`Dezena ${item.dezena}: sem agregados no sistema`];

  const probabilidade =
    (1 - referencias.regra.dezenasPorSorteio / tamanhoUniverso(referencias.regra)) **
    antes.atrasoAtual;
  const verificacoes: [boolean, string][] = [
    [
      item.frequenciaAntes === antes.frequencia,
      `frequência anterior ${item.frequenciaAntes}, SQL ${antes.frequencia}`,
    ],
    [
      item.atrasoAntes === antes.atrasoAtual,
      `atraso ${item.atrasoAntes}, SQL ${antes.atrasoAtual}`,
    ],
    [
      item.frequenciaJanela === naJanela.frequencia,
      `${item.frequenciaJanela} na janela, SQL ${naJanela.frequencia}`,
    ],
    [
      item.posicaoHistorica === posicaoNoRanking(referencias.antes, antes.frequencia),
      `posição histórica ${item.posicaoHistorica} incorreta`,
    ],
    [
      item.posicaoJanela === posicaoNoRanking(referencias.janela, naJanela.frequencia),
      `posição na janela ${item.posicaoJanela} incorreta`,
    ],
    [
      Math.abs(item.probabilidadeAtraso - probabilidade) <= TOLERANCIA_PROBABILIDADE,
      `probabilidade do atraso ${item.probabilidadeAtraso}; esperada ${probabilidade.toFixed(4)}`,
    ],
  ];
  return verificacoes.flatMap(([ok, mensagem]) =>
    ok ? [] : [`Dezena ${item.dezena}: ${mensagem}`],
  );
};

const conferirPalpite = (
  dataset: DatasetExportado,
  ultimoConcurso: number,
  resultado: ResultadoSorteioEspecifico,
): string[] => {
  const { palpite } = resultado;
  const ultimo = dataset.concursos.at(-1);
  const contexto = {
    ultimoSorteio: ultimo?.dezenas ?? [],
    combinacoesSorteadas: new Set(
      dataset.concursos.map((concurso) => chaveCombinacao(concurso.dezenas)),
    ),
  };
  const informados = new Set(palpite.filtros.map((filtro) => filtro.codigo));
  return [
    ...(palpite.concursoAlvo === ultimoConcurso + 1
      ? []
      : [`Concurso-alvo ${palpite.concursoAlvo}; esperado ${ultimoConcurso + 1}`]),
    ...filtrosNaoAtendidos(palpite.dezenas, contexto).map(
      (filtro) => `Palpite não atende ao filtro: ${filtro.descricao}`,
    ),
    ...filtrosPopularidade
      .filter((filtro) => !informados.has(filtro.codigo))
      .map((filtro) => `Filtro ${filtro.codigo} não informado no palpite`),
  ];
};

export const validarSorteioEspecifico = (
  regra: RegraJogo,
  dataset: DatasetExportado,
  ultimoConcurso: number,
  parametrosBrutos: unknown,
  saida: unknown,
): { readonly resultado: ResultadoSorteioEspecifico; readonly conferencia: ConferenciaSistema } => {
  const parametros = lerParametrosSorteioEspecifico(parametrosBrutos);
  const resultado = validarContraSchema(ResultadoSorteioEspecificoSchema, saida, 'Resultado');
  validarPalpite(regra, resultado.palpite.dezenas);

  const alvo = dataset.concursos.find((concurso) => concurso.numero === parametros.concurso);
  const { agregadosAntes, agregadosJanela } = dataset;
  if (!alvo || !agregadosAntes || !agregadosJanela) {
    throw new Error('Dataset exportado sem o concurso analisado ou sem agregados anteriores');
  }
  const referencias: Referencias = { regra, antes: agregadosAntes, janela: agregadosJanela };

  const divergencias = [
    ...conferirConcurso(alvo, resultado),
    ...conferirJanela(parametros, resultado),
    ...resultado.dezenas.flatMap((item) => conferirDezena(referencias, item)),
    ...conferirPalpite(dataset, ultimoConcurso, resultado),
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

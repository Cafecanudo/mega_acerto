export const tiposAnalise = [
  {
    codigo: 'aleatoriedade',
    nome: 'Aleatoriedade e frequência',
    descricao:
      'Testa se o histórico é compatível com sorteios uniformes e independentes e estima a probabilidade de cada dezena.',
    versaoPrompt: 1,
  },
  {
    codigo: 'estrategia',
    nome: 'Estratégia de palpite',
    descricao:
      'Gera o palpite de uma estratégia para o próximo concurso e testa a estratégia no histórico, comparando com apostas aleatórias.',
    versaoPrompt: 1,
  },
  {
    codigo: 'frequencia-recente',
    nome: 'Frequência recente',
    descricao:
      'Mostra as dezenas mais sorteadas nos últimos concursos, onde elas ficam na frequência histórica e quanto desse destaque o acaso explica.',
    versaoPrompt: 1,
  },
] as const;

export type TipoAnalise = (typeof tiposAnalise)[number]['codigo'];

export const modelosAnalise = [
  { codigo: 'opus', nome: 'Claude Opus 5.5' },
  { codigo: 'sonnet', nome: 'Claude Sonnet 5.5' },
  { codigo: 'haiku', nome: 'Claude Haiku 5.5' },
] as const;

export type ModeloAnalise = (typeof modelosAnalise)[number]['codigo'];

export const esforcosAnalise = [
  { codigo: 'low', nome: 'Baixo' },
  { codigo: 'medium', nome: 'Médio' },
  { codigo: 'high', nome: 'Alto' },
  { codigo: 'xhigh', nome: 'Muito alto' },
  { codigo: 'max', nome: 'Máximo' },
] as const;

export type EsforcoAnalise = (typeof esforcosAnalise)[number]['codigo'];

export type StatusAnalise = 'pendente' | 'executando' | 'concluida' | 'falhou';

export const MODELO_PADRAO: ModeloAnalise = 'opus';
export const ESFORCO_PADRAO: EsforcoAnalise = 'high';

export const isTipoAnalise = (valor: string): valor is TipoAnalise =>
  tiposAnalise.some((tipo) => tipo.codigo === valor);

type DefinicaoTipoAnalise = (typeof tiposAnalise)[number];

const tiposPorCodigo = Object.fromEntries(
  tiposAnalise.map((tipo) => [tipo.codigo, tipo]),
) as Record<TipoAnalise, DefinicaoTipoAnalise>;

export const obterTipoAnalise = (codigo: TipoAnalise): DefinicaoTipoAnalise =>
  tiposPorCodigo[codigo];

export const nomeModelo = (codigo: string): string =>
  modelosAnalise.find((modelo) => modelo.codigo === codigo)?.nome ?? codigo;

export const nomeEsforco = (codigo: string): string =>
  esforcosAnalise.find((esforco) => esforco.codigo === codigo)?.nome ?? codigo;

export * from './estrategia/catalogo.ts';
export * from './frequencia-recente/catalogo.ts';

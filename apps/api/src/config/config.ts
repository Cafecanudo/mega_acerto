import { Type, type Static } from 'typebox';
import { Value } from 'typebox/value';

const EsquemaConfig = Type.Object({
  HOST: Type.String({ default: '0.0.0.0' }),
  PORT: Type.Integer({ default: 3000 }),
  LOG_LEVEL: Type.Union(
    [
      Type.Literal('fatal'),
      Type.Literal('error'),
      Type.Literal('warn'),
      Type.Literal('info'),
      Type.Literal('debug'),
      Type.Literal('trace'),
    ],
    { default: 'info' },
  ),
  DATABASE_URL: Type.String({ minLength: 1 }),
  WEB_DIST_DIR: Type.Optional(Type.String()),
  CAIXA_BASE_URL: Type.String({
    default: 'https://servicebus2.caixa.gov.br/portaldeloterias/api',
  }),
  CAIXA_INTERVALO_MS: Type.Integer({ default: 500, minimum: 0 }),
  CAIXA_TIMEOUT_MS: Type.Integer({ default: 15000, minimum: 1000 }),
  CAIXA_TENTATIVAS: Type.Integer({ default: 4, minimum: 1 }),
  SINCRONIZACAO_INTERVALO_MIN: Type.Integer({ default: 30, minimum: 1 }),
  SINCRONIZACAO_AO_INICIAR: Type.Boolean({ default: true }),
  CLAUDE_EXECUTAVEL: Type.String({ default: 'claude' }),
  CLAUDE_CODE_OAUTH_TOKEN: Type.Optional(Type.String({ minLength: 1 })),
  ANALISE_DIRETORIO_TRABALHO: Type.Optional(Type.String()),
  ANALISE_TIMEOUT_MIN: Type.Integer({ default: 30, minimum: 1 }),
  ANALISE_INTERVALO_FILA_MS: Type.Integer({ default: 3000, minimum: 500 }),
});

export type Config = Static<typeof EsquemaConfig>;

const removerVazios = (ambiente: NodeJS.ProcessEnv): Record<string, string> =>
  Object.fromEntries(
    Object.entries(ambiente).filter(
      (entrada): entrada is [string, string] => entrada[1] !== undefined && entrada[1] !== '',
    ),
  );

export const carregarConfig = (ambiente: NodeJS.ProcessEnv = process.env): Config => {
  const valor = Value.Clean(
    EsquemaConfig,
    Value.Convert(EsquemaConfig, Value.Default(EsquemaConfig, removerVazios(ambiente))),
  );

  if (!Value.Check(EsquemaConfig, valor)) {
    const detalhes = [...Value.Errors(EsquemaConfig, valor)]
      .map((erro) => `${erro.instancePath || '/'} ${erro.message}`)
      .join('; ');
    throw new Error(`Configuração inválida: ${detalhes}`);
  }

  return valor;
};

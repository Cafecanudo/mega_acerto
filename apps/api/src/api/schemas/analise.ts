import { Type, type TSchema } from '@fastify/type-provider-typebox';
import { ParametrosEstrategiaSchema } from '@mega/analises';
import { esforcosAnalise, modelosAnalise, tiposAnalise } from '@mega/analises/catalogo';

const Nulavel = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

const literais = <T extends string>(valores: readonly { readonly codigo: T }[]) =>
  Type.Unsafe<T>(Type.Union(valores.map((valor) => Type.Literal(valor.codigo))));

const TipoSchema = literais(tiposAnalise);
const ModeloSchema = literais(modelosAnalise);
const EsforcoSchema = literais(esforcosAnalise);
const StatusSchema = Type.Union([
  Type.Literal('pendente'),
  Type.Literal('executando'),
  Type.Literal('concluida'),
  Type.Literal('falhou'),
]);

export const ParametrosAnaliseSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export const SolicitacaoAnaliseSchema = Type.Object(
  {
    tipo: TipoSchema,
    modelo: ModeloSchema,
    esforco: EsforcoSchema,
    forcar: Type.Boolean({ default: false }),
    parametros: Type.Optional(Nulavel(ParametrosEstrategiaSchema)),
  },
  { additionalProperties: false },
);

export const AnaliseSolicitadaSchema = Type.Object({
  id: Type.Integer(),
  reaproveitada: Type.Boolean(),
});

const ConferenciaSchema = Type.Object({
  ok: Type.Boolean(),
  divergencias: Type.Array(Type.String()),
});

const camposBase = {
  id: Type.Integer(),
  jogo: Type.String(),
  tipo: TipoSchema,
  versaoPrompt: Type.Integer(),
  modelo: ModeloSchema,
  esforco: EsforcoSchema,
  status: StatusSchema,
  ultimoConcurso: Type.Integer(),
  parametros: Type.Unknown(),
  hashDataset: Nulavel(Type.String()),
  conferenciaSistema: Nulavel(ConferenciaSchema),
  custoUsd: Nulavel(Type.Number()),
  duracaoMs: Nulavel(Type.Integer()),
  erro: Nulavel(Type.String()),
  criadoEm: Type.String({ format: 'date-time' }),
  iniciadoEm: Nulavel(Type.String({ format: 'date-time' })),
  finalizadoEm: Nulavel(Type.String({ format: 'date-time' })),
};

export const ResumoAnaliseSchema = Type.Object({
  ...camposBase,
  resumoConclusao: Nulavel(Type.String()),
});

export const AnaliseSchema = Type.Object({
  ...camposBase,
  resultado: Type.Unknown(),
  scripts: Type.Array(Type.Object({ nome: Type.String(), conteudo: Type.String() })),
  metadados: Type.Unknown(),
});

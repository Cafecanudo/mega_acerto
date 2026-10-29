import { Type } from '@fastify/type-provider-typebox';

const Dezenas = Type.Array(Type.Integer({ minimum: 0, maximum: 100 }), {
  minItems: 1,
  maxItems: 30,
});
const Nome = Type.Union([Type.String({ maxLength: 80 }), Type.Null()]);

export const ParametrosApostaSchema = Type.Object({ id: Type.Integer({ minimum: 1 }) });

export const FiltroApostasSchema = Type.Object({
  favoritas: Type.Boolean({ default: false }),
});

export const NovaApostaSchema = Type.Object(
  {
    jogo: Type.String({ minLength: 1 }),
    nome: Type.Optional(Nome),
    dezenas: Dezenas,
    favorita: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export const AlteracaoApostaSchema = Type.Object(
  {
    jogo: Type.Optional(Type.String({ minLength: 1 })),
    nome: Type.Optional(Nome),
    dezenas: Type.Optional(Dezenas),
    favorita: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false, minProperties: 1 },
);

export const ApostaSchema = Type.Object({
  id: Type.Integer(),
  jogo: Type.String(),
  nome: Nome,
  dezenas: Type.Array(Type.Integer()),
  favorita: Type.Boolean(),
  criadaEm: Type.String({ format: 'date-time' }),
  atualizadaEm: Type.String({ format: 'date-time' }),
  conferencia: Type.Object({
    ultimoConcurso: Type.Union([
      Type.Object({
        numero: Type.Integer(),
        data: Type.String({ format: 'date' }),
        acertos: Type.Integer(),
        dezenasAcertadas: Type.Array(Type.Integer()),
      }),
      Type.Null(),
    ]),
    historico: Type.Array(
      Type.Object({
        acertos: Type.Integer(),
        nome: Type.String(),
        concursos: Type.Integer(),
      }),
    ),
  }),
});

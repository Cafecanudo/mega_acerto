import { Type, type TSchema } from '@fastify/type-provider-typebox';
import { ConferenciaSchema } from './conferencia.ts';

const Nulavel = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const ConsultaApostasSchema = Type.Object({
  pagina: Type.Integer({ minimum: 1, default: 1 }),
  tamanho: Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
  dezenas: Type.Optional(Type.String({ pattern: '^\\d{1,3}(,\\d{1,3})*$' })),
  minimoCoincidencias: Type.Optional(Type.Integer({ minimum: 1 })),
});

const ApostaSchema = Type.Object({
  id: Type.Integer(),
  jogo: Type.String(),
  nome: Nulavel(Type.String()),
  dezenas: Type.Array(Type.Integer()),
  favoritoId: Nulavel(Type.Integer()),
  concurso: Nulavel(Type.Integer()),
  valor: Nulavel(Type.Number()),
  criadaEm: Type.String({ format: 'date-time' }),
  coincidencias: Nulavel(Type.Integer()),
  conferencia: ConferenciaSchema,
});

export const PaginaApostasSchema = Type.Object({
  itens: Type.Array(ApostaSchema),
  total: Type.Integer(),
  pagina: Type.Integer(),
  tamanho: Type.Integer(),
});

export const EfetivacaoApostasSchema = Type.Object(
  {
    jogo: Type.String({ minLength: 1 }),
    itens: Type.Array(
      Type.Object(
        {
          dezenas: Type.Array(Type.Integer({ minimum: 0, maximum: 100 }), {
            minItems: 1,
            maxItems: 30,
          }),
          nome: Type.Optional(Nulavel(Type.String({ maxLength: 80 }))),
          favoritoId: Type.Optional(Nulavel(Type.Integer({ minimum: 1 }))),
        },
        { additionalProperties: false },
      ),
      { minItems: 1, maxItems: 100 },
    ),
  },
  { additionalProperties: false },
);

export const ApostasEfetivadasSchema = Type.Object({
  concurso: Type.Integer(),
  ids: Type.Array(Type.Integer()),
  valorTotal: Nulavel(Type.Number()),
});

export const AcertosConcursoSchema = Type.Object({
  jogo: Type.String(),
  concurso: Type.Integer(),
  dezenas: Type.Array(Type.Integer()),
});

export const ResumoApostasSchema = Type.Object({
  total: Type.Integer(),
  comAcertos: Type.Integer(),
  maiorAcerto: Type.Integer(),
  melhor: Nulavel(
    Type.Object({
      id: Type.Integer(),
      nome: Nulavel(Type.String()),
      concurso: Type.Integer(),
    }),
  ),
});

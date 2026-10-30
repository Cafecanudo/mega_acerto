import { Type } from '@fastify/type-provider-typebox';
import { ConferenciaSchema } from './conferencia.ts';

const Dezenas = Type.Array(Type.Integer({ minimum: 0, maximum: 100 }), {
  minItems: 1,
  maxItems: 30,
});
const Nome = Type.Union([Type.String({ maxLength: 80 }), Type.Null()]);

export const ParametrosFavoritoSchema = Type.Object({ id: Type.Integer({ minimum: 1 }) });

export const NovoFavoritoSchema = Type.Object(
  {
    jogo: Type.String({ minLength: 1 }),
    nome: Type.Optional(Nome),
    dezenas: Dezenas,
  },
  { additionalProperties: false },
);

export const LoteFavoritosSchema = Type.Object(
  { itens: Type.Array(NovoFavoritoSchema, { minItems: 1, maxItems: 200 }) },
  { additionalProperties: false },
);

export const FavoritosCriadosSchema = Type.Object({
  criados: Type.Integer(),
  repetidos: Type.Integer(),
});

export const AlteracaoFavoritoSchema = Type.Object(
  {
    jogo: Type.Optional(Type.String({ minLength: 1 })),
    nome: Type.Optional(Nome),
    dezenas: Type.Optional(Dezenas),
  },
  { additionalProperties: false, minProperties: 1 },
);

export const FavoritoSchema = Type.Object({
  id: Type.Integer(),
  jogo: Type.String(),
  nome: Nome,
  dezenas: Type.Array(Type.Integer()),
  criadoEm: Type.String({ format: 'date-time' }),
  atualizadoEm: Type.String({ format: 'date-time' }),
  conferencia: ConferenciaSchema,
});

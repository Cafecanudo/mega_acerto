import { Type, type TSchema } from '@fastify/type-provider-typebox';

const Nulavel = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const ConsultaLinhaDoTempoSchema = Type.Object({
  ultimos: Type.Integer({ minimum: 1, maximum: 200, default: 50 }),
});

const DesempenhoSchema = Nulavel(
  Type.Object({
    itens: Type.Integer(),
    melhorAcerto: Type.Integer(),
    premio: Nulavel(Type.Number()),
  }),
);

export const PontoLinhaDoTempoSchema = Type.Object({
  numero: Type.Integer(),
  data: Type.String({ format: 'date' }),
  dezenas: Type.Array(Type.Integer()),
  apostas: DesempenhoSchema,
  favoritos: DesempenhoSchema,
});

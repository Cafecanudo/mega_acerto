import { Type } from '@fastify/type-provider-typebox';

export const ConferenciaSchema = Type.Object({
  concursoConferido: Type.Union([
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
});

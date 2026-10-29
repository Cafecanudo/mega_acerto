import { Type } from '@fastify/type-provider-typebox';
import { codigosJogo } from '@mega/domain';

export const CodigoJogoSchema = Type.Union(codigosJogo.map((codigo) => Type.Literal(codigo)));

const IntervaloSchema = Type.Object({ minimo: Type.Integer(), maximo: Type.Integer() });

export const RegraJogoSchema = Type.Object({
  codigo: Type.String(),
  nome: Type.String(),
  slugCaixa: Type.String(),
  universo: IntervaloSchema,
  dezenasPorSorteio: Type.Integer(),
  sorteiosPorConcurso: Type.Integer(),
  dezenasPorAposta: IntervaloSchema,
});

export const JogoDisponivelSchema = Type.Object({
  regra: RegraJogoSchema,
  totalConcursos: Type.Integer(),
  ultimoConcurso: Type.Union([Type.Integer(), Type.Null()]),
  ultimaData: Type.Union([Type.String({ format: 'date' }), Type.Null()]),
  ultimoAcumulado: Type.Union([Type.Boolean(), Type.Null()]),
  ultimosGanhadores: Type.Union([Type.Integer(), Type.Null()]),
  ultimaSincronizacao: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});

export const ParametrosJogoSchema = Type.Object({ jogo: CodigoJogoSchema });

import { Type, type TSchema } from '@fastify/type-provider-typebox';

const Nulavel = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const ExecucaoIngestaoSchema = Type.Object({
  id: Type.Integer(),
  jogo: Type.String(),
  gatilho: Type.Union([
    Type.Literal('inicializacao'),
    Type.Literal('agendada'),
    Type.Literal('manual'),
  ]),
  status: Type.Union([
    Type.Literal('executando'),
    Type.Literal('concluida'),
    Type.Literal('falhou'),
    Type.Literal('interrompida'),
  ]),
  iniciadoEm: Type.String({ format: 'date-time' }),
  finalizadoEm: Nulavel(Type.String({ format: 'date-time' })),
  ultimoConcursoCaixa: Nulavel(Type.Integer()),
  totalPrevisto: Type.Integer(),
  importados: Type.Integer(),
  erro: Nulavel(Type.String()),
});

export const StatusIngestaoSchema = Type.Object({
  emAndamento: Type.Boolean(),
  ultimaExecucao: Nulavel(ExecucaoIngestaoSchema),
  integridade: Type.Object({
    totalConcursos: Type.Integer(),
    ultimoConcurso: Nulavel(Type.Integer()),
    numerosAusentes: Type.Array(Type.Integer()),
    concursosComDezenasInvalidas: Type.Array(Type.Integer()),
  }),
});

export const SincronizacaoIniciadaSchema = Type.Object({ execucaoId: Type.Integer() });

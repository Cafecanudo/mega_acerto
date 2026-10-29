import { Type, type TSchema } from '@fastify/type-provider-typebox';
import { CodigoJogoSchema } from './jogo.ts';

const Nulavel = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

const Data = Type.String({ format: 'date' });

export const PaginacaoQuerySchema = Type.Object({
  pagina: Type.Integer({ minimum: 1, default: 1 }),
  tamanho: Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
});

export const ParametrosConcursoSchema = Type.Object({
  jogo: CodigoJogoSchema,
  numero: Type.Integer({ minimum: 1 }),
});

export const BuscaQuerySchema = Type.Intersect([
  PaginacaoQuerySchema,
  Type.Object({
    dezenas: Type.String({ pattern: '^\\d{1,3}(,\\d{1,3})*$' }),
    minimoAcertos: Type.Optional(Type.Integer({ minimum: 1 })),
  }),
]);

const ResumoConcursoSchema = Type.Object({
  numero: Type.Integer(),
  dataApuracao: Data,
  acumulado: Type.Boolean(),
  valorArrecadado: Nulavel(Type.Number()),
  ganhadoresFaixaPrincipal: Nulavel(Type.Integer()),
  sorteios: Type.Array(Type.Array(Type.Integer())),
});

const PaginaSchema = <T extends TSchema>(item: T) =>
  Type.Object({
    itens: Type.Array(item),
    total: Type.Integer(),
    pagina: Type.Integer(),
    tamanho: Type.Integer(),
  });

export const PaginaConcursosSchema = PaginaSchema(ResumoConcursoSchema);

export const PaginaBuscaSchema = PaginaSchema(
  Type.Intersect([ResumoConcursoSchema, Type.Object({ acertos: Type.Integer() })]),
);

export const DetalheConcursoSchema = Type.Object({
  numero: Type.Integer(),
  dataApuracao: Data,
  acumulado: Type.Boolean(),
  valorArrecadado: Nulavel(Type.Number()),
  valorAcumuladoProximo: Nulavel(Type.Number()),
  valorEstimadoProximo: Nulavel(Type.Number()),
  dataProximo: Nulavel(Data),
  localSorteio: Nulavel(Type.String()),
  municipioUf: Nulavel(Type.String()),
  sorteios: Type.Array(
    Type.Object({
      dezenas: Type.Array(Type.Integer()),
      ordemExtracao: Nulavel(Type.Array(Type.Integer())),
    }),
  ),
  premiacoes: Type.Array(
    Type.Object({
      faixa: Type.Integer(),
      descricao: Type.String(),
      ganhadores: Type.Integer(),
      valorPremio: Type.Number(),
    }),
  ),
  anterior: Nulavel(Type.Integer()),
  proximo: Nulavel(Type.Integer()),
});

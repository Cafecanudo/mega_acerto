import { Type, type Static } from 'typebox';

const TextoOuNulo = Type.Union([Type.String(), Type.Null()]);
const NumeroOuNulo = Type.Union([Type.Number(), Type.Null()]);
const ListaDezenas = Type.Union([Type.Array(Type.String()), Type.Null()]);

export const PayloadCaixaSchema = Type.Object({
  numero: Type.Integer({ minimum: 1 }),
  dataApuracao: Type.String(),
  dataProximoConcurso: Type.Optional(TextoOuNulo),
  acumulado: Type.Boolean(),
  listaDezenas: Type.Array(Type.String()),
  dezenasSorteadasOrdemSorteio: Type.Optional(ListaDezenas),
  listaDezenasSegundoSorteio: Type.Optional(ListaDezenas),
  listaRateioPremio: Type.Array(
    Type.Object({
      faixa: Type.Integer(),
      descricaoFaixa: Type.String(),
      numeroDeGanhadores: Type.Integer(),
      valorPremio: Type.Number(),
    }),
  ),
  valorArrecadado: Type.Optional(NumeroOuNulo),
  valorAcumuladoProximoConcurso: Type.Optional(NumeroOuNulo),
  valorEstimadoProximoConcurso: Type.Optional(NumeroOuNulo),
  localSorteio: Type.Optional(TextoOuNulo),
  nomeMunicipioUFSorteio: Type.Optional(TextoOuNulo),
});

export type PayloadCaixa = Static<typeof PayloadCaixaSchema>;

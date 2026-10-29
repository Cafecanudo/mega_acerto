import { Type, type Static } from 'typebox';

const Probabilidade = Type.Number({ minimum: 0, maximum: 1 });
const ProbabilidadeOuNula = Type.Union([Probabilidade, Type.Null()]);

const TesteSchema = Type.Object(
  {
    nome: Type.String({ description: 'Nome do teste, ex.: Qui-quadrado de aderência' }),
    hipoteseNula: Type.String(),
    estatistica: Type.Number(),
    grausLiberdade: Type.Union([Type.Number(), Type.Null()]),
    pValor: Probabilidade,
    pValorCorrigido: ProbabilidadeOuNula,
    tamanhoEfeito: Type.String({ description: 'Métrica e valor, ex.: V de Cramér = 0,012' }),
    rejeitaH0: Type.Boolean({ description: 'Decisão ao nível de 5% após correção' }),
    interpretacao: Type.String(),
  },
  { additionalProperties: false },
);

const DezenaSchema = Type.Object(
  {
    dezena: Type.Integer(),
    frequencia: Type.Integer({ minimum: 0 }),
    esperado: Type.Number(),
    desvioPadronizado: Type.Number({ description: '(observado - esperado) / desvio-padrão' }),
    probabilidadePosterior: Probabilidade,
    icInferior: Probabilidade,
    icSuperior: Probabilidade,
    atrasoAtual: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

const ParSchema = Type.Object(
  {
    dezenaA: Type.Integer(),
    dezenaB: Type.Integer(),
    ocorrencias: Type.Integer({ minimum: 0 }),
    esperado: Type.Number(),
    pValorCorrigido: Probabilidade,
  },
  { additionalProperties: false },
);

export const ResultadoAleatoriedadeSchema = Type.Object(
  {
    conferencia: Type.Object(
      {
        frequenciasConferem: Type.Boolean(),
        divergencias: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
    amostra: Type.Object(
      {
        concursos: Type.Integer({ minimum: 0 }),
        dezenasSorteadas: Type.Integer({ minimum: 0 }),
        frequenciaEsperadaPorDezena: Type.Number(),
      },
      { additionalProperties: false },
    ),
    testes: Type.Array(TesteSchema, { minItems: 1 }),
    dezenas: Type.Array(DezenaSchema, { minItems: 1 }),
    paresRelevantes: Type.Array(ParSchema),
    conclusao: Type.Object(
      {
        rejeitaUniformidade: Type.Boolean(),
        resumo: Type.String({ description: 'Uma frase com a conclusão principal' }),
        interpretacao: Type.String(),
        limitacoes: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type ResultadoAleatoriedade = Static<typeof ResultadoAleatoriedadeSchema>;

import { Type, type Static } from 'typebox';

const Probabilidade = Type.Number({ minimum: 0, maximum: 1 });

const FrequenciaSchema = Type.Object(
  { dezena: Type.Integer(), frequencia: Type.Integer({ minimum: 0 }) },
  { additionalProperties: false },
);

const DezenaTopSchema = Type.Object(
  {
    dezena: Type.Integer(),
    frequenciaJanela: Type.Integer({ minimum: 0 }),
    desvioPadronizado: Type.Number({
      description: '(frequência na janela - esperado) / desvio-padrão binomial',
    }),
    posicaoJanela: Type.Integer({
      minimum: 1,
      description: '1 + número de dezenas com frequência estritamente maior na janela',
    }),
    frequenciaHistorica: Type.Integer({ minimum: 0 }),
    posicaoHistorica: Type.Integer({
      minimum: 1,
      description: '1 + número de dezenas com frequência estritamente maior no histórico',
    }),
    percentilHistorico: Type.Number({
      minimum: 0,
      maximum: 100,
      description: 'Percentual de dezenas com frequência histórica menor ou igual',
    }),
  },
  { additionalProperties: false },
);

const EstatisticaSimuladaSchema = Type.Object(
  {
    nome: Type.String({ description: 'Ex.: Frequência da 15ª mais sorteada' }),
    observado: Type.Number(),
    percentil2_5: Type.Number(),
    mediana: Type.Number(),
    percentil97_5: Type.Number(),
    pValor: Type.Number({
      minimum: 0,
      maximum: 1,
      description: 'Proporção de replicações com valor maior ou igual ao observado',
    }),
  },
  { additionalProperties: false },
);

const TesteSchema = Type.Object(
  {
    nome: Type.String(),
    hipoteseNula: Type.String(),
    estatistica: Type.Number(),
    pValor: Probabilidade,
    tamanhoEfeito: Type.String(),
    rejeitaH0: Type.Boolean({ description: 'Decisão ao nível de 5%' }),
    interpretacao: Type.String(),
  },
  { additionalProperties: false },
);

export const ResultadoFrequenciaRecenteSchema = Type.Object(
  {
    conferencia: Type.Object(
      {
        frequenciasConferem: Type.Boolean(),
        divergencias: Type.Array(Type.String()),
        frequenciasJanela: Type.Array(FrequenciaSchema, {
          description: 'Frequência de cada dezena do universo na janela, para conferência',
        }),
      },
      { additionalProperties: false },
    ),
    janela: Type.Object(
      {
        concursos: Type.Integer({ minimum: 1 }),
        primeiroConcurso: Type.Integer(),
        ultimoConcurso: Type.Integer(),
        frequenciaEsperada: Type.Number({ description: 'Esperado por dezena na janela' }),
        desvioPadraoEsperado: Type.Number(),
      },
      { additionalProperties: false },
    ),
    top: Type.Array(DezenaTopSchema, { minItems: 1 }),
    simulacao: Type.Object(
      {
        replicacoes: Type.Integer({ minimum: 1 }),
        estatisticas: Type.Array(EstatisticaSimuladaSchema, { minItems: 1 }),
        interpretacao: Type.String(),
      },
      { additionalProperties: false },
    ),
    persistencia: Type.Union([
      Type.Object(
        {
          primeiroConcursoAnterior: Type.Integer(),
          ultimoConcursoAnterior: Type.Integer(),
          correlacaoSpearman: Type.Number({ minimum: -1, maximum: 1 }),
          pValor: Probabilidade,
          sobreposicaoTop: Type.Integer({ minimum: 0 }),
          sobreposicaoEsperada: Type.Number(),
          interpretacao: Type.String(),
        },
        { additionalProperties: false },
      ),
      Type.Null(),
    ]),
    backtest: Type.Object(
      {
        concursosTestados: Type.Integer({ minimum: 0 }),
        primeiroConcurso: Type.Integer(),
        ultimoConcurso: Type.Integer(),
        mediaAcertosTop: Type.Number(),
        mediaAcertosEsperada: Type.Number(),
        teste: TesteSchema,
      },
      { additionalProperties: false },
    ),
    conclusao: Type.Object(
      {
        explicavelPeloAcaso: Type.Boolean(),
        resumo: Type.String({ description: 'Uma frase com a conclusão principal' }),
        interpretacao: Type.String(),
        limitacoes: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type ResultadoFrequenciaRecente = Static<typeof ResultadoFrequenciaRecenteSchema>;

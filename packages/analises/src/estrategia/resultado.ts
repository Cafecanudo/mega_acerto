import { Type, type Static } from 'typebox';

const Probabilidade = Type.Number({ minimum: 0, maximum: 1 });

const FaixaSchema = Type.Object(
  {
    nome: Type.String({ description: 'Nome da faixa premiada, ex.: Quadra' }),
    acertos: Type.Integer({ minimum: 0 }),
    ocorrenciasEstrategia: Type.Integer({
      minimum: 0,
      description:
        'Concursos em que o palpite da estratégia teve pelo menos uma aposta simples nesta faixa',
    }),
    ocorrenciasAleatoria: Type.Number({
      minimum: 0,
      description: 'Média das simulações aleatórias com a mesma quantidade de dezenas',
    }),
    esperadoTeorico: Type.Number({
      minimum: 0,
      description: 'Valor esperado pela hipergeométrica',
    }),
  },
  { additionalProperties: false },
);

const PontoEvolucaoSchema = Type.Object(
  {
    concurso: Type.Integer(),
    mediaEstrategia: Type.Number(),
    mediaAleatoria: Type.Number(),
  },
  { additionalProperties: false },
);

export const ResultadoEstrategiaSchema = Type.Object(
  {
    conferencia: Type.Object(
      {
        frequenciasConferem: Type.Boolean(),
        divergencias: Type.Array(Type.String()),
        frequencias: Type.Array(
          Type.Object(
            { dezena: Type.Integer(), frequencia: Type.Integer({ minimum: 0 }) },
            { additionalProperties: false },
          ),
          { description: 'Frequência de cada dezena no histórico completo, para conferência' },
        ),
      },
      { additionalProperties: false },
    ),
    estrategia: Type.Object(
      {
        nome: Type.String(),
        regraAplicada: Type.String({
          description: 'Descrição exata do algoritmo implementado, incluindo desempates',
        }),
      },
      { additionalProperties: false },
    ),
    palpite: Type.Object(
      {
        concursoAlvo: Type.Integer({ description: 'Próximo concurso, último do histórico + 1' }),
        dezenas: Type.Array(Type.Integer(), { minItems: 1 }),
        justificativa: Type.String(),
      },
      { additionalProperties: false },
    ),
    backtest: Type.Object(
      {
        concursosTestados: Type.Integer({ minimum: 0 }),
        primeiroConcurso: Type.Integer(),
        ultimoConcurso: Type.Integer(),
        simulacoesAleatorias: Type.Integer({ minimum: 0 }),
        mediaAcertosEstrategia: Type.Number(),
        mediaAcertosAleatoria: Type.Number(),
        mediaAcertosTeorica: Type.Number(),
        faixas: Type.Array(FaixaSchema),
        teste: Type.Object(
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
        ),
        evolucao: Type.Array(PontoEvolucaoSchema, {
          maxItems: 60,
          description: 'Média acumulada de acertos em pontos espaçados do backtest',
        }),
      },
      { additionalProperties: false },
    ),
    conclusao: Type.Object(
      {
        superaAleatorio: Type.Boolean(),
        resumo: Type.String({ description: 'Uma frase com a conclusão principal' }),
        interpretacao: Type.String(),
        limitacoes: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type ResultadoEstrategia = Static<typeof ResultadoEstrategiaSchema>;

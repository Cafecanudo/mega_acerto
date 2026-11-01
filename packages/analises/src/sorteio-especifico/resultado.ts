import { Type, type Static } from 'typebox';

const DezenaSorteadaSchema = Type.Object(
  {
    dezena: Type.Integer(),
    frequenciaAntes: Type.Integer({
      minimum: 0,
      description: 'Frequência da dezena em todos os concursos anteriores ao analisado',
    }),
    posicaoHistorica: Type.Integer({
      minimum: 1,
      description: '1 + número de dezenas com frequência anterior estritamente maior',
    }),
    percentilHistorico: Type.Number({
      minimum: 0,
      maximum: 100,
      description: 'Percentual de dezenas com frequência anterior menor ou igual',
    }),
    frequenciaJanela: Type.Integer({ minimum: 0 }),
    posicaoJanela: Type.Integer({
      minimum: 1,
      description: '1 + número de dezenas com frequência estritamente maior na janela',
    }),
    atrasoAntes: Type.Integer({
      minimum: 0,
      description: 'Concursos sem sair imediatamente antes do analisado (0 se saiu no anterior)',
    }),
    probabilidadeAtraso: Type.Number({
      minimum: 0,
      maximum: 1,
      description: 'Probabilidade, ao acaso, de uma dezena ficar pelo menos esse atraso sem sair',
    }),
  },
  { additionalProperties: false },
);

const CaracteristicaSchema = Type.Object(
  {
    nome: Type.String({ description: 'Ex.: Soma das dezenas' }),
    valor: Type.Number(),
    percentil: Type.Number({
      minimum: 0,
      maximum: 100,
      description: 'Percentual das combinações possíveis com valor menor ou igual',
    }),
    faixaTipica: Type.String({ description: 'Intervalo central de 95% das combinações possíveis' }),
    interpretacao: Type.String(),
  },
  { additionalProperties: false },
);

const FiltroAplicadoSchema = Type.Object(
  {
    codigo: Type.String(),
    atende: Type.Boolean(),
    detalhe: Type.String({ description: 'Como o palpite atende ao filtro' }),
  },
  { additionalProperties: false },
);

export const ResultadoSorteioEspecificoSchema = Type.Object(
  {
    conferencia: Type.Object(
      {
        frequenciasConferem: Type.Boolean(),
        divergencias: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
    concurso: Type.Object(
      {
        numero: Type.Integer(),
        data: Type.String(),
        dezenas: Type.Array(Type.Integer(), { minItems: 1 }),
      },
      { additionalProperties: false },
    ),
    janela: Type.Object(
      {
        concursos: Type.Integer({ minimum: 1 }),
        primeiroConcurso: Type.Integer(),
        ultimoConcurso: Type.Integer(),
      },
      { additionalProperties: false },
    ),
    dezenas: Type.Array(DezenaSorteadaSchema, { minItems: 1 }),
    perfil: Type.Array(CaracteristicaSchema, { minItems: 1 }),
    palpite: Type.Object(
      {
        concursoAlvo: Type.Integer({ description: 'Último concurso do arquivo + 1' }),
        dezenas: Type.Array(Type.Integer(), { minItems: 1 }),
        filtros: Type.Array(FiltroAplicadoSchema, { minItems: 1 }),
        combinacoesElegiveis: Type.Integer({
          minimum: 1,
          description: 'Quantas combinações atendem a todos os filtros',
        }),
        justificativa: Type.String(),
      },
      { additionalProperties: false },
    ),
    conclusao: Type.Object(
      {
        sorteioTipico: Type.Boolean(),
        resumo: Type.String({ description: 'Uma frase com a conclusão principal' }),
        interpretacao: Type.String(),
        limitacoes: Type.Array(Type.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type ResultadoSorteioEspecifico = Static<typeof ResultadoSorteioEspecificoSchema>;

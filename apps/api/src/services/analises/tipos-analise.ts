import {
  montarPromptAleatoriedade,
  montarPromptEstrategia,
  ResultadoAleatoriedadeSchema,
  ResultadoEstrategiaSchema,
  type ContextoPrompt,
  type TipoAnalise,
} from '@mega/analises';
import type { RegraJogo } from '@mega/domain';
import type { TSchema } from 'typebox';
import type { Analise, ConferenciaSistema } from '../../data/repositories/analise-repository.ts';
import type { DatasetExportado } from './exportador-dataset.ts';
import { conferirComSistema, validarEstrutura } from './validacao-aleatoriedade.ts';
import { lerParametrosEstrategia, validarEstrategia } from './validacao-estrategia.ts';

export interface ResultadoValidado {
  readonly resultado: unknown;
  readonly conferencia: ConferenciaSistema;
}

export interface ExecucaoTipoAnalise {
  readonly schema: TSchema;
  readonly montarPrompt: (contexto: ContextoPrompt, analise: Analise) => string;
  readonly validar: (
    regra: RegraJogo,
    dataset: DatasetExportado,
    analise: Analise,
    saida: unknown,
  ) => ResultadoValidado;
}

export const execucoesPorTipo: Record<TipoAnalise, ExecucaoTipoAnalise> = {
  aleatoriedade: {
    schema: ResultadoAleatoriedadeSchema,
    montarPrompt: (contexto) => montarPromptAleatoriedade(contexto),
    validar: (regra, dataset, _analise, saida) => {
      const resultado = validarEstrutura(saida);
      return { resultado, conferencia: conferirComSistema(regra, dataset, resultado) };
    },
  },
  estrategia: {
    schema: ResultadoEstrategiaSchema,
    montarPrompt: (contexto, analise) =>
      montarPromptEstrategia(contexto, lerParametrosEstrategia(analise.parametros)),
    validar: (regra, dataset, analise, saida) =>
      validarEstrategia(regra, dataset, analise.ultimoConcurso, analise.parametros, saida),
  },
};

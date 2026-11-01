import {
  montarPromptAleatoriedade,
  montarPromptEstrategia,
  montarPromptFrequenciaRecente,
  montarPromptSorteioEspecifico,
  ResultadoAleatoriedadeSchema,
  ResultadoEstrategiaSchema,
  ResultadoFrequenciaRecenteSchema,
  ResultadoSorteioEspecificoSchema,
  type ContextoPrompt,
  type TipoAnalise,
} from '@mega/analises';
import type { RegraJogo } from '@mega/domain';
import type { TSchema } from 'typebox';
import type { Analise, ConferenciaSistema } from '../../data/repositories/analise-repository.ts';
import type { DatasetExportado, RecorteDataset } from './exportador-dataset.ts';
import { conferirComSistema, validarEstrutura } from './validacao-aleatoriedade.ts';
import { lerParametrosEstrategia, validarEstrategia } from './validacao-estrategia.ts';
import {
  lerParametrosFrequenciaRecente,
  validarFrequenciaRecente,
} from './validacao-frequencia-recente.ts';
import {
  lerParametrosSorteioEspecifico,
  validarSorteioEspecifico,
} from './validacao-sorteio-especifico.ts';

export interface ResultadoValidado {
  readonly resultado: unknown;
  readonly conferencia: ConferenciaSistema;
}

export interface ExecucaoTipoAnalise {
  readonly schema: TSchema;
  readonly recorte: (analise: Analise) => RecorteDataset | null;
  readonly montarPrompt: (contexto: ContextoPrompt, analise: Analise) => string;
  readonly validar: (
    regra: RegraJogo,
    dataset: DatasetExportado,
    analise: Analise,
    saida: unknown,
  ) => ResultadoValidado;
}

const semRecorte = (): null => null;

export const execucoesPorTipo: Record<TipoAnalise, ExecucaoTipoAnalise> = {
  aleatoriedade: {
    schema: ResultadoAleatoriedadeSchema,
    recorte: semRecorte,
    montarPrompt: (contexto) => montarPromptAleatoriedade(contexto),
    validar: (regra, dataset, _analise, saida) => {
      const resultado = validarEstrutura(saida);
      return { resultado, conferencia: conferirComSistema(regra, dataset, resultado) };
    },
  },
  estrategia: {
    schema: ResultadoEstrategiaSchema,
    recorte: semRecorte,
    montarPrompt: (contexto, analise) =>
      montarPromptEstrategia(contexto, lerParametrosEstrategia(analise.parametros)),
    validar: (regra, dataset, analise, saida) =>
      validarEstrategia(regra, dataset, analise.ultimoConcurso, analise.parametros, saida),
  },
  'frequencia-recente': {
    schema: ResultadoFrequenciaRecenteSchema,
    recorte: (analise) => ({
      ateConcurso: analise.ultimoConcurso,
      janela: lerParametrosFrequenciaRecente(analise.parametros).janela,
    }),
    montarPrompt: (contexto, analise) =>
      montarPromptFrequenciaRecente(contexto, lerParametrosFrequenciaRecente(analise.parametros)),
    validar: (regra, dataset, analise, saida) =>
      validarFrequenciaRecente(regra, dataset, analise.ultimoConcurso, analise.parametros, saida),
  },
  'sorteio-especifico': {
    schema: ResultadoSorteioEspecificoSchema,
    recorte: (analise) => {
      const parametros = lerParametrosSorteioEspecifico(analise.parametros);
      return { ateConcurso: parametros.concurso - 1, janela: parametros.janela };
    },
    montarPrompt: (contexto, analise) =>
      montarPromptSorteioEspecifico(contexto, lerParametrosSorteioEspecifico(analise.parametros)),
    validar: (regra, dataset, analise, saida) =>
      validarSorteioEspecifico(regra, dataset, analise.ultimoConcurso, analise.parametros, saida),
  },
};

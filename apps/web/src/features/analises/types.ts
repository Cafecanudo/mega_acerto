import type {
  EsforcoAnalise,
  ModeloAnalise,
  ParametrosEstrategia,
  ParametrosFrequenciaRecente,
  ParametrosSorteioEspecifico,
  ResultadoAleatoriedade,
  ResultadoEstrategia,
  ResultadoFrequenciaRecente,
  ResultadoSorteioEspecifico,
  SolicitacaoSorteioEspecifico,
  StatusAnalise,
  TipoAnalise,
} from '@mega/analises';

export interface ConferenciaSistema {
  readonly ok: boolean;
  readonly divergencias: string[];
}

interface CamposAnalise {
  readonly id: number;
  readonly jogo: string;
  readonly tipo: TipoAnalise;
  readonly versaoPrompt: number;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly status: StatusAnalise;
  readonly ultimoConcurso: number;
  readonly parametros:
    ParametrosEstrategia | ParametrosFrequenciaRecente | ParametrosSorteioEspecifico | null;
  readonly hashDataset: string | null;
  readonly conferenciaSistema: ConferenciaSistema | null;
  readonly custoUsd: number | null;
  readonly duracaoMs: number | null;
  readonly erro: string | null;
  readonly criadoEm: string;
  readonly iniciadoEm: string | null;
  readonly finalizadoEm: string | null;
}

export interface ResumoAnalise extends CamposAnalise {
  readonly resumoConclusao: string | null;
}

interface CamposDetalhe extends CamposAnalise {
  readonly scripts: { readonly nome: string; readonly conteudo: string }[];
}

export interface AnaliseAleatoriedade extends CamposDetalhe {
  readonly tipo: 'aleatoriedade';
  readonly resultado: ResultadoAleatoriedade | null;
}

export interface AnaliseEstrategia extends CamposDetalhe {
  readonly tipo: 'estrategia';
  readonly parametros: ParametrosEstrategia | null;
  readonly resultado: ResultadoEstrategia | null;
}

export interface AnaliseFrequenciaRecente extends CamposDetalhe {
  readonly tipo: 'frequencia-recente';
  readonly parametros: ParametrosFrequenciaRecente | null;
  readonly resultado: ResultadoFrequenciaRecente | null;
}

export interface AnaliseSorteioEspecifico extends CamposDetalhe {
  readonly tipo: 'sorteio-especifico';
  readonly parametros: ParametrosSorteioEspecifico | null;
  readonly resultado: ResultadoSorteioEspecifico | null;
}

export type Analise =
  AnaliseAleatoriedade | AnaliseEstrategia | AnaliseFrequenciaRecente | AnaliseSorteioEspecifico;

export interface SolicitacaoAnalise {
  readonly tipo: TipoAnalise;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly forcar: boolean;
  readonly parametros:
    ParametrosEstrategia | ParametrosFrequenciaRecente | SolicitacaoSorteioEspecifico | null;
}

export interface AnaliseSolicitada {
  readonly id: number;
  readonly reaproveitada: boolean;
}

export const emAndamento = (status: StatusAnalise): boolean =>
  status === 'pendente' || status === 'executando';

import type {
  EsforcoAnalise,
  ModeloAnalise,
  ParametrosEstrategia,
  ResultadoAleatoriedade,
  ResultadoEstrategia,
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
  readonly parametros: ParametrosEstrategia | null;
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
  readonly resultado: ResultadoEstrategia | null;
}

export type Analise = AnaliseAleatoriedade | AnaliseEstrategia;

export interface SolicitacaoAnalise {
  readonly tipo: TipoAnalise;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly forcar: boolean;
  readonly parametros: ParametrosEstrategia | null;
}

export interface AnaliseSolicitada {
  readonly id: number;
  readonly reaproveitada: boolean;
}

export const emAndamento = (status: StatusAnalise): boolean =>
  status === 'pendente' || status === 'executando';

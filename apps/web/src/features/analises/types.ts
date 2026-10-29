import type {
  EsforcoAnalise,
  ModeloAnalise,
  ResultadoAleatoriedade,
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

export interface Analise extends CamposAnalise {
  readonly resultado: ResultadoAleatoriedade | null;
  readonly scripts: { readonly nome: string; readonly conteudo: string }[];
}

export interface SolicitacaoAnalise {
  readonly tipo: TipoAnalise;
  readonly modelo: ModeloAnalise;
  readonly esforco: EsforcoAnalise;
  readonly forcar: boolean;
}

export interface AnaliseSolicitada {
  readonly id: number;
  readonly reaproveitada: boolean;
}

export const emAndamento = (status: StatusAnalise): boolean =>
  status === 'pendente' || status === 'executando';

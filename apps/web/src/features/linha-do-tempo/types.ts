export interface DesempenhoConcurso {
  readonly itens: number;
  readonly melhorAcerto: number;
  readonly premio: number | null;
}

export interface PontoLinhaDoTempo {
  readonly numero: number;
  readonly data: string;
  readonly dezenas: number[];
  readonly apostas: DesempenhoConcurso | null;
  readonly favoritos: DesempenhoConcurso | null;
}

export type SerieLinhaDoTempo = 'apostas' | 'favoritos';

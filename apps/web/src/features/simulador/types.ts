export interface JogoReferencia {
  readonly id: number;
  readonly nome: string | null;
  readonly dezenas: readonly number[];
}

export interface ReferenciasSimulacao {
  readonly apostas: readonly JogoReferencia[];
  readonly favoritos: readonly JogoReferencia[];
}

export interface Coincidencia {
  readonly referencia: JogoReferencia;
  readonly acertadas: ReadonlySet<number>;
  readonly premio: string | null;
}

export interface ResultadoSorteio {
  readonly dezenas: readonly number[];
  readonly aposta: Coincidencia | null;
  readonly favorito: Coincidencia | null;
}

export interface SorteioSimulado {
  readonly numero: number;
  readonly sorteios: readonly (readonly number[])[];
}

export interface SorteioConferido {
  readonly numero: number;
  readonly resultados: readonly ResultadoSorteio[];
  readonly premiado: boolean;
}

export type Marcacao = 'aposta' | 'favorito' | 'ambos';

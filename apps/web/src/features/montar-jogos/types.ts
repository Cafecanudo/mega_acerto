export interface JogoMontado {
  readonly chave: number;
  readonly jogo: string;
  readonly dezenas: readonly number[];
  readonly nome: string;
}

export interface JogoParaAposta {
  readonly jogo: string;
  readonly dezenas: readonly number[];
  readonly nome: string;
  readonly favoritoId: null;
}

export type ModoGeracao = 'todas' | 'sortear';

export const LIMITE_JOGOS_MONTADOS = 1000;
export const LIMITE_JOGOS_POR_APOSTA = 200;

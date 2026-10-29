import type { Conferencia } from '@/types/conferencia';

export interface Favorito {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly criadoEm: string;
  readonly atualizadoEm: string;
  readonly conferencia: Conferencia;
}

export interface DadosFavorito {
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
}

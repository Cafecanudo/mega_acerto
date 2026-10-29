import type { Conferencia } from '@/types/conferencia';

export interface Aposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favoritoId: number | null;
  readonly concurso: number | null;
  readonly criadaEm: string;
  readonly coincidencias: number | null;
  readonly conferencia: Conferencia;
}

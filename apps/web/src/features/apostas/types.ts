import type { Conferencia } from '@/types/conferencia';

export interface TeimosinhaAposta {
  readonly posicao: number;
  readonly total: number;
}

export interface Aposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favoritoId: number | null;
  readonly concurso: number | null;
  readonly valor: number | null;
  readonly criadaEm: string;
  readonly teimosinha: TeimosinhaAposta | null;
  readonly coincidencias: number | null;
  readonly conferencia: Conferencia;
}

export const isApostaEditavel = (aposta: Aposta): boolean =>
  aposta.concurso !== null && aposta.conferencia.concursoConferido === null;

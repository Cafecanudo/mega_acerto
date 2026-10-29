export interface Conferencia {
  readonly concursoConferido: {
    readonly numero: number;
    readonly data: string;
    readonly acertos: number;
    readonly dezenasAcertadas: number[];
  } | null;
  readonly historico: {
    readonly acertos: number;
    readonly nome: string;
    readonly concursos: number;
  }[];
}

export interface ResumoAcertos {
  readonly total: number;
  readonly comAcertos: number;
  readonly maiorAcerto: number;
  readonly melhor: {
    readonly id: number;
    readonly nome: string | null;
    readonly concurso: number;
  } | null;
}

export interface ConferenciaAposta {
  readonly ultimoConcurso: {
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

export interface Aposta {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favorita: boolean;
  readonly criadaEm: string;
  readonly atualizadaEm: string;
  readonly conferencia: ConferenciaAposta;
}

export interface DadosAposta {
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favorita: boolean;
}

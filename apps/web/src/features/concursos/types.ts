export interface ResumoConcurso {
  readonly numero: number;
  readonly dataApuracao: string;
  readonly acumulado: boolean;
  readonly valorArrecadado: number | null;
  readonly ganhadoresFaixaPrincipal: number | null;
  readonly sorteios: number[][];
}

export interface ResultadoBusca extends ResumoConcurso {
  readonly acertos: number;
}

export interface DetalheConcurso {
  readonly numero: number;
  readonly dataApuracao: string;
  readonly acumulado: boolean;
  readonly valorArrecadado: number | null;
  readonly valorAcumuladoProximo: number | null;
  readonly valorEstimadoProximo: number | null;
  readonly dataProximo: string | null;
  readonly localSorteio: string | null;
  readonly municipioUf: string | null;
  readonly sorteios: {
    readonly dezenas: number[];
    readonly ordemExtracao: number[] | null;
  }[];
  readonly premiacoes: {
    readonly faixa: number;
    readonly descricao: string;
    readonly ganhadores: number;
    readonly valorPremio: number;
  }[];
  readonly anterior: number | null;
  readonly proximo: number | null;
}

export interface FrequenciaDezena {
  readonly dezena: number;
  readonly vezes: number;
  readonly percentual: number;
  readonly ultimoConcurso: number | null;
  readonly atraso: number | null;
}

export interface FrequenciasJogo {
  readonly concursos: number;
  readonly ultimoConcurso: number | null;
  readonly dezenas: FrequenciaDezena[];
}

export interface DezenaImportada {
  readonly sorteio: number;
  readonly dezena: number;
  readonly ordemExtracao: number | null;
}

export interface PremiacaoImportada {
  readonly faixa: number;
  readonly descricao: string;
  readonly ganhadores: number;
  readonly valorPremio: number;
}

export interface ConcursoImportado {
  readonly jogo: string;
  readonly numero: number;
  readonly dataApuracao: string;
  readonly acumulado: boolean;
  readonly valorArrecadado: number | null;
  readonly valorAcumuladoProximo: number | null;
  readonly valorEstimadoProximo: number | null;
  readonly dataProximo: string | null;
  readonly localSorteio: string | null;
  readonly municipioUf: string | null;
  readonly dezenas: readonly DezenaImportada[];
  readonly premiacoes: readonly PremiacaoImportada[];
  readonly payload: unknown;
  readonly hashPayload: string;
}

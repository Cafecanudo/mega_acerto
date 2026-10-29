export interface IntervaloNumerico {
  readonly minimo: number;
  readonly maximo: number;
}

export interface RegraJogo {
  readonly codigo: string;
  readonly nome: string;
  readonly slugCaixa: string;
  readonly universo: IntervaloNumerico;
  readonly dezenasPorSorteio: number;
  readonly sorteiosPorConcurso: number;
  readonly dezenasPorAposta: IntervaloNumerico;
}

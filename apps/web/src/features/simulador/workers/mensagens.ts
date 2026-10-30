export interface PedidoBusca {
  readonly jogo: string;
  readonly referencias: readonly (readonly number[])[];
  readonly faixaAlvo: number;
}

export type MensagemBusca =
  | { readonly tipo: 'progresso'; readonly tentativas: number }
  | { readonly tipo: 'match'; readonly tentativas: number; readonly sorteio: number[][] };

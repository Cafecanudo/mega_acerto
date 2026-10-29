export interface Pagina<T> {
  readonly itens: T[];
  readonly total: number;
  readonly pagina: number;
  readonly tamanho: number;
}

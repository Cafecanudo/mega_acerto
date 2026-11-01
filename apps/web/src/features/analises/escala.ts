export const percentualNaEscala = (valor: number, minimo: number, maximo: number): number =>
  maximo === minimo ? 50 : ((valor - minimo) / (maximo - minimo)) * 100;

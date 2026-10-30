const LIMITE_UINT32 = 2 ** 32;

export const sortearInteiro = (limiteExclusivo: number): number => {
  const rejeitarAPartirDe = LIMITE_UINT32 - (LIMITE_UINT32 % limiteExclusivo);
  const amostra = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(amostra);
    const valor = amostra[0] ?? 0;
    if (valor < rejeitarAPartirDe) return valor % limiteExclusivo;
  }
};

const TAMANHO_LOTE_ALEATORIO = 16_384;

export const criarSorteadorEmLote = (): ((limiteExclusivo: number) => number) => {
  const lote = new Uint32Array(TAMANHO_LOTE_ALEATORIO);
  let posicao = TAMANHO_LOTE_ALEATORIO;
  const proximo = (): number => {
    if (posicao === TAMANHO_LOTE_ALEATORIO) {
      crypto.getRandomValues(lote);
      posicao = 0;
    }
    return lote[posicao++] ?? 0;
  };
  return (limiteExclusivo) => {
    const rejeitarAPartirDe = LIMITE_UINT32 - (LIMITE_UINT32 % limiteExclusivo);
    for (;;) {
      const valor = proximo();
      if (valor < rejeitarAPartirDe) return valor % limiteExclusivo;
    }
  };
};

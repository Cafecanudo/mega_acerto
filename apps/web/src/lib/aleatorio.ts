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

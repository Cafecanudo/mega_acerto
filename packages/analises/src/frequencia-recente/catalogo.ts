export interface ParametrosFrequenciaRecente {
  readonly janela: number;
  readonly tamanhoTop: number;
}

export const JANELAS_FREQUENCIA_RECENTE = [50, 100, 200, 500] as const;
export const JANELA_FREQUENCIA_MINIMA = 20;
export const JANELA_FREQUENCIA_MAXIMA = 1000;
export const TAMANHO_TOP_MINIMO = 5;
export const TAMANHO_TOP_MAXIMO = 30;

export const PARAMETROS_FREQUENCIA_RECENTE_PADRAO: ParametrosFrequenciaRecente = {
  janela: 100,
  tamanhoTop: 15,
};

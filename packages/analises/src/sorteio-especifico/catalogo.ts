export interface ParametrosSorteioEspecifico {
  readonly concurso: number;
  readonly janela: number;
}

export interface SolicitacaoSorteioEspecifico {
  readonly concurso: number | null;
  readonly janela: number;
}

export const JANELAS_SORTEIO_ESPECIFICO = [50, 100, 200, 500] as const;
export const JANELA_SORTEIO_MINIMA = 20;
export const JANELA_SORTEIO_MAXIMA = 1000;

export const PARAMETROS_SORTEIO_ESPECIFICO_PADRAO: SolicitacaoSorteioEspecifico = {
  concurso: null,
  janela: 100,
};

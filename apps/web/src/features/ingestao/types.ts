export interface ExecucaoIngestao {
  readonly id: number;
  readonly gatilho: 'inicializacao' | 'agendada' | 'manual';
  readonly status: 'executando' | 'concluida' | 'falhou' | 'interrompida';
  readonly iniciadoEm: string;
  readonly finalizadoEm: string | null;
  readonly ultimoConcursoCaixa: number | null;
  readonly totalPrevisto: number;
  readonly importados: number;
  readonly erro: string | null;
}

export interface StatusIngestao {
  readonly emAndamento: boolean;
  readonly ultimaExecucao: ExecucaoIngestao | null;
  readonly integridade: {
    readonly totalConcursos: number;
    readonly ultimoConcurso: number | null;
    readonly numerosAusentes: number[];
    readonly concursosComDezenasInvalidas: number[];
  };
}

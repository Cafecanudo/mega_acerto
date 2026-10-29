export interface ResumoJogo {
  readonly regra: { readonly codigo: string };
  readonly totalConcursos: number;
  readonly ultimoConcurso: number | null;
  readonly ultimaData: string | null;
  readonly ultimoAcumulado: boolean | null;
  readonly ultimosGanhadores: number | null;
  readonly ultimaSincronizacao: string | null;
}

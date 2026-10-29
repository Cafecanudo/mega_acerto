import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { chavesConsulta } from '@/lib/react-query';
import type { Pagina } from '@/types/api';
import type { DetalheConcurso, ResultadoBusca, ResumoConcurso } from '../types';

export const TAMANHO_PAGINA = 20;

export interface ParametrosBusca {
  readonly dezenas: readonly number[];
  readonly minimoAcertos: number;
  readonly pagina: number;
}

export const listarConcursosQuery = (jogo: string, pagina: number) =>
  queryOptions({
    queryKey: [...chavesConsulta.concursos(jogo), 'lista', pagina],
    queryFn: () =>
      api.get<Pagina<ResumoConcurso>>(`/jogos/${jogo}/concursos`, {
        pagina,
        tamanho: TAMANHO_PAGINA,
      }),
    placeholderData: keepPreviousData,
  });

export const obterConcursoQuery = (jogo: string, numero: number) =>
  queryOptions({
    queryKey: [...chavesConsulta.concursos(jogo), 'detalhe', numero],
    queryFn: () => api.get<DetalheConcurso>(`/jogos/${jogo}/concursos/${numero}`),
  });

export const ultimoConcursoQuery = (jogo: string) =>
  queryOptions({
    queryKey: [...chavesConsulta.concursos(jogo), 'ultimo'],
    queryFn: () => api.get<DetalheConcurso>(`/jogos/${jogo}/concursos/ultimo`),
  });

export const buscarConcursosQuery = (jogo: string, busca: ParametrosBusca) =>
  queryOptions({
    queryKey: [...chavesConsulta.concursos(jogo), 'busca', busca],
    queryFn: () =>
      api.get<Pagina<ResultadoBusca>>(`/jogos/${jogo}/concursos/busca`, {
        dezenas: busca.dezenas.join(','),
        minimoAcertos: busca.minimoAcertos,
        pagina: busca.pagina,
        tamanho: TAMANHO_PAGINA,
      }),
    enabled: busca.dezenas.length > 0,
    placeholderData: keepPreviousData,
  });

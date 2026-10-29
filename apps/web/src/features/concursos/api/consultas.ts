import type { RegraJogo } from '@mega/domain';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { calcularFaixaAcertos, type ParametrosBusca } from '@/lib/busca-dezenas';
import { chavesConsulta } from '@/lib/react-query';
import type { Pagina } from '@/types/api';
import type { DetalheConcurso, FrequenciasJogo, ResultadoBusca, ResumoConcurso } from '../types';

export const TAMANHO_PAGINA = 20;

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

export const buscarConcursosQuery = (regra: RegraJogo, busca: ParametrosBusca) =>
  queryOptions({
    queryKey: [...chavesConsulta.concursos(regra.codigo), 'busca', busca],
    queryFn: () =>
      api.get<Pagina<ResultadoBusca>>(`/jogos/${regra.codigo}/concursos/busca`, {
        dezenas: busca.dezenas.join(','),
        minimoAcertos: calcularFaixaAcertos(regra, busca).minimo,
        pagina: busca.pagina,
        tamanho: TAMANHO_PAGINA,
      }),
    enabled: busca.dezenas.length > 0,
    placeholderData: keepPreviousData,
  });

export const frequenciasQuery = (jogo: string, ultimos: number | null) =>
  queryOptions({
    queryKey: [...chavesConsulta.concursos(jogo), 'frequencias', ultimos],
    queryFn: () =>
      api.get<FrequenciasJogo>(`/jogos/${jogo}/frequencias`, { ultimos: ultimos ?? undefined }),
    placeholderData: keepPreviousData,
  });

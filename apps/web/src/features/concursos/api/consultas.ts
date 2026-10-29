import type { RegraJogo } from '@mega/domain';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { chavesConsulta } from '@/lib/react-query';
import type { Pagina } from '@/types/api';
import type { DetalheConcurso, ResultadoBusca, ResumoConcurso } from '../types';

export const TAMANHO_PAGINA = 20;

export const MINIMO_ACERTOS_COMBINACOES = 3;

export interface ParametrosBusca {
  readonly dezenas: readonly number[];
  readonly incluirCombinacoes: boolean;
  readonly pagina: number;
}

export interface FaixaAcertos {
  readonly minimo: number;
  readonly maximo: number;
}

export const calcularFaixaAcertos = (regra: RegraJogo, busca: ParametrosBusca): FaixaAcertos => {
  const maximo = Math.min(busca.dezenas.length, regra.dezenasPorSorteio);
  const minimo = busca.incluirCombinacoes ? Math.min(MINIMO_ACERTOS_COMBINACOES, maximo) : maximo;
  return { minimo, maximo };
};

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

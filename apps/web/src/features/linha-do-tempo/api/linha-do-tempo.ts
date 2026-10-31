import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PontoLinhaDoTempo } from '../types';

export const linhaDoTempoQuery = (jogo: string, ultimos: number) =>
  queryOptions({
    queryKey: ['apostas', 'linha-do-tempo', jogo, ultimos],
    queryFn: () => api.get<PontoLinhaDoTempo[]>(`/jogos/${jogo}/linha-do-tempo`, { ultimos }),
    placeholderData: keepPreviousData,
  });

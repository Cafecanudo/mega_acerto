import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { chavesConsulta } from '@/lib/react-query';
import type { StatusIngestao } from '../types';

const INTERVALO_EM_ANDAMENTO_MS = 3_000;
const INTERVALO_OCIOSO_MS = 60_000;

export const statusIngestaoQuery = (jogo: string) =>
  queryOptions({
    queryKey: chavesConsulta.ingestao(jogo),
    queryFn: () => api.get<StatusIngestao>(`/jogos/${jogo}/ingestao`),
    refetchInterval: (consulta) =>
      consulta.state.data?.emAndamento ? INTERVALO_EM_ANDAMENTO_MS : INTERVALO_OCIOSO_MS,
  });

export const useSincronizar = (jogo: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ execucaoId: number }>(`/jogos/${jogo}/ingestao`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: chavesConsulta.ingestao(jogo) }),
  });
};

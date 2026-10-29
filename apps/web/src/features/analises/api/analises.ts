import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { chavesConsulta } from '@/lib/react-query';
import {
  emAndamento,
  type Analise,
  type AnaliseSolicitada,
  type ResumoAnalise,
  type SolicitacaoAnalise,
} from '../types';

const INTERVALO_ACOMPANHAMENTO_MS = 3_000;

const chaveAnalises = (jogo: string) => [...chavesConsulta.jogos(), jogo, 'analises'] as const;

export const listarAnalisesQuery = (jogo: string) =>
  queryOptions({
    queryKey: [...chaveAnalises(jogo), 'lista'],
    queryFn: () => api.get<ResumoAnalise[]>(`/jogos/${jogo}/analises`),
    refetchInterval: (consulta) =>
      consulta.state.data?.some((analise) => emAndamento(analise.status))
        ? INTERVALO_ACOMPANHAMENTO_MS
        : false,
  });

export const obterAnaliseQuery = (jogo: string, id: number) =>
  queryOptions({
    queryKey: [...chaveAnalises(jogo), 'detalhe', id],
    queryFn: () => api.get<Analise>(`/jogos/${jogo}/analises/${id}`),
    refetchInterval: (consulta) =>
      consulta.state.data && emAndamento(consulta.state.data.status)
        ? INTERVALO_ACOMPANHAMENTO_MS
        : false,
  });

export const useSolicitarAnalise = (jogo: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (solicitacao: SolicitacaoAnalise) =>
      api.post<AnaliseSolicitada>(`/jogos/${jogo}/analises`, solicitacao),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveAnalises(jogo) }),
  });
};

import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  emAndamento,
  type Analise,
  type AnaliseSolicitada,
  type ResumoAnalise,
  type SolicitacaoAnalise,
} from '../types';

const INTERVALO_ACOMPANHAMENTO_MS = 3_000;
const CHAVE_ANALISES = ['analises'] as const;

export const listarAnalisesQuery = () =>
  queryOptions({
    queryKey: [...CHAVE_ANALISES, 'lista'],
    queryFn: () => api.get<ResumoAnalise[]>('/analises'),
    refetchInterval: (consulta) =>
      consulta.state.data?.some((analise) => emAndamento(analise.status))
        ? INTERVALO_ACOMPANHAMENTO_MS
        : false,
  });

export const obterAnaliseQuery = (id: number) =>
  queryOptions({
    queryKey: [...CHAVE_ANALISES, 'detalhe', id],
    queryFn: () => api.get<Analise>(`/analises/${id}`),
    refetchInterval: (consulta) =>
      consulta.state.data && emAndamento(consulta.state.data.status)
        ? INTERVALO_ACOMPANHAMENTO_MS
        : false,
  });

export const useSolicitarAnalise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jogo, ...solicitacao }: SolicitacaoAnalise & { readonly jogo: string }) =>
      api.post<AnaliseSolicitada>(`/jogos/${jogo}/analises`, solicitacao),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_ANALISES }),
  });
};

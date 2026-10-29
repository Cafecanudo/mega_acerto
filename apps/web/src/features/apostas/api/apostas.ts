import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Aposta, DadosAposta } from '../types';

const CHAVE_APOSTAS = ['apostas'] as const;

export const listarApostasQuery = (somenteFavoritas: boolean) =>
  queryOptions({
    queryKey: [...CHAVE_APOSTAS, { somenteFavoritas }],
    queryFn: () =>
      api.get<Aposta[]>('/apostas', { favoritas: somenteFavoritas ? 'true' : undefined }),
  });

const useInvalidarApostas = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CHAVE_APOSTAS });
};

export const useSalvarAposta = () => {
  const invalidar = useInvalidarApostas();
  return useMutation({
    mutationFn: ({ id, dados }: { readonly id: number | null; readonly dados: DadosAposta }) =>
      id === null
        ? api.post<Aposta>('/apostas', dados)
        : api.patch<Aposta>(`/apostas/${id}`, dados),
    onSuccess: invalidar,
  });
};

export const useAlternarFavorita = () => {
  const invalidar = useInvalidarApostas();
  return useMutation({
    mutationFn: (aposta: Aposta) =>
      api.patch<Aposta>(`/apostas/${aposta.id}`, { favorita: !aposta.favorita }),
    onSuccess: invalidar,
  });
};

export const useExcluirAposta = () => {
  const invalidar = useInvalidarApostas();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/apostas/${id}`),
    onSuccess: invalidar,
  });
};

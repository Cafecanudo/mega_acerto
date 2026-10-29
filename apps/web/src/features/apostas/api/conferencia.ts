import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Conferencia } from '@/types/conferencia';

export interface PremioConferido {
  readonly faixa: number;
  readonly acertos: number;
  readonly nome: string;
  readonly quantidade: number;
  readonly valorUnitario: number | null;
}

export interface ApostaAConferir {
  readonly id: number;
  readonly jogo: string;
  readonly nome: string | null;
  readonly dezenas: number[];
  readonly favoritoId: number | null;
  readonly concurso: number | null;
  readonly valor: number | null;
  readonly criadaEm: string;
  readonly conferencia: Conferencia;
  readonly premios: PremioConferido[];
  readonly premioTotal: number | null;
}

export const apostasAConferirQuery = () =>
  queryOptions({
    queryKey: ['apostas', 'a-conferir'],
    queryFn: () => api.get<ApostaAConferir[]>('/apostas/a-conferir'),
  });

export const useMarcarConferidas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: readonly number[]) =>
      api.post<{ readonly marcadas: number }>('/apostas/conferidas', { ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apostas', 'a-conferir'] }),
  });
};

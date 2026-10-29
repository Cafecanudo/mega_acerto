import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface ValorConfigurado {
  readonly jogo: string;
  readonly valorAposta: number | null;
  readonly atualizadoEm: string | null;
}

const CHAVE_VALORES = ['configuracoes', 'valores'] as const;

export const listarValoresQuery = () =>
  queryOptions({
    queryKey: CHAVE_VALORES,
    queryFn: () => api.get<ValorConfigurado[]>('/configuracoes/valores'),
    select: (valores) => new Map(valores.map((valor) => [valor.jogo, valor])),
  });

export const useSalvarValor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jogo, valorAposta }: { readonly jogo: string; readonly valorAposta: number }) =>
      api.put<ValorConfigurado>(`/configuracoes/valores/${jogo}`, { valorAposta }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_VALORES }),
  });
};

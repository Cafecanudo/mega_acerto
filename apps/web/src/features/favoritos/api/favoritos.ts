import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { DadosFavorito, Favorito } from '../types';

const CHAVE_FAVORITOS = ['favoritos'] as const;

export const listarFavoritosQuery = () =>
  queryOptions({
    queryKey: CHAVE_FAVORITOS,
    queryFn: () => api.get<Favorito[]>('/favoritos'),
  });

const useInvalidarFavoritos = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CHAVE_FAVORITOS });
};

export const useSalvarFavorito = () => {
  const invalidar = useInvalidarFavoritos();
  return useMutation({
    mutationFn: ({ id, dados }: { readonly id: number | null; readonly dados: DadosFavorito }) =>
      id === null
        ? api.post<Favorito>('/favoritos', dados)
        : api.patch<Favorito>(`/favoritos/${id}`, dados),
    onSuccess: invalidar,
  });
};

export interface FavoritosCriados {
  readonly criados: number;
  readonly repetidos: number;
}

export const useSalvarFavoritosEmLote = () => {
  const invalidar = useInvalidarFavoritos();
  return useMutation({
    mutationFn: (itens: readonly DadosFavorito[]) =>
      api.post<FavoritosCriados>('/favoritos/lote', { itens }),
    onSuccess: invalidar,
  });
};

export const useExcluirFavorito = () => {
  const invalidar = useInvalidarFavoritos();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/favoritos/${id}`),
    onSuccess: invalidar,
  });
};

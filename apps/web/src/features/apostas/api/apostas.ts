import type { RegraJogo } from '@mega/domain';
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { calcularFaixaAcertos, type ParametrosBusca } from '@/lib/busca-dezenas';
import type { Pagina } from '@/types/api';
import type { ResumoAcertos } from '@/types/conferencia';
import type { Aposta } from '../types';

const CHAVE_APOSTAS = ['apostas'] as const;
const TAMANHO_PAGINA = 20;

export const listarApostasQuery = (regra: RegraJogo, busca: ParametrosBusca) =>
  queryOptions({
    queryKey: [...CHAVE_APOSTAS, 'lista', busca],
    queryFn: () =>
      api.get<Pagina<Aposta>>('/apostas', {
        pagina: busca.pagina,
        tamanho: TAMANHO_PAGINA,
        dezenas: busca.dezenas.length > 0 ? busca.dezenas.join(',') : undefined,
        minimoCoincidencias:
          busca.dezenas.length > 0 ? calcularFaixaAcertos(regra, busca).minimo : undefined,
      }),
    placeholderData: keepPreviousData,
  });

export interface ItemEfetivacao {
  readonly dezenas: readonly number[];
  readonly nome: string | null;
  readonly favoritoId: number | null;
  readonly teimosinha?: number;
}

export interface ItemEfetivacaoJogo extends ItemEfetivacao {
  readonly jogo: string;
}

export interface ApostasEfetivadas {
  readonly concursos: { readonly jogo: string; readonly concurso: number }[];
  readonly ids: number[];
  readonly valorTotal: number | null;
}

export const useEfetivarApostas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itens: readonly ItemEfetivacaoJogo[]) =>
      api.post<ApostasEfetivadas>('/apostas', { itens }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_APOSTAS }),
  });
};

export interface AcertosConcurso {
  readonly jogo: string;
  readonly concurso: number;
  readonly dezenas: number[];
}

const chaveAcertos = (jogo: string, concurso: number): string => `${jogo}:${String(concurso)}`;

export const acertosApostasQuery = () =>
  queryOptions({
    queryKey: [...CHAVE_APOSTAS, 'acertos'],
    queryFn: () => api.get<AcertosConcurso[]>('/apostas/acertos'),
    select: (acertos) =>
      new Map(
        acertos.map((item) => [
          chaveAcertos(item.jogo, item.concurso),
          new Set(item.dezenas) as ReadonlySet<number>,
        ]),
      ),
  });

export const buscarAcertos = (
  acertos: ReadonlyMap<string, ReadonlySet<number>> | undefined,
  jogo: string,
  concurso: number,
): ReadonlySet<number> | undefined => acertos?.get(chaveAcertos(jogo, concurso));

export const resumoApostasQuery = () =>
  queryOptions({
    queryKey: [...CHAVE_APOSTAS, 'resumo'],
    queryFn: () => api.get<ResumoAcertos>('/apostas/resumo'),
  });

export interface EdicaoAposta {
  readonly dezenas: readonly number[];
  readonly nome: string | null;
}

export const useEditarAposta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, edicao }: { readonly id: number; readonly edicao: EdicaoAposta }) =>
      api.patch<{ readonly ids: number[] }>(`/apostas/${String(id)}`, edicao),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_APOSTAS }),
  });
};

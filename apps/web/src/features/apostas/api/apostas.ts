import type { RegraJogo } from '@mega/domain';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
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

export const resumoApostasQuery = () =>
  queryOptions({
    queryKey: [...CHAVE_APOSTAS, 'resumo'],
    queryFn: () => api.get<ResumoAcertos>('/apostas/resumo'),
  });

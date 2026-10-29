import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { chavesConsulta } from '@/lib/react-query';
import type { ResumoJogo } from '../types';

const UM_MINUTO = 60_000;

export const listarJogosQuery = () =>
  queryOptions({
    queryKey: [...chavesConsulta.jogos(), 'resumo'],
    queryFn: () => api.get<ResumoJogo[]>('/jogos'),
    select: (resumos) => new Map(resumos.map((resumo) => [resumo.regra.codigo, resumo])),
    refetchInterval: UM_MINUTO,
  });

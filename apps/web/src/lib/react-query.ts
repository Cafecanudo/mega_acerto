import { QueryClient } from '@tanstack/react-query';
import { ErroApi } from './api-client';

const TRINTA_SEGUNDOS = 30_000;

const deveRetentar = (falhas: number, erro: Error): boolean =>
  !(erro instanceof ErroApi && erro.status < 500) && falhas < 2;

export const criarQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: TRINTA_SEGUNDOS,
        refetchOnWindowFocus: false,
        retry: deveRetentar,
      },
    },
  });

export const chavesConsulta = {
  jogo: (jogo: string) => ['jogos', jogo] as const,
  concursos: (jogo: string) => ['jogos', jogo, 'concursos'] as const,
  ingestao: (jogo: string) => ['jogos', jogo, 'ingestao'] as const,
};

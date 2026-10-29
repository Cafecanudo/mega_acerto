import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ErroApi } from './api-client';

const TRINTA_SEGUNDOS = 30_000;
const CHAVE_SESSAO = ['auth', 'eu'] as const;

const deveRetentar = (falhas: number, erro: Error): boolean =>
  !(erro instanceof ErroApi && erro.status < 500) && falhas < 2;

const sessaoExpirou = (erro: Error): boolean => erro instanceof ErroApi && erro.status === 401;

export const criarQueryClient = (): QueryClient => {
  const encerrarSessao = (erro: Error) => {
    if (sessaoExpirou(erro)) cliente.setQueryData(CHAVE_SESSAO, null);
  };
  const cliente = new QueryClient({
    queryCache: new QueryCache({ onError: encerrarSessao }),
    mutationCache: new MutationCache({ onError: encerrarSessao }),
    defaultOptions: {
      queries: {
        staleTime: TRINTA_SEGUNDOS,
        refetchOnWindowFocus: false,
        retry: deveRetentar,
      },
    },
  });
  return cliente;
};

export const chavesConsulta = {
  sessao: () => CHAVE_SESSAO,
  jogos: () => ['jogos'] as const,
  concursos: (jogo: string) => ['jogos', jogo, 'concursos'] as const,
  ingestao: (jogo: string) => ['jogos', jogo, 'ingestao'] as const,
};

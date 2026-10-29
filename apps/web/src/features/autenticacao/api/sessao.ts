import { queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api, ErroApi } from '@/lib/api-client';
import { chavesConsulta } from '@/lib/react-query';

export interface Usuario {
  readonly id: number;
  readonly nome: string;
  readonly login: string;
}

export interface Credenciais {
  readonly login: string;
  readonly senha: string;
}

export interface Cadastro extends Credenciais {
  readonly nome: string;
}

const obterUsuarioLogado = async (): Promise<Usuario | null> => {
  try {
    return await api.get<Usuario>('/auth/eu');
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) return null;
    throw erro;
  }
};

export const sessaoQuery = () =>
  queryOptions({
    queryKey: chavesConsulta.sessao(),
    queryFn: obterUsuarioLogado,
    staleTime: Number.POSITIVE_INFINITY,
  });

const limparDadosDoUsuario = (queryClient: QueryClient) => {
  queryClient.removeQueries({
    predicate: (consulta) => consulta.queryKey[0] !== chavesConsulta.sessao()[0],
  });
};

const useIniciarSessao = <T>(enviar: (dados: T) => Promise<Usuario>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enviar,
    onSuccess: (usuario) => {
      limparDadosDoUsuario(queryClient);
      queryClient.setQueryData(chavesConsulta.sessao(), usuario);
    },
  });
};

export const useEntrar = () =>
  useIniciarSessao((credenciais: Credenciais) => api.post<Usuario>('/auth/entrar', credenciais));

export const useCadastrar = () =>
  useIniciarSessao((cadastro: Cadastro) => api.post<Usuario>('/auth/cadastro', cadastro));

export const useSair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<null>('/auth/sair'),
    onSettled: () => {
      limparDadosDoUsuario(queryClient);
      queryClient.setQueryData(chavesConsulta.sessao(), null);
    },
  });
};

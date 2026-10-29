import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Carregando, Falha } from '@/components/ui/estado';
import { sessaoQuery } from '../api/sessao';
import { DialogoLogin } from './dialogo-login';

export const PortaoAutenticacao = ({ children }: { readonly children: ReactNode }) => {
  const sessao = useQuery(sessaoQuery());

  if (sessao.isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Carregando mensagem="Verificando sessão…" />
      </div>
    );
  }
  if (sessao.isError) {
    return (
      <div className="grid min-h-dvh place-items-center p-4">
        <Falha erro={sessao.error} />
      </div>
    );
  }
  if (!sessao.data) {
    return (
      <div className="min-h-dvh bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_55%)]">
        <DialogoLogin />
      </div>
    );
  }
  return children;
};

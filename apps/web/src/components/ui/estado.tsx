import type { ReactNode } from 'react';

const Moldura = ({ children }: { readonly children: ReactNode }) => (
  <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
    {children}
  </div>
);

export const Carregando = ({ mensagem = 'Carregando…' }: { readonly mensagem?: string }) => (
  <Moldura>
    <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400" />
    {mensagem}
  </Moldura>
);

export const Falha = ({ erro }: { readonly erro: Error }) => (
  <Moldura>
    <strong className="text-rose-600 dark:text-rose-400">Não foi possível carregar</strong>
    {erro.message}
  </Moldura>
);

export const Vazio = ({ children }: { readonly children: ReactNode }) => (
  <Moldura>{children}</Moldura>
);

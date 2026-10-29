import type { ReactNode } from 'react';

interface PaginaContaProps {
  readonly titulo: string;
  readonly icone: ReactNode;
  readonly descricao: string;
  readonly children: ReactNode;
}

export const PaginaConta = ({ titulo, icone, descricao, children }: PaginaContaProps) => (
  <div className="flex flex-col gap-3 px-4 pt-4 pb-3 sm:px-5 lg:h-full lg:min-h-0">
    <header className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-1">
      <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icone}
        {titulo}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{descricao}</p>
    </header>
    {children}
  </div>
);

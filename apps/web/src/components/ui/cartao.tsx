import type { ReactNode } from 'react';

interface CartaoProps {
  readonly titulo?: ReactNode;
  readonly acoes?: ReactNode;
  readonly children: ReactNode;
}

export const Cartao = ({ titulo, acoes, children }: CartaoProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    {(titulo ?? acoes) && (
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-semibold">{titulo}</h2>
        {acoes}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

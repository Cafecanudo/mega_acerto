import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

export interface ItemNavegacao {
  readonly rotulo: string;
  readonly destino: string;
}

interface AppLayoutProps {
  readonly titulo: string;
  readonly navegacao: readonly ItemNavegacao[];
  readonly lateral?: ReactNode;
  readonly children: ReactNode;
}

const classeLink = ({ isActive }: { readonly isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950'
      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

export const AppLayout = ({ titulo, navegacao, lateral, children }: AppLayoutProps) => (
  <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 font-mono text-sm font-bold text-white dark:bg-emerald-500 dark:text-emerald-950">
          MA
        </span>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Mega Acerto
          </p>
          <h1 className="text-lg leading-tight font-semibold">{titulo}</h1>
        </div>
      </div>
      <nav className="flex gap-1">
        {navegacao.map((item) => (
          <NavLink key={item.destino} to={item.destino} className={classeLink} end>
            {item.rotulo}
          </NavLink>
        ))}
      </nav>
    </header>
    {lateral}
    <main className="flex flex-1 flex-col gap-6">{children}</main>
  </div>
);

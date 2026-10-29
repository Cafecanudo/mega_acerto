import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { paths } from '@/config/paths';

interface AppShellProps {
  readonly menu: ReactNode;
  readonly children: ReactNode;
}

const Marca = () => (
  <Link to={paths.inicio} className="flex items-center gap-3 px-2">
    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 font-mono text-sm font-bold text-white">
      MA
    </span>
    <span className="text-base font-semibold tracking-tight">Mega Acerto</span>
  </Link>
);

export const AppShell = ({ menu, children }: AppShellProps) => (
  <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
    <aside className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white/90 px-3 py-4 backdrop-blur lg:h-dvh lg:border-r lg:border-b-0 lg:py-6 dark:border-slate-800 dark:bg-slate-900/90">
      <Marca />
      <nav className="-mx-3 overflow-x-auto px-3 lg:mx-0 lg:flex-1 lg:overflow-y-auto lg:px-0">
        {menu}
      </nav>
    </aside>
    <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
  </div>
);

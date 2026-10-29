import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { paths } from '@/config/paths';

interface AppShellProps {
  readonly menu: ReactNode;
  readonly children: ReactNode;
}

const Marca = () => (
  <Link to={paths.inicio} className="flex items-center gap-2.5 px-2.5">
    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 font-mono text-xs font-bold text-white">
      MA
    </span>
    <span className="text-sm font-semibold tracking-tight">Mega Acerto</span>
  </Link>
);

export const AppShell = ({ menu, children }: AppShellProps) => (
  <div className="min-h-dvh lg:grid lg:h-dvh lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:overflow-hidden">
    <aside className="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-200 bg-white/90 px-2 py-3 backdrop-blur lg:h-dvh lg:border-r lg:border-b-0 dark:border-slate-800 dark:bg-slate-900/90">
      <Marca />
      <nav className="-mx-2 overflow-x-auto px-2 lg:mx-0 lg:flex-1 lg:overflow-y-auto lg:px-0">
        {menu}
      </nav>
    </aside>
    <main className="min-w-0 lg:h-dvh lg:overflow-hidden">{children}</main>
  </div>
);

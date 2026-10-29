import { IconStar, IconTicket } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { paths } from '@/config/paths';
import { IndicadoresApostas } from '@/features/apostas/components/indicadores-apostas';

const classeItem = ({ isActive }: { readonly isActive: boolean }) =>
  `flex min-w-40 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition lg:min-w-0 ${
    isActive
      ? 'bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
  }`;

const Item = ({
  destino,
  icone,
  indicadores,
  children,
}: {
  readonly destino: string;
  readonly icone: ReactNode;
  readonly indicadores: ReactNode;
  readonly children: ReactNode;
}) => (
  <li>
    <NavLink to={destino} className={classeItem}>
      {icone}
      {children}
      {indicadores}
    </NavLink>
  </li>
);

export const MenuConta = () => (
  <ul className="flex gap-0.5 lg:flex-col">
    <Item
      destino={paths.apostas}
      icone={<IconTicket aria-hidden size="1.375rem" stroke={1.75} className="text-slate-500" />}
      indicadores={<IndicadoresApostas somenteFavoritas={false} />}
    >
      Apostas
    </Item>
    <Item
      destino={paths.favoritos}
      icone={<IconStar aria-hidden size="1.375rem" stroke={1.75} className="text-amber-500" />}
      indicadores={<IndicadoresApostas somenteFavoritas />}
    >
      Favoritos
    </Item>
  </ul>
);

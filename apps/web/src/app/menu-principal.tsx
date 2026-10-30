import { IconBulb, IconChartHistogram, IconChecklist, IconDice5 } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { paths } from '@/config/paths';
import { IndicadorConferencia } from '@/features/apostas/components/indicador-conferencia';

const classeItem = ({ isActive }: { readonly isActive: boolean }) =>
  `flex min-w-40 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition lg:min-w-0 ${
    isActive
      ? 'bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
  }`;

const Item = ({
  destino,
  icone,
  children,
}: {
  readonly destino: string;
  readonly icone: ReactNode;
  readonly children: ReactNode;
}) => (
  <li>
    <NavLink to={destino} className={classeItem}>
      {icone}
      {children}
    </NavLink>
  </li>
);

export const MenuPrincipal = () => (
  <ul className="flex gap-0.5 lg:flex-col">
    <Item
      destino={paths.analises}
      icone={
        <IconChartHistogram aria-hidden size="1.375rem" stroke={1.75} className="text-sky-500" />
      }
    >
      Análises
    </Item>
    <Item
      destino={paths.palpites}
      icone={<IconBulb aria-hidden size="1.375rem" stroke={1.75} className="text-amber-500" />}
    >
      Palpites
    </Item>
    <Item
      destino={paths.simulador}
      icone={<IconDice5 aria-hidden size="1.375rem" stroke={1.75} className="text-violet-500" />}
    >
      Simulador
    </Item>
    <Item
      destino={paths.conferirApostas}
      icone={<IconChecklist aria-hidden size="1.375rem" stroke={1.75} className="text-slate-500" />}
    >
      Conferir Apostas
      <IndicadorConferencia />
    </Item>
  </ul>
);

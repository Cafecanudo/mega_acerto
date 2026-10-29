import { IconCurrencyReal } from '@tabler/icons-react';
import { NavLink } from 'react-router';
import { paths } from '@/config/paths';

const classeItem = ({ isActive }: { readonly isActive: boolean }) =>
  `flex min-w-40 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition lg:min-w-0 ${
    isActive
      ? 'bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
  }`;

export const MenuConfiguracoes = () => (
  <ul className="flex gap-0.5 lg:flex-col">
    <li>
      <NavLink to={paths.valores} className={classeItem}>
        <IconCurrencyReal
          aria-hidden
          size="1.375rem"
          stroke={1.75}
          className="text-emerald-600 dark:text-emerald-400"
        />
        Valores
      </NavLink>
    </li>
  </ul>
);

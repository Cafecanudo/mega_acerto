import { Outlet } from 'react-router';
import { AppShell } from '@/components/layouts/app-shell';
import { MenuJogos } from '@/features/jogos/components/menu-jogos';

const Raiz = () => (
  <AppShell menu={<MenuJogos />}>
    <Outlet />
  </AppShell>
);

export default Raiz;

import { Outlet } from 'react-router';
import { AppShell } from '@/components/layouts/app-shell';
import { GrupoMenu } from '@/components/layouts/grupo-menu';
import { IndicadoresApostas } from '@/features/apostas/components/indicadores-apostas';
import { MenuJogos } from '@/features/jogos/components/menu-jogos';
import { MenuConta } from '../menu-conta';

const MenuLateral = () => (
  <div className="flex gap-4 lg:flex-col">
    <GrupoMenu titulo="Jogos" chave="jogos">
      <MenuJogos indicadores={(codigo) => <IndicadoresApostas somenteFavoritas jogo={codigo} />} />
    </GrupoMenu>
    <GrupoMenu titulo="Minha Conta" chave="conta">
      <MenuConta />
    </GrupoMenu>
  </div>
);

const Raiz = () => (
  <AppShell menu={<MenuLateral />}>
    <Outlet />
  </AppShell>
);

export default Raiz;

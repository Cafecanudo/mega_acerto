import { IconTicket } from '@tabler/icons-react';
import { Outlet } from 'react-router';
import { AppShell } from '@/components/layouts/app-shell';
import { GrupoMenu } from '@/components/layouts/grupo-menu';
import { IndicadoresFavoritos } from '@/features/favoritos/components/indicadores-favoritos';
import { MenuJogos } from '@/features/jogos/components/menu-jogos';
import { MenuConta } from '../menu-conta';

const MenuLateral = () => (
  <div className="flex gap-4 lg:flex-col">
    <GrupoMenu titulo="Jogos" chave="jogos">
      <MenuJogos indicadores={(codigo) => <IndicadoresFavoritos jogo={codigo} />} />
    </GrupoMenu>
    <GrupoMenu titulo="Minha Conta" chave="conta">
      <MenuConta />
    </GrupoMenu>
  </div>
);

const BotaoApostar = () => (
  <button
    type="button"
    className="mx-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
  >
    <IconTicket aria-hidden size="1.125rem" stroke={1.75} />
    Apostar
  </button>
);

const Raiz = () => (
  <AppShell menu={<MenuLateral />} acao={<BotaoApostar />}>
    <Outlet />
  </AppShell>
);

export default Raiz;

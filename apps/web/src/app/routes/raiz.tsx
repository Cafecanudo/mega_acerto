import { Outlet } from 'react-router';
import { AppShell } from '@/components/layouts/app-shell';
import { GrupoMenu } from '@/components/layouts/grupo-menu';
import { UsuarioLogado } from '@/features/autenticacao/components/usuario-logado';
import { ProvedorAcertosDasApostas } from '@/features/apostas/components/provedor-acertos-apostas';
import { IndicadoresFavoritos } from '@/features/favoritos/components/indicadores-favoritos';
import { MenuJogos } from '@/features/jogos/components/menu-jogos';
import { BotaoApostar } from '../botao-apostar';
import { MenuConfiguracoes } from '../menu-configuracoes';
import { MenuConta } from '../menu-conta';
import { MenuPrincipal } from '../menu-principal';

const MenuLateral = () => (
  <div className="flex gap-4 lg:flex-col">
    <GrupoMenu titulo="Principal" chave="principal">
      <MenuPrincipal />
    </GrupoMenu>
    <GrupoMenu titulo="Jogos" chave="jogos">
      <MenuJogos indicadores={(codigo) => <IndicadoresFavoritos jogo={codigo} />} />
    </GrupoMenu>
    <GrupoMenu titulo="Minha Conta" chave="conta">
      <MenuConta />
    </GrupoMenu>
    <GrupoMenu titulo="Configurações" chave="configuracoes">
      <MenuConfiguracoes />
    </GrupoMenu>
  </div>
);

const Raiz = () => (
  <ProvedorAcertosDasApostas>
    <AppShell menu={<MenuLateral />} acao={<BotaoApostar />} rodape={<UsuarioLogado />}>
      <Outlet />
    </AppShell>
  </ProvedorAcertosDasApostas>
);

export default Raiz;

import { isCodigoJogo, obterRegraJogo } from '@mega/domain';
import { Outlet, useParams } from 'react-router';
import { AppLayout } from '@/components/layouts/app-layout';
import { paths } from '@/config/paths';
import { PainelIngestao } from '@/features/ingestao/components/painel-ingestao';
import type { ContextoJogo } from './contexto-jogo';
import NaoEncontrado from './nao-encontrado';

const RaizJogo = () => {
  const { jogo = '' } = useParams();
  if (!isCodigoJogo(jogo)) return <NaoEncontrado />;

  const regra = obterRegraJogo(jogo);
  const contexto: ContextoJogo = { regra };

  return (
    <AppLayout
      titulo={regra.nome}
      navegacao={[
        { rotulo: 'Histórico', destino: paths.historico(jogo) },
        { rotulo: 'Buscar dezenas', destino: paths.busca(jogo) },
      ]}
      lateral={<PainelIngestao jogo={jogo} />}
    >
      <Outlet context={contexto} />
    </AppLayout>
  );
};

export default RaizJogo;

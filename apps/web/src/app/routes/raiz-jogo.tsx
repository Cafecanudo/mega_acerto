import { isCodigoJogo, obterApresentacaoJogo, obterRegraJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';
import { Outlet, useParams } from 'react-router';
import { BarraIngestao } from '@/features/ingestao/components/barra-ingestao';
import { estiloCorJogo } from '@/lib/cor-jogo';
import type { ContextoJogo } from './contexto-jogo';
import { JogoEmBreve } from './jogo-em-breve';
import NaoEncontrado from './nao-encontrado';

const RaizJogo = () => {
  const { jogo = '' } = useParams();
  const apresentacao = obterApresentacaoJogo(jogo);
  if (!apresentacao) return <NaoEncontrado />;

  const disponivel = apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(jogo);
  const contexto: ContextoJogo | undefined = disponivel
    ? { regra: obterRegraJogo(jogo), apresentacao }
    : undefined;

  return (
    <div style={estiloCorJogo(apresentacao)} className="flex flex-col lg:h-full">
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 sm:px-5 lg:min-h-0 lg:flex-1">
        <header className="flex shrink-0 items-center gap-2">
          <IconClover
            aria-hidden
            size="1.5rem"
            stroke={1.75}
            color={apresentacao.cor}
            className="dark:brightness-[1.8] dark:saturate-150"
          />
          <h1 className="text-lg font-semibold tracking-tight">{apresentacao.nome}</h1>
        </header>
        {contexto ? <Outlet context={contexto} /> : <JogoEmBreve apresentacao={apresentacao} />}
      </div>
      {contexto && <BarraIngestao jogo={contexto.regra.codigo} />}
    </div>
  );
};

export default RaizJogo;

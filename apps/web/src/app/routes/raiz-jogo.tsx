import { isCodigoJogo, obterApresentacaoJogo, obterRegraJogo } from '@mega/domain';
import { IconClover } from '@tabler/icons-react';
import { Outlet, useParams } from 'react-router';
import { PainelIngestao } from '@/features/ingestao/components/painel-ingestao';
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
    <div style={estiloCorJogo(apresentacao)} className="mx-auto flex max-w-[110rem] flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconClover
            aria-hidden
            size={34}
            stroke={1.75}
            color={apresentacao.cor}
            className="dark:brightness-[1.8] dark:saturate-150"
          />
          <h1 className="text-2xl font-semibold tracking-tight">{apresentacao.nome}</h1>
        </div>
        {contexto && <PainelIngestao jogo={contexto.regra.codigo} />}
      </header>
      {contexto ? <Outlet context={contexto} /> : <JogoEmBreve apresentacao={apresentacao} />}
    </div>
  );
};

export default RaizJogo;

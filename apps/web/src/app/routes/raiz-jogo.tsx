import { isCodigoJogo, obterApresentacaoJogo, obterRegraJogo } from '@mega/domain';
import { IconChartHistogram, IconClover, IconListNumbers } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { NavLink, Outlet, useParams } from 'react-router';
import { paths } from '@/config/paths';
import { BarraIngestao } from '@/features/ingestao/components/barra-ingestao';
import { estiloCorJogo } from '@/lib/cor-jogo';
import type { ContextoJogo } from './contexto-jogo';
import { JogoEmBreve } from './jogo-em-breve';
import NaoEncontrado from './nao-encontrado';

const classeAba = ({ isActive }: { readonly isActive: boolean }) =>
  `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-jogo text-jogo-texto'
      : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

const Aba = ({
  destino,
  fim,
  icone,
  children,
}: {
  readonly destino: string;
  readonly fim?: boolean;
  readonly icone: ReactNode;
  readonly children: ReactNode;
}) => (
  <NavLink to={destino} end={fim} className={classeAba}>
    {icone}
    {children}
  </NavLink>
);

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
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconClover
              aria-hidden
              size="1.5rem"
              stroke={1.75}
              color={apresentacao.cor}
              className="dark:brightness-[1.8] dark:saturate-150"
            />
            <h1 className="text-lg font-semibold tracking-tight">{apresentacao.nome}</h1>
          </div>
          {contexto && (
            <nav className="flex gap-1">
              <Aba
                destino={paths.jogo(jogo)}
                fim
                icone={<IconListNumbers aria-hidden size="1rem" />}
              >
                Histórico
              </Aba>
              <Aba
                destino={paths.analises(jogo)}
                icone={<IconChartHistogram aria-hidden size="1rem" />}
              >
                Análises
              </Aba>
            </nav>
          )}
        </header>
        {contexto ? <Outlet context={contexto} /> : <JogoEmBreve apresentacao={apresentacao} />}
      </div>
      {contexto && <BarraIngestao jogo={contexto.regra.codigo} />}
    </div>
  );
};

export default RaizJogo;

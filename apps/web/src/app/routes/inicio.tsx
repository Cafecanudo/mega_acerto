import {
  apresentacoesJogo,
  isCodigoJogo,
  obterRegraJogo,
  type ApresentacaoJogo,
  type RegraJogo,
} from '@mega/domain';
import { IconArrowRight, IconClover, IconHome, IconTicket } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { paths } from '@/config/paths';
import { AnalisesRecentes } from '@/features/analises/components/analises-recentes';
import { ApostasProximoConcurso } from '@/features/apostas/components/apostas-proximo-concurso';
import { BalancoApostasCartao } from '@/features/apostas/components/balanco-apostas';
import { ResumoAConferir } from '@/features/apostas/components/resumo-a-conferir';
import { ultimoConcursoQuery } from '@/features/concursos/api/consultas';
import { DestaqueUltimoConcurso } from '@/features/concursos/components/destaque-ultimo-concurso';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarData } from '@/lib/formatadores';
import { useAbrirApostar } from '../apostar-contexto';

const UM_DIA_MS = 86_400_000;

const hojeIso = (): string => {
  const agora = new Date();
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const descreverPrazo = (dataProximo: string): string => {
  const dias = Math.round((Date.parse(dataProximo) - Date.parse(hojeIso())) / UM_DIA_MS);
  if (dias < 0) return 'aguardando resultado';
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  return `em ${String(dias)} dias`;
};

const ProximoConcurso = ({ regra }: { readonly regra: RegraJogo }) => {
  const { data: ultimo } = useQuery(ultimoConcursoQuery(regra.codigo));
  const abrirApostar = useAbrirApostar();
  const concurso = ultimo ? ultimo.numero + 1 : null;
  const prazo = ultimo?.dataProximo ? descreverPrazo(ultimo.dataProximo) : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Minhas apostas
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {concurso === null ? 'Próximo concurso' : `Concurso ${String(concurso)}`}
            {ultimo?.dataProximo && ` · ${formatarData(ultimo.dataProximo)}`}
            {prazo && (
              <span
                className={`ml-2 inline-block rounded-full px-2 py-0.5 whitespace-nowrap text-xs font-semibold ${
                  prazo === 'aguardando resultado'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {prazo}
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            abrirApostar({ jogo: regra.codigo, dezenas: [] });
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-jogo px-3 py-1.5 text-sm font-semibold text-jogo-texto transition hover:brightness-110"
        >
          <IconTicket aria-hidden size="1rem" stroke={1.75} />
          Apostar
        </button>
      </div>
      <ApostasProximoConcurso regra={regra} concurso={concurso} />
    </div>
  );
};

const PainelJogo = ({
  apresentacao,
  regra,
}: {
  readonly apresentacao: ApresentacaoJogo;
  readonly regra: RegraJogo;
}) => (
  <section style={estiloCorJogo(apresentacao)} className="flex flex-col gap-3">
    <header className="flex items-center gap-2">
      <IconClover
        aria-hidden
        size="1.375rem"
        stroke={1.75}
        color={apresentacao.cor}
        className="dark:brightness-[1.8] dark:saturate-150"
      />
      <h2 className="text-base font-semibold">{apresentacao.nome}</h2>
      <Link
        to={paths.jogo(apresentacao.codigo)}
        className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-jogo hover:underline"
      >
        Histórico
        <IconArrowRight aria-hidden size="1rem" />
      </Link>
    </header>
    <DestaqueUltimoConcurso regra={regra} />
    <ProximoConcurso regra={regra} />
  </section>
);

const jogosDisponiveis = apresentacoesJogo.flatMap((apresentacao) =>
  apresentacao.disponibilidade === 'disponivel' && isCodigoJogo(apresentacao.codigo)
    ? [{ apresentacao, regra: obterRegraJogo(apresentacao.codigo) }]
    : [],
);

const Inicio = () => (
  <div className="flex flex-col gap-5 px-4 pt-4 pb-6 sm:px-5 lg:h-full lg:overflow-y-auto">
    <header className="flex items-center gap-2">
      <IconHome aria-hidden size="1.5rem" stroke={1.75} className="text-emerald-600" />
      <h1 className="text-lg font-semibold tracking-tight">Início</h1>
    </header>
    {jogosDisponiveis.map(({ apresentacao, regra }) => (
      <PainelJogo key={apresentacao.codigo} apresentacao={apresentacao} regra={regra} />
    ))}
    <div className="grid gap-5 xl:grid-cols-2">
      <ResumoAConferir />
      <AnalisesRecentes />
    </div>
    <BalancoApostasCartao />
  </div>
);

export default Inicio;

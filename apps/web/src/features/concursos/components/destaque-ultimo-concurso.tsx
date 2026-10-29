import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Carregando, Falha } from '@/components/ui/estado';
import { paths } from '@/config/paths';
import {
  formatarData,
  formatarInteiro,
  formatarMoeda,
  formatarMoedaCompacta,
} from '@/lib/formatadores';
import { ultimoConcursoQuery } from '../api/consultas';
import type { DetalheConcurso } from '../types';
import { LinhaDezenas } from './linha-dezenas';

interface DestaqueUltimoConcursoProps {
  readonly regra: RegraJogo;
}

const Rotulo = ({ children }: { readonly children: ReactNode }) => (
  <span className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
    {children}
  </span>
);

const ResumoPremio = ({ concurso }: { readonly concurso: DetalheConcurso }) => {
  const principal = concurso.premiacoes.find((premiacao) => premiacao.faixa === 1);

  if (concurso.acumulado || !principal) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
        Acumulou
      </span>
    );
  }

  return (
    <span className="text-sm text-slate-600 dark:text-slate-300">
      <strong className="font-semibold text-slate-900 dark:text-slate-100">
        {formatarInteiro(principal.ganhadores)}{' '}
        {principal.ganhadores === 1 ? 'ganhador' : 'ganhadores'}
      </strong>{' '}
      · {formatarMoeda(principal.valorPremio)} cada
    </span>
  );
};

const ProximoConcurso = ({ concurso }: { readonly concurso: DetalheConcurso }) => (
  <div className="flex flex-col gap-1 border-t border-slate-200 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-slate-800">
    <Rotulo>Próximo concurso · {formatarData(concurso.dataProximo)}</Rotulo>
    <span className="text-3xl font-semibold tracking-tight text-jogo tabular-nums">
      {formatarMoedaCompacta(concurso.valorEstimadoProximo)}
    </span>
    <span className="text-sm text-slate-500 dark:text-slate-400">prêmio estimado</span>
  </div>
);

export const DestaqueUltimoConcurso = ({ regra }: DestaqueUltimoConcursoProps) => {
  const consulta = useQuery(ultimoConcursoQuery(regra.codigo));

  if (consulta.isPending) return <Carregando mensagem="Carregando último sorteio…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const concurso = consulta.data;
  const [sorteioPrincipal] = concurso.sorteios;

  return (
    <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Rotulo>Último sorteio</Rotulo>
          <Link
            to={paths.concurso(regra.codigo, concurso.numero)}
            className="text-sm font-semibold hover:underline"
          >
            Concurso {concurso.numero} · {formatarData(concurso.dataApuracao)}
          </Link>
        </div>
        {sorteioPrincipal && (
          <LinhaDezenas regra={regra} dezenas={sorteioPrincipal.dezenas} tamanho="xl" />
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ResumoPremio concurso={concurso} />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Arrecadação {formatarMoedaCompacta(concurso.valorArrecadado)}
          </span>
        </div>
      </div>
      <ProximoConcurso concurso={concurso} />
    </section>
  );
};

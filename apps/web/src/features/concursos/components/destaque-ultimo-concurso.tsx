import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { paths } from '@/config/paths';
import { formatarData, formatarInteiro, formatarMoedaCompacta } from '@/lib/formatadores';
import { ultimoConcursoQuery } from '../api/consultas';
import type { DetalheConcurso } from '../types';
import { LinhaDezenas } from './linha-dezenas';

interface DestaqueUltimoConcursoProps {
  readonly regra: RegraJogo;
}

const Rotulo = ({ children }: { readonly children: ReactNode }) => (
  <span className="text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
    {children}
  </span>
);

const Bloco = ({
  rotulo,
  children,
}: {
  readonly rotulo: ReactNode;
  readonly children: ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <Rotulo>{rotulo}</Rotulo>
    <span className="text-sm font-semibold tabular-nums">{children}</span>
  </div>
);

const Resultado = ({ concurso }: { readonly concurso: DetalheConcurso }) => {
  const principal = concurso.premiacoes.find((premiacao) => premiacao.faixa === 1);

  if (concurso.acumulado || !principal || principal.ganhadores === 0) {
    return (
      <Bloco rotulo="Resultado">
        <span className="text-amber-600 dark:text-amber-400">Acumulou</span>
      </Bloco>
    );
  }

  const ganhadores = `${formatarInteiro(principal.ganhadores)} ${principal.ganhadores === 1 ? 'ganhador' : 'ganhadores'}`;
  return (
    <Bloco rotulo="Resultado">
      {ganhadores} · {formatarMoedaCompacta(principal.valorPremio)}
    </Bloco>
  );
};

const Moldura = ({ children }: { readonly children: ReactNode }) => (
  <section className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    {children}
  </section>
);

export const DestaqueUltimoConcurso = ({ regra }: DestaqueUltimoConcursoProps) => {
  const consulta = useQuery(ultimoConcursoQuery(regra.codigo));

  if (consulta.isPending) {
    return (
      <Moldura>
        <span className="text-sm text-slate-500">Carregando último sorteio…</span>
      </Moldura>
    );
  }
  if (consulta.isError) {
    return (
      <Moldura>
        <span className="text-sm text-rose-600">{consulta.error.message}</span>
      </Moldura>
    );
  }

  const concurso = consulta.data;
  const [sorteioPrincipal] = concurso.sorteios;

  return (
    <Moldura>
      <div className="flex flex-col gap-0.5">
        <Rotulo>Último sorteio</Rotulo>
        <Link
          to={paths.concurso(regra.codigo, concurso.numero)}
          className="text-sm font-semibold hover:text-jogo"
        >
          {concurso.numero} · {formatarData(concurso.dataApuracao)}
        </Link>
      </div>
      {sorteioPrincipal && <LinhaDezenas regra={regra} dezenas={sorteioPrincipal.dezenas} />}
      <Resultado concurso={concurso} />
      <Bloco rotulo="Arrecadação">{formatarMoedaCompacta(concurso.valorArrecadado)}</Bloco>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <Rotulo>Próximo · {formatarData(concurso.dataProximo)}</Rotulo>
        <span className="text-base font-semibold text-jogo tabular-nums">
          {formatarMoedaCompacta(concurso.valorEstimadoProximo)}
        </span>
      </div>
    </Moldura>
  );
};

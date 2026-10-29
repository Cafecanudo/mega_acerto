import type { RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Cartao } from '@/components/ui/cartao';
import { Carregando, Falha } from '@/components/ui/estado';
import { paths } from '@/config/paths';
import { formatarData, formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { obterConcursoQuery } from '../api/consultas';
import type { DetalheConcurso as Detalhe } from '../types';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';

interface DetalheConcursoProps {
  readonly regra: RegraJogo;
  readonly numero: number;
  readonly aoNavegar?: (numero: number) => void;
}

const Informacao = ({
  rotulo,
  children,
}: {
  readonly rotulo: string;
  readonly children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {rotulo}
    </dt>
    <dd className="text-sm font-semibold tabular-nums">{children}</dd>
  </div>
);

const Navegacao = ({
  regra,
  concurso,
  aoNavegar,
}: {
  readonly regra: RegraJogo;
  readonly concurso: Detalhe;
  readonly aoNavegar: ((numero: number) => void) | undefined;
}) => {
  const classe =
    'rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';
  const destinos = [
    { numero: concurso.anterior, rotulo: `← ${String(concurso.anterior)}` },
    { numero: concurso.proximo, rotulo: `${String(concurso.proximo)} →` },
  ];

  return (
    <div className="flex gap-2">
      {destinos.map(({ numero, rotulo }) => {
        if (numero === null) return null;
        return aoNavegar ? (
          <button
            key={rotulo}
            type="button"
            className={classe}
            onClick={() => {
              aoNavegar(numero);
            }}
          >
            {rotulo}
          </button>
        ) : (
          <Link key={rotulo} className={classe} to={paths.concurso(regra.codigo, numero)}>
            {rotulo}
          </Link>
        );
      })}
    </div>
  );
};

const Sorteios = ({
  regra,
  concurso,
}: {
  readonly regra: RegraJogo;
  readonly concurso: Detalhe;
}) => (
  <div className="flex flex-col gap-6">
    {concurso.sorteios.map((sorteio, indice) => (
      <div key={indice} className="flex flex-col gap-4">
        {concurso.sorteios.length > 1 && (
          <p className="text-sm font-semibold">{indice + 1}º sorteio</p>
        )}
        <LinhaDezenas regra={regra} dezenas={sorteio.dezenas} tamanho="lg" />
        {sorteio.ordemExtracao && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Ordem de extração
            </p>
            <LinhaDezenas regra={regra} dezenas={sorteio.ordemExtracao} tamanho="sm" />
          </div>
        )}
      </div>
    ))}
  </div>
);

const TabelaPremiacao = ({ concurso }: { readonly concurso: Detalhe }) => (
  <table className="w-full text-left text-sm">
    <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
      <tr className="border-b border-slate-200 dark:border-slate-800">
        <th className="py-2">Faixa</th>
        <th className="py-2 text-right">Ganhadores</th>
        <th className="py-2 text-right">Prêmio individual</th>
      </tr>
    </thead>
    <tbody>
      {concurso.premiacoes.map((premiacao) => (
        <tr
          key={premiacao.faixa}
          className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
        >
          <td className="py-2.5">{premiacao.descricao}</td>
          <td className="py-2.5 text-right tabular-nums">
            {formatarInteiro(premiacao.ganhadores)}
          </td>
          <td className="py-2.5 text-right tabular-nums">{formatarMoeda(premiacao.valorPremio)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const DetalheConcurso = ({ regra, numero, aoNavegar }: DetalheConcursoProps) => {
  const consulta = useQuery(obterConcursoQuery(regra.codigo, numero));

  if (consulta.isPending) return <Carregando mensagem={`Carregando concurso ${numero}…`} />;
  if (consulta.isError) return <Falha erro={consulta.error} />;

  const concurso = consulta.data;

  return (
    <div className="flex flex-col gap-6">
      <Cartao
        titulo={`Concurso ${concurso.numero} · ${formatarData(concurso.dataApuracao)}`}
        acoes={<Navegacao regra={regra} concurso={concurso} aoNavegar={aoNavegar} />}
      >
        <div className="flex flex-col gap-6">
          <Sorteios regra={regra} concurso={concurso} />
          <dl className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 sm:grid-cols-4 dark:border-slate-800">
            <Informacao rotulo="Situação">
              {concurso.acumulado ? 'Acumulou' : 'Teve ganhador'}
            </Informacao>
            <Informacao rotulo="Arrecadação">{formatarMoeda(concurso.valorArrecadado)}</Informacao>
            <Informacao rotulo="Acumulado p/ próximo">
              {formatarMoeda(concurso.valorAcumuladoProximo)}
            </Informacao>
            <Informacao rotulo="Local">
              {[concurso.localSorteio, concurso.municipioUf].filter(Boolean).join(' · ') || '—'}
            </Informacao>
          </dl>
        </div>
      </Cartao>
      <Cartao titulo="Premiação">
        <TabelaPremiacao concurso={concurso} />
      </Cartao>
    </div>
  );
};

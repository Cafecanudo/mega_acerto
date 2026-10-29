import { formatarDezena, type RegraJogo } from '@mega/domain';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { BolaDezena } from '@/components/ui/bola-dezena';
import { Carregando, Falha } from '@/components/ui/estado';
import { formatarInteiro } from '@/lib/formatadores';
import { frequenciasQuery } from '../api/consultas';
import type { FrequenciaDezena } from '../types';

export interface SelecaoRanking {
  readonly jogo: string;
  readonly dezenas: readonly number[];
}

interface RankingDezenasProps {
  readonly regra: RegraJogo;
  readonly acoes: (selecao: SelecaoRanking) => ReactNode;
}

const JANELAS = [
  { rotulo: 'Todos os concursos', valor: null },
  { rotulo: 'Últimos 500', valor: 500 },
  { rotulo: 'Últimos 100', valor: 100 },
  { rotulo: 'Últimos 50', valor: 50 },
  { rotulo: 'Últimos 10', valor: 10 },
] as const;

const ATALHOS = [6, 10, 15] as const;

const celula = 'px-4 py-2 align-middle';
const cabecalho = 'sticky top-0 z-10 bg-white px-4 py-2 dark:bg-slate-900';

const BarraFrequencia = ({
  percentual,
  maximo,
}: {
  readonly percentual: number;
  readonly maximo: number;
}) => (
  <div className="flex items-center gap-2">
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-slate-600 dark:bg-slate-300"
        style={{ width: `${maximo === 0 ? 0 : (percentual / maximo) * 100}%` }}
      />
    </div>
    <span className="tabular-nums">{percentual.toFixed(2).replace('.', ',')}%</span>
  </div>
);

const LinhaRanking = ({
  regra,
  posicao,
  frequencia,
  maximo,
  marcada,
  bloqueada,
  aoAlternar,
}: {
  readonly regra: RegraJogo;
  readonly posicao: number;
  readonly frequencia: FrequenciaDezena;
  readonly maximo: number;
  readonly marcada: boolean;
  readonly bloqueada: boolean;
  readonly aoAlternar: () => void;
}) => (
  <tr
    onClick={bloqueada ? undefined : aoAlternar}
    className={`border-b border-slate-100 transition last:border-0 dark:border-slate-800/60 ${
      bloqueada ? 'opacity-50' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40'
    } ${marcada ? 'bg-slate-50 dark:bg-slate-800/40' : ''}`}
  >
    <td className={celula}>
      <input
        type="checkbox"
        checked={marcada}
        disabled={bloqueada}
        onChange={aoAlternar}
        onClick={(evento) => {
          evento.stopPropagation();
        }}
        aria-label={`Selecionar dezena ${formatarDezena(regra, frequencia.dezena)}`}
        className="size-4 accent-emerald-600"
      />
    </td>
    <td className={`${celula} font-mono text-slate-500 tabular-nums`}>{posicao}º</td>
    <td className={celula}>
      <BolaDezena rotulo={formatarDezena(regra, frequencia.dezena)} tamanho="sm" />
    </td>
    <td className={`${celula} font-semibold tabular-nums`}>{formatarInteiro(frequencia.vezes)}</td>
    <td className={celula}>
      <BarraFrequencia percentual={frequencia.percentual} maximo={maximo} />
    </td>
    <td className={`${celula} font-mono tabular-nums`}>{frequencia.ultimoConcurso ?? '—'}</td>
    <td className={`${celula} tabular-nums`}>{frequencia.atraso ?? '—'}</td>
  </tr>
);

export const RankingDezenas = ({ regra, acoes }: RankingDezenasProps) => {
  const [ultimos, setUltimos] = useState<number | null>(null);
  const [selecionadas, setSelecionadas] = useState<ReadonlySet<number>>(new Set());
  const consulta = useQuery(frequenciasQuery(regra.codigo, ultimos));
  const limite = regra.dezenasPorAposta.maximo;

  const alternar = (dezena: number) => {
    setSelecionadas((atuais) => {
      const proximas = new Set(atuais);
      if (!proximas.delete(dezena)) proximas.add(dezena);
      return proximas;
    });
  };

  const selecionarTopo = (quantidade: number) => {
    const dezenas = consulta.data?.dezenas.slice(0, quantidade).map((item) => item.dezena) ?? [];
    setSelecionadas(new Set(dezenas));
  };

  const dezenasOrdenadas = [...selecionadas].sort((a, b) => a - b);
  const maximoPercentual = consulta.data?.dezenas[0]?.percentual ?? 0;

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold">Dezenas mais sorteadas</h2>
          <select
            value={ultimos ?? ''}
            onChange={(evento) => {
              setUltimos(evento.target.value === '' ? null : Number(evento.target.value));
            }}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {JANELAS.map((janela) => (
              <option key={janela.rotulo} value={janela.valor ?? ''}>
                {janela.rotulo}
              </option>
            ))}
          </select>
          {consulta.data && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatarInteiro(consulta.data.concursos)} concursos analisados
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ATALHOS.map((quantidade) => (
            <button
              key={quantidade}
              type="button"
              onClick={() => {
                selecionarTopo(quantidade);
              }}
              className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Top {quantidade}
            </button>
          ))}
          <button
            type="button"
            disabled={selecionadas.size === 0}
            onClick={() => {
              setSelecionadas(new Set());
            }}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:text-rose-600 disabled:opacity-40"
          >
            Limpar
          </button>
        </div>
      </div>

      <div
        className={`lg:min-h-0 lg:flex-1 lg:overflow-auto ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}
      >
        {consulta.isPending && (
          <div className="p-4">
            <Carregando mensagem="Contando dezenas…" />
          </div>
        )}
        {consulta.isError && (
          <div className="p-4">
            <Falha erro={consulta.error} />
          </div>
        )}
        {consulta.data && (
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className={cabecalho} aria-label="Seleção" />
                  <th className={cabecalho}>#</th>
                  <th className={cabecalho}>Dezena</th>
                  <th className={cabecalho}>Vezes</th>
                  <th className={cabecalho}>% dos concursos</th>
                  <th className={cabecalho}>Último concurso</th>
                  <th className={cabecalho}>Atraso</th>
                </tr>
              </thead>
              <tbody>
                {consulta.data.dezenas.map((frequencia, indice) => {
                  const marcada = selecionadas.has(frequencia.dezena);
                  return (
                    <LinhaRanking
                      key={frequencia.dezena}
                      regra={regra}
                      posicao={indice + 1}
                      frequencia={frequencia}
                      maximo={maximoPercentual}
                      marcada={marcada}
                      bloqueada={!marcada && selecionadas.size >= limite}
                      aoAlternar={() => {
                        alternar(frequencia.dezena);
                      }}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
            {selecionadas.size}/{limite}
          </span>
          {dezenasOrdenadas.length === 0 ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Marque dezenas na lista ou use os atalhos.
            </span>
          ) : (
            dezenasOrdenadas.map((dezena) => (
              <BolaDezena key={dezena} rotulo={formatarDezena(regra, dezena)} tamanho="sm" />
            ))
          )}
        </div>
        {acoes({ jogo: regra.codigo, dezenas: dezenasOrdenadas })}
      </div>
    </section>
  );
};

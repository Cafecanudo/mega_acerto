import { IconRefresh } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { formatarDataHora, formatarInteiro } from '@/lib/formatadores';
import { chavesConsulta } from '@/lib/react-query';
import { statusIngestaoQuery, useSincronizar } from '../api/ingestao';
import type { StatusIngestao } from '../types';

interface BarraIngestaoProps {
  readonly jogo: string;
}

const percentual = (status: StatusIngestao): number => {
  const execucao = status.ultimaExecucao;
  if (!execucao || execucao.totalPrevisto === 0) return 0;
  return Math.min(100, Math.round((execucao.importados / execucao.totalPrevisto) * 100));
};

const descreverIntegridade = (status: StatusIngestao): string => {
  const { numerosAusentes, concursosComDezenasInvalidas } = status.integridade;
  if (numerosAusentes.length === 0 && concursosComDezenasInvalidas.length === 0) {
    return 'histórico íntegro';
  }
  return `${formatarInteiro(numerosAusentes.length)}+ ausentes · ${formatarInteiro(concursosComDezenasInvalidas.length)} inválidos`;
};

const useInvalidarAoConcluir = (emAndamento: boolean | undefined) => {
  const queryClient = useQueryClient();
  const anterior = useRef(emAndamento);

  useEffect(() => {
    if (anterior.current && emAndamento === false) {
      void queryClient.invalidateQueries({ queryKey: chavesConsulta.jogos() });
    }
    anterior.current = emAndamento;
  }, [emAndamento, queryClient]);
};

const Indicador = ({ status }: { readonly status: StatusIngestao }) => {
  const falhou = status.ultimaExecucao?.status === 'falhou';
  const cor = status.emAndamento
    ? 'animate-pulse bg-sky-500'
    : falhou
      ? 'bg-rose-500'
      : 'bg-emerald-500';
  const rotulo = status.emAndamento ? 'Sincronizando' : falhou ? 'Falhou' : 'Sincronizado';

  return (
    <span className="flex shrink-0 items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
      <span className={`size-1.5 rounded-full ${cor}`} />
      {rotulo}
    </span>
  );
};

const Detalhe = ({ status }: { readonly status: StatusIngestao }) => {
  const execucao = status.ultimaExecucao;

  if (status.emAndamento && execucao) {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="h-1 max-w-64 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <span
            className="block h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${percentual(status)}%` }}
          />
        </span>
        <span className="tabular-nums">
          {formatarInteiro(execucao.importados)}/{formatarInteiro(execucao.totalPrevisto)}
        </span>
      </span>
    );
  }

  if (execucao?.status === 'falhou' && execucao.erro) {
    return (
      <span
        className="min-w-0 flex-1 truncate text-rose-600 dark:text-rose-400"
        title={execucao.erro}
      >
        {execucao.erro}
      </span>
    );
  }

  return (
    <span className="min-w-0 flex-1 truncate">
      {formatarInteiro(status.integridade.totalConcursos)} concursos · último{' '}
      {formatarInteiro(status.integridade.ultimoConcurso)} · {descreverIntegridade(status)}
      {execucao?.finalizadoEm && ` · ${formatarDataHora(execucao.finalizadoEm)}`}
    </span>
  );
};

export const BarraIngestao = ({ jogo }: BarraIngestaoProps) => {
  const consulta = useQuery(statusIngestaoQuery(jogo));
  const sincronizar = useSincronizar(jogo);
  useInvalidarAoConcluir(consulta.data?.emAndamento);

  if (!consulta.data) return null;
  const status = consulta.data;

  return (
    <footer className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-white/80 px-4 py-1.5 text-xs text-slate-500 backdrop-blur sm:px-5 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
      <Indicador status={status} />
      <Detalhe status={status} />
      <button
        type="button"
        disabled={status.emAndamento || sincronizar.isPending}
        onClick={() => {
          sincronizar.mutate();
        }}
        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <IconRefresh aria-hidden size={14} />
        Sincronizar
      </button>
    </footer>
  );
};

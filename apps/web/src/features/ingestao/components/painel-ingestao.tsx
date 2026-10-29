import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { formatarDataHora, formatarInteiro } from '@/lib/formatadores';
import { chavesConsulta } from '@/lib/react-query';
import { statusIngestaoQuery, useSincronizar } from '../api/ingestao';
import type { StatusIngestao } from '../types';

interface PainelIngestaoProps {
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
    return 'Histórico íntegro';
  }
  return `${formatarInteiro(numerosAusentes.length)}+ ausentes · ${formatarInteiro(concursosComDezenasInvalidas.length)} inválidos`;
};

const useInvalidarConcursosAoConcluir = (jogo: string, emAndamento: boolean | undefined) => {
  const queryClient = useQueryClient();
  const anterior = useRef(emAndamento);

  useEffect(() => {
    if (anterior.current && emAndamento === false) {
      void queryClient.invalidateQueries({ queryKey: chavesConsulta.concursos(jogo) });
    }
    anterior.current = emAndamento;
  }, [emAndamento, jogo, queryClient]);
};

export const PainelIngestao = ({ jogo }: PainelIngestaoProps) => {
  const consulta = useQuery(statusIngestaoQuery(jogo));
  const sincronizar = useSincronizar(jogo);
  useInvalidarConcursosAoConcluir(jogo, consulta.data?.emAndamento);

  if (!consulta.data) return null;

  const status = consulta.data;
  const execucao = status.ultimaExecucao;
  const falhou = execucao?.status === 'falhou';

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${
            status.emAndamento
              ? 'animate-pulse bg-sky-500'
              : falhou
                ? 'bg-rose-500'
                : 'bg-emerald-500'
          }`}
        />
        <span className="font-medium">
          {status.emAndamento
            ? 'Sincronizando com a Caixa'
            : falhou
              ? 'Última sincronização falhou'
              : 'Sincronizado'}
        </span>
      </div>

      {status.emAndamento && execucao ? (
        <div className="flex min-w-48 flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${percentual(status)}%` }}
            />
          </div>
          <span className="text-slate-500 tabular-nums dark:text-slate-400">
            {formatarInteiro(execucao.importados)}/{formatarInteiro(execucao.totalPrevisto)}
          </span>
        </div>
      ) : (
        <span className="text-slate-500 dark:text-slate-400">
          {formatarInteiro(status.integridade.totalConcursos)} concursos · último{' '}
          {formatarInteiro(status.integridade.ultimoConcurso)} · {descreverIntegridade(status)}
          {execucao?.finalizadoEm && ` · ${formatarDataHora(execucao.finalizadoEm)}`}
        </span>
      )}

      {falhou && execucao.erro && (
        <span
          className="w-full truncate text-xs text-rose-600 dark:text-rose-400"
          title={execucao.erro}
        >
          {execucao.erro}
        </span>
      )}

      <button
        type="button"
        disabled={status.emAndamento || sincronizar.isPending}
        onClick={() => {
          sincronizar.mutate();
        }}
        className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Sincronizar agora
      </button>
    </div>
  );
};

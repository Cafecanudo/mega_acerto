import type { RegraJogo } from '@mega/domain';
import { IconTrash } from '@tabler/icons-react';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import type { EstadoBusca } from '../hooks/use-busca-ate-ganhar';
import { formatarTempoBusca } from '../busca';
import type { ReferenciasSimulacao } from '../types';
import { conferirDezenas } from '../utils';
import { LinhaSorteio } from './linha-sorteio';

interface PainelBuscaProps {
  readonly regra: RegraJogo;
  readonly referencias: ReferenciasSimulacao;
  readonly busca: EstadoBusca;
  readonly custoPorTentativa: number | null;
  readonly aoLimpar: () => void;
}

const Indicador = ({ rotulo, valor }: { readonly rotulo: string; readonly valor: string }) => (
  <span className="flex flex-col">
    <span className="text-xs text-slate-500 dark:text-slate-400">{rotulo}</span>
    <strong className="text-sm font-semibold tabular-nums">{valor}</strong>
  </span>
);

const ritmo = ({ tentativas, decorridoMs }: EstadoBusca): string =>
  decorridoMs < 200 ? '—' : `${formatarInteiro(Math.round((tentativas * 1000) / decorridoMs))}/s`;

export const PainelBusca = ({
  regra,
  referencias,
  busca,
  custoPorTentativa,
  aoLimpar,
}: PainelBuscaProps) => (
  <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-violet-50/60 px-4 py-3 dark:border-slate-800 dark:bg-violet-500/5">
    <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
      <Indicador rotulo="Tentativas" valor={formatarInteiro(busca.tentativas)} />
      <Indicador rotulo="Tempo" valor={formatarTempoBusca(busca.decorridoMs)} />
      <Indicador rotulo="Ritmo" valor={ritmo(busca)} />
      <Indicador
        rotulo="Você teria gastado"
        valor={formatarMoeda(
          custoPorTentativa === null ? null : custoPorTentativa * busca.tentativas,
        )}
      />
      <Indicador rotulo="Matches" valor={formatarInteiro(busca.matches.length)} />
      {busca.buscando && (
        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
          Sorteando até ganhar…
        </span>
      )}
      <button
        type="button"
        disabled={busca.buscando || (busca.tentativas === 0 && busca.matches.length === 0)}
        onClick={aoLimpar}
        className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
      >
        <IconTrash aria-hidden size="0.875rem" />
        Limpar busca
      </button>
    </div>
    {busca.matches.length > 0 && (
      <ol className="flex max-h-40 flex-col gap-1.5 overflow-auto">
        {busca.matches.map((match) => (
          <li
            key={match.tentativa}
            className="flex items-center gap-3 rounded-lg border border-violet-200 bg-white px-3 py-1.5 dark:border-violet-500/20 dark:bg-slate-900"
          >
            <span className="w-28 shrink-0 text-right font-mono text-xs text-slate-500 tabular-nums">
              tentativa {formatarInteiro(match.tentativa)}
            </span>
            <div className="flex flex-col gap-1">
              {match.sorteio.map((dezenas, indice) => (
                <LinhaSorteio
                  key={indice}
                  regra={regra}
                  resultado={conferirDezenas(regra, dezenas, referencias)}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    )}
  </div>
);

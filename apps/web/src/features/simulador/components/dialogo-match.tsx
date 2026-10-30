import type { RegraJogo } from '@mega/domain';
import { IconConfetti, IconPlayerPlayFilled, IconPlayerStopFilled } from '@tabler/icons-react';
import { Dialogo } from '@/components/ui/dialogo';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import type { MatchEncontrado } from '../hooks/use-busca-ate-ganhar';
import { formatarTempoBusca } from '../busca';
import type { ReferenciasSimulacao } from '../types';
import { conferirDezenas } from '../utils';
import { LinhaSorteio } from './linha-sorteio';

interface DialogoMatchProps {
  readonly regra: RegraJogo;
  readonly referencias: ReferenciasSimulacao;
  readonly match: MatchEncontrado | null;
  readonly custoPorTentativa: number | null;
  readonly aoContinuar: () => void;
  readonly aoParar: () => void;
}

export const DialogoMatch = ({
  regra,
  referencias,
  match,
  custoPorTentativa,
  aoContinuar,
  aoParar,
}: DialogoMatchProps) => (
  <Dialogo aberto={match !== null} titulo="Foi sorteado!" tamanho="medio" aoFechar={aoParar}>
    {match && (
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <IconConfetti aria-hidden size="3rem" stroke={1.5} className="text-violet-500" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Deu match na tentativa{' '}
          <strong className="text-slate-900 dark:text-slate-100">
            {formatarInteiro(match.tentativa)}
          </strong>
          , depois de {formatarTempoBusca(match.decorridoMs)}. Jogando essas apostas e favoritos em
          todos os sorteios, você teria gastado{' '}
          <strong className="text-slate-900 dark:text-slate-100">
            {formatarMoeda(custoPorTentativa === null ? null : custoPorTentativa * match.tentativa)}
          </strong>
          .
        </p>
        <div className="flex flex-col gap-2">
          {match.sorteio.map((dezenas, indice) => (
            <LinhaSorteio
              key={indice}
              regra={regra}
              resultado={conferirDezenas(regra, dezenas, referencias)}
            />
          ))}
        </div>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={aoContinuar}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-jogo px-4 py-2 text-sm font-semibold text-jogo-texto transition hover:brightness-110"
          >
            <IconPlayerPlayFilled aria-hidden size="1rem" />
            Continuar
          </button>
          <button
            type="button"
            onClick={aoParar}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <IconPlayerStopFilled aria-hidden size="1rem" />
            Parar
          </button>
        </div>
      </div>
    )}
  </Dialogo>
);

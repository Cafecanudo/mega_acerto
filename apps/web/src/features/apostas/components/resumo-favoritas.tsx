import { IconTarget, IconTrophy } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { formatarInteiro } from '@/lib/formatadores';
import { resumirFavoritas } from '../resumir-favoritas';
import type { Aposta } from '../types';

interface ResumoFavoritasProps {
  readonly apostas: readonly Aposta[];
}

const Balao = ({
  icone,
  rotulo,
  valor,
  detalhe,
}: {
  readonly icone: ReactNode;
  readonly rotulo: string;
  readonly valor: ReactNode;
  readonly detalhe: string;
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
      {icone}
    </span>
    <div className="flex min-w-0 flex-col">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rotulo}</span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">{valor}</span>
      <span className="truncate text-xs text-slate-500 dark:text-slate-400">{detalhe}</span>
    </div>
  </div>
);

export const ResumoFavoritas = ({ apostas }: ResumoFavoritasProps) => {
  const { total, comAcertos, maiorAcerto, melhor } = resumirFavoritas(apostas);
  if (!melhor) return null;

  return (
    <div className="grid shrink-0 gap-3 sm:grid-cols-2">
      <Balao
        icone={<IconTarget aria-hidden size="1.375rem" />}
        rotulo="Favoritas com acertos"
        valor={
          <>
            {formatarInteiro(comAcertos)}
            <span className="text-base font-medium text-slate-400">
              {' '}
              de {formatarInteiro(total)}
            </span>
          </>
        }
        detalhe="Com 1 ou mais números no último concurso"
      />
      <Balao
        icone={<IconTrophy aria-hidden size="1.375rem" />}
        rotulo="Maior número de acertos"
        valor={formatarInteiro(maiorAcerto)}
        detalhe={
          maiorAcerto > 0
            ? `${melhor.nome ?? `Aposta #${melhor.id}`} · concurso ${melhor.conferencia.ultimoConcurso?.numero ?? '—'}`
            : 'Nenhuma favorita acertou no último concurso'
        }
      />
    </div>
  );
};

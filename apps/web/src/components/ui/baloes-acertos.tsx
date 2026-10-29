import { IconTarget, IconTrophy } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { formatarInteiro } from '@/lib/formatadores';
import type { ResumoAcertos } from '@/types/conferencia';

interface BaloesAcertosProps {
  readonly resumo: ResumoAcertos;
  readonly rotuloComAcertos: string;
  readonly grupo: string;
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

export const BaloesAcertos = ({ resumo, rotuloComAcertos, grupo }: BaloesAcertosProps) => {
  if (resumo.total === 0) return null;
  const { melhor } = resumo;

  return (
    <div className="grid shrink-0 gap-3 sm:grid-cols-2">
      <Balao
        icone={<IconTarget aria-hidden size="1.375rem" />}
        rotulo={rotuloComAcertos}
        valor={
          <>
            {formatarInteiro(resumo.comAcertos)}
            <span className="text-base font-medium text-slate-400">
              {' '}
              de {formatarInteiro(resumo.total)}
            </span>
          </>
        }
        detalhe="Com 1 ou mais números no concurso conferido"
      />
      <Balao
        icone={<IconTrophy aria-hidden size="1.375rem" />}
        rotulo="Maior número de acertos"
        valor={formatarInteiro(resumo.maiorAcerto)}
        detalhe={
          melhor
            ? `${melhor.nome ?? `#${melhor.id}`} · concurso ${melhor.concurso}`
            : `Nenhuma das ${grupo} teve acertos`
        }
      />
    </div>
  );
};

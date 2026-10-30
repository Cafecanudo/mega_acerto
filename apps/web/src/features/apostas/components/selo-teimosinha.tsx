import { IconRepeat } from '@tabler/icons-react';
import type { TeimosinhaAposta } from '../types';

export const SeloTeimosinha = ({ teimosinha }: { readonly teimosinha: TeimosinhaAposta | null }) =>
  teimosinha && (
    <span
      title={`Concurso ${teimosinha.posicao} de ${teimosinha.total} da Teimosinha`}
      className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 align-middle text-xs font-semibold text-violet-800 dark:bg-violet-500/15 dark:text-violet-300"
    >
      <IconRepeat aria-hidden size="0.75rem" stroke={2} />
      Teimosinha {teimosinha.posicao}/{teimosinha.total}
    </span>
  );

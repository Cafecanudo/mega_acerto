import { IconTarget, IconTrophy } from '@tabler/icons-react';
import type { ReactNode } from 'react';

const Item = ({ icone, children }: { readonly icone: ReactNode; readonly children: ReactNode }) => (
  <li className="flex items-start gap-1.5">
    <span className="mt-px inline-flex shrink-0 items-center rounded-full bg-amber-100 px-1 py-0.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
      {icone}
    </span>
    <span>{children}</span>
  </li>
);

export const LegendaIndicadores = () => (
  <div className="hidden flex-col gap-1.5 border-t border-slate-200 px-2.5 pt-3 text-[0.7rem] leading-snug text-slate-500 lg:flex dark:border-slate-800 dark:text-slate-400">
    <p className="font-semibold tracking-wider uppercase">Legenda</p>
    <ul className="flex flex-col gap-1">
      <Item icone={<IconTarget aria-hidden size="0.75rem" />}>
        Com acertos / total no concurso conferido
      </Item>
      <Item icone={<IconTrophy aria-hidden size="0.75rem" />}>
        Maior número de acertos de um único jogo
      </Item>
      <li className="flex items-start gap-1.5">
        <span className="mt-0.5 size-3 shrink-0 rounded-full bg-emerald-600 ring-2 ring-emerald-400/50" />
        <span>Dezena sorteada que você acertou em aposta</span>
      </li>
    </ul>
  </div>
);

import { CLASSE_SERIE, PREENCHIMENTO_SERIE } from '../estilos';
import type { SerieLinhaDoTempo } from '../types';

const PREENCHIMENTO_SUPERFICIE = 'fill-white dark:fill-slate-900';
const RAIO = 4.5;
const LADO = 9;

interface MarcadorProps {
  readonly serie: SerieLinhaDoTempo;
  readonly x: number;
  readonly y: number;
  readonly cheio: boolean;
}

export const Marcador = ({ serie, x, y, cheio }: MarcadorProps) => {
  const preenchimento = cheio ? PREENCHIMENTO_SERIE[serie] : PREENCHIMENTO_SUPERFICIE;
  const classe = `${CLASSE_SERIE[serie]} ${preenchimento}`;
  return serie === 'apostas' ? (
    <g>
      <circle cx={x} cy={y} r={RAIO + 2} className={PREENCHIMENTO_SUPERFICIE} />
      <circle cx={x} cy={y} r={RAIO} strokeWidth={2} className={classe} />
    </g>
  ) : (
    <g>
      <rect
        x={x - LADO / 2 - 2}
        y={y - LADO / 2 - 2}
        width={LADO + 4}
        height={LADO + 4}
        rx={2}
        className={PREENCHIMENTO_SUPERFICIE}
      />
      <rect
        x={x - LADO / 2}
        y={y - LADO / 2}
        width={LADO}
        height={LADO}
        rx={1.5}
        strokeWidth={2}
        className={classe}
      />
    </g>
  );
};

export const AmostraSerie = ({ serie }: { readonly serie: SerieLinhaDoTempo }) => (
  <svg aria-hidden width={26} height={12} className="shrink-0 overflow-visible">
    <line
      x1={0}
      x2={26}
      y1={6}
      y2={6}
      strokeWidth={2}
      strokeDasharray={serie === 'favoritos' ? '5 4' : undefined}
      className={CLASSE_SERIE[serie]}
    />
    <Marcador serie={serie} x={13} y={6} cheio />
  </svg>
);

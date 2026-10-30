import { formatarDezena, type RegraJogo } from '@mega/domain';
import type { CSSProperties } from 'react';

interface GloboSorteioProps {
  readonly regra: RegraJogo;
  readonly retiradas: ReadonlySet<number>;
  readonly girando: boolean;
}

const ANGULO_DOURADO = Math.PI * (3 - Math.sqrt(5));
const RAIO_UTIL = 40;

const classeBola = (quantidade: number): string => {
  if (quantidade <= 30) return 'size-6 text-[0.6rem]';
  if (quantidade <= 60) return 'size-5 text-[0.55rem]';
  return 'size-4 text-[0.45rem]';
};

const posicionar = (indice: number, quantidade: number): CSSProperties => {
  const raio = Math.sqrt((indice + 0.5) / quantidade) * RAIO_UTIL;
  const angulo = indice * ANGULO_DOURADO;
  return {
    left: `${String(50 + raio * Math.cos(angulo))}%`,
    top: `${String(50 + raio * Math.sin(angulo))}%`,
    '--dx': `${String(((indice * 37) % 9) - 4)}px`,
    '--dy': `${String(((indice * 53) % 7) - 3)}px`,
    '--duracao-agitar': `${String(0.35 + (indice % 5) * 0.08)}s`,
  } as CSSProperties;
};

export const GloboSorteio = ({ regra, retiradas, girando }: GloboSorteioProps) => {
  const { minimo, maximo } = regra.universo;
  const quantidade = maximo - minimo + 1;

  return (
    <div className="relative size-56 shrink-0 rounded-full border-4 border-slate-300 bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.9),rgb(226_232_240/0.6)_45%,rgb(148_163_184/0.35))] shadow-inner dark:border-slate-600 dark:bg-[radial-gradient(circle_at_35%_30%,rgb(71_85_105/0.7),rgb(30_41_59/0.8)_50%,rgb(2_6_23/0.9))]">
      <div
        aria-hidden
        className={`absolute inset-2 rounded-full border-2 border-dashed border-slate-400/40 motion-safe:animate-girar-globo ${girando ? '' : '[animation-play-state:paused]'}`}
      />
      {Array.from({ length: quantidade }, (_, indice) => {
        const dezena = minimo + indice;
        if (retiradas.has(dezena)) return null;
        return (
          <span
            key={dezena}
            style={posicionar(indice, quantidade)}
            className={`absolute -translate-1/2 ${girando ? '' : '[&>span]:[animation-play-state:paused]'}`}
          >
            <span
              className={`flex items-center justify-center rounded-full bg-jogo font-mono font-semibold text-jogo-texto shadow motion-safe:animate-agitar-bola ${classeBola(quantidade)}`}
            >
              {formatarDezena(regra, dezena)}
            </span>
          </span>
        );
      })}
    </div>
  );
};

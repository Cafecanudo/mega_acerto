import type { ResultadoAleatoriedade } from '@mega/analises';
import { formatarDezena, type RegraJogo } from '@mega/domain';
import { formatarDecimal } from '@/lib/formatadores';

interface GraficoFrequenciasProps {
  readonly regra: RegraJogo;
  readonly dezenas: ResultadoAleatoriedade['dezenas'];
  readonly esperado: number;
}

const LIMITE_DESVIO = 1.96;
const FOLGA_BASE = 0.9;

const percentual = (valor: number, base: number, topo: number): number =>
  ((valor - base) / (topo - base)) * 100;

export const GraficoFrequencias = ({ regra, dezenas, esperado }: GraficoFrequenciasProps) => {
  const frequencias = dezenas.map((item) => item.frequencia);
  const topo = Math.max(...frequencias, esperado);
  const base = Math.min(...frequencias, esperado) * FOLGA_BASE;
  const foraDaFaixa = dezenas.filter((item) => Math.abs(item.desvioPadronizado) > LIMITE_DESVIO);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-52">
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-slate-500 dark:border-slate-300"
          style={{ bottom: `${percentual(esperado, base, topo)}%` }}
        >
          <span className="absolute -top-5 right-0 rounded bg-white/80 px-1 text-[0.68rem] text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
            esperado {formatarDecimal(esperado, 1)}
          </span>
        </div>
        <div className="flex h-full items-end gap-px">
          {dezenas.map((item) => {
            const destaque = Math.abs(item.desvioPadronizado) > LIMITE_DESVIO;
            return (
              <div
                key={item.dezena}
                title={`${formatarDezena(regra, item.dezena)}: ${item.frequencia} (z = ${formatarDecimal(item.desvioPadronizado)})`}
                className={`flex-1 rounded-t-sm transition hover:opacity-80 ${destaque ? 'bg-amber-500' : 'bg-jogo/70'}`}
                style={{ height: `${percentual(item.frequencia, base, topo)}%` }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex gap-px font-mono text-[0.62rem] text-slate-400">
        {dezenas.map((item) => (
          <span key={item.dezena} className="flex-1 text-center">
            {item.dezena % 5 === 0 || item.dezena === regra.universo.minimo
              ? formatarDezena(regra, item.dezena)
              : ''}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Barras em âmbar estão fora de ±1,96 desvio-padrão do esperado ({foraDaFaixa.length} de{' '}
        {dezenas.length}). Sob uniformidade, cerca de 5% das dezenas caem fora dessa faixa por
        acaso.
      </p>
    </div>
  );
};

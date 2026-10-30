import type { Marcacao } from '../types';

interface BolaSorteadaProps {
  readonly rotulo: string;
  readonly marcacao: Marcacao | null;
  readonly tamanho?: 'sm' | 'lg';
  readonly className?: string;
}

const tamanhos = {
  sm: 'size-7 text-xs',
  lg: 'size-12 text-lg sm:size-14 sm:text-xl',
} as const;

const cores: Record<Marcacao | 'neutra', string> = {
  aposta: 'bg-emerald-600 text-white ring-2 ring-emerald-400/50',
  favorito: 'bg-blue-600 text-white ring-2 ring-blue-400/50',
  ambos:
    'bg-[linear-gradient(135deg,var(--color-emerald-600)_50%,var(--color-blue-600)_50%)] text-white ring-2 ring-sky-400/50',
  neutra: 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900',
};

const titulos: Record<Marcacao, string> = {
  aposta: 'Coincide com uma aposta',
  favorito: 'Coincide com um favorito',
  ambos: 'Coincide com uma aposta e um favorito',
};

export const BolaSorteada = ({
  rotulo,
  marcacao,
  tamanho = 'sm',
  className = '',
}: BolaSorteadaProps) => (
  <span
    title={marcacao ? titulos[marcacao] : undefined}
    className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold tabular-nums shadow-sm ${tamanhos[tamanho]} ${cores[marcacao ?? 'neutra']} ${className}`}
  >
    {rotulo}
  </span>
);

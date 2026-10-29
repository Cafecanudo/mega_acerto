interface BolaDezenaProps {
  readonly rotulo: string;
  readonly tamanho?: 'sm' | 'md' | 'lg';
  readonly destaque?: boolean;
}

const tamanhos = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-14 text-xl',
} as const;

export const BolaDezena = ({ rotulo, tamanho = 'md', destaque = true }: BolaDezenaProps) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold tabular-nums ${tamanhos[tamanho]} ${
      destaque
        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20 dark:bg-emerald-500 dark:text-emerald-950'
        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
    }`}
  >
    {rotulo}
  </span>
);

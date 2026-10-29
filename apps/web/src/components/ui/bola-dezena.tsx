interface BolaDezenaProps {
  readonly rotulo: string;
  readonly tamanho?: 'sm' | 'md' | 'lg' | 'xl';
  readonly destaque?: boolean;
}

const tamanhos = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-14 text-xl',
  xl: 'size-10 text-base sm:size-14 sm:text-xl 2xl:size-16 2xl:text-2xl',
} as const;

export const BolaDezena = ({ rotulo, tamanho = 'md', destaque = true }: BolaDezenaProps) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold tabular-nums ${tamanhos[tamanho]} ${
      destaque
        ? 'bg-slate-700 text-white shadow-sm dark:bg-slate-200 dark:text-slate-900'
        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
    }`}
  >
    {rotulo}
  </span>
);

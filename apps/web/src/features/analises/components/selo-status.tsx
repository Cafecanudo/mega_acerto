import type { StatusAnalise } from '@mega/analises/catalogo';

const estilos: Record<StatusAnalise, { readonly rotulo: string; readonly classe: string }> = {
  pendente: {
    rotulo: 'Na fila',
    classe: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  executando: {
    rotulo: 'Executando',
    classe: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  },
  concluida: {
    rotulo: 'Concluída',
    classe: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  falhou: {
    rotulo: 'Falhou',
    classe: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  },
};

export const SeloStatus = ({ status }: { readonly status: StatusAnalise }) => {
  const estilo = estilos[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${estilo.classe}`}
    >
      {status === 'executando' && (
        <span className="size-1.5 animate-pulse rounded-full bg-current" />
      )}
      {estilo.rotulo}
    </span>
  );
};

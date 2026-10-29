import { formatarInteiro } from '@/lib/formatadores';

interface PaginacaoProps {
  readonly pagina: number;
  readonly tamanho: number;
  readonly total: number;
  readonly aoMudar: (pagina: number) => void;
}

const botao =
  'rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800';

export const Paginacao = ({ pagina, tamanho, total, aoMudar }: PaginacaoProps) => {
  const totalPaginas = Math.max(1, Math.ceil(total / tamanho));

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-slate-500 dark:text-slate-400">
        {formatarInteiro(total)} {total === 1 ? 'resultado' : 'resultados'} · página{' '}
        {formatarInteiro(pagina)} de {formatarInteiro(totalPaginas)}
      </span>
      <div className="flex gap-2">
        <button
          className={botao}
          disabled={pagina <= 1}
          onClick={() => {
            aoMudar(1);
          }}
        >
          Primeira
        </button>
        <button
          className={botao}
          disabled={pagina <= 1}
          onClick={() => {
            aoMudar(pagina - 1);
          }}
        >
          Anterior
        </button>
        <button
          className={botao}
          disabled={pagina >= totalPaginas}
          onClick={() => {
            aoMudar(pagina + 1);
          }}
        >
          Próxima
        </button>
        <button
          className={botao}
          disabled={pagina >= totalPaginas}
          onClick={() => {
            aoMudar(totalPaginas);
          }}
        >
          Última
        </button>
      </div>
    </nav>
  );
};

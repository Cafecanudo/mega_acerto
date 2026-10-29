import { isRouteErrorResponse, useRouteError } from 'react-router';

const descrever = (erro: unknown): string => {
  if (isRouteErrorResponse(erro)) return `${erro.status} ${erro.statusText}`;
  if (erro instanceof Error) return erro.message;
  return 'Erro inesperado';
};

export const ErroRota = () => {
  const erro = useRouteError();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">Algo deu errado</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{descrever(erro)}</p>
      <button
        type="button"
        onClick={() => {
          window.location.reload();
        }}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
      >
        Recarregar
      </button>
    </div>
  );
};

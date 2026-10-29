import { IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { sessaoQuery, useSair } from '../api/sessao';

export const UsuarioLogado = () => {
  const { data: usuario } = useQuery(sessaoQuery());
  const sair = useSair();
  if (!usuario) return null;

  return (
    <div className="flex items-center gap-2 border-t border-slate-200 px-2.5 pt-3 dark:border-slate-800">
      <IconUserCircle aria-hidden size="1.75rem" stroke={1.5} className="shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{usuario.nome}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{usuario.login}</p>
      </div>
      <button
        type="button"
        aria-label="Sair"
        title="Sair"
        disabled={sair.isPending}
        onClick={() => {
          sair.mutate();
        }}
        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-slate-800"
      >
        <IconLogout aria-hidden size="1.125rem" />
      </button>
    </div>
  );
};

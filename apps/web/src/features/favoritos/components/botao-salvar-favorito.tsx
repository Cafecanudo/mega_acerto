import { IconCheck, IconStar } from '@tabler/icons-react';
import { useSalvarFavorito } from '../api/favoritos';

interface BotaoSalvarFavoritoProps {
  readonly jogo: string;
  readonly dezenas: readonly number[];
  readonly nome: string;
  readonly desabilitado: boolean;
}

export const BotaoSalvarFavorito = ({
  jogo,
  dezenas,
  nome,
  desabilitado,
}: BotaoSalvarFavoritoProps) => {
  const salvar = useSalvarFavorito();

  return (
    <button
      type="button"
      title={salvar.isError ? salvar.error.message : undefined}
      disabled={desabilitado || salvar.isPending}
      onClick={() => {
        salvar.mutate({ id: null, dados: { jogo, nome, dezenas: [...dezenas] } });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {salvar.isSuccess ? (
        <IconCheck aria-hidden size="1rem" className="text-emerald-600" />
      ) : (
        <IconStar aria-hidden size="1rem" />
      )}
      {salvar.isSuccess ? 'Salvo' : 'Salvar como favorito'}
    </button>
  );
};

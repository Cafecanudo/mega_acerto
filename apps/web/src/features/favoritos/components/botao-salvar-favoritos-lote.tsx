import { IconCheck, IconStar } from '@tabler/icons-react';
import { formatarInteiro } from '@/lib/formatadores';
import { useSalvarFavoritosEmLote, type FavoritosCriados } from '../api/favoritos';

export interface ItemFavoritoLote {
  readonly jogo: string;
  readonly nome: string;
  readonly dezenas: readonly number[];
}

interface BotaoSalvarFavoritosLoteProps {
  readonly itens: readonly ItemFavoritoLote[];
  readonly desabilitado: boolean;
}

const descreverResultado = ({ criados, repetidos }: FavoritosCriados): string =>
  [
    `${formatarInteiro(criados)} ${criados === 1 ? 'salvo' : 'salvos'}`,
    repetidos > 0 && `${formatarInteiro(repetidos)} já existiam`,
  ]
    .filter(Boolean)
    .join(' · ');

export const BotaoSalvarFavoritosLote = ({
  itens,
  desabilitado,
}: BotaoSalvarFavoritosLoteProps) => {
  const salvar = useSalvarFavoritosEmLote();

  return (
    <span className="flex items-center gap-2">
      {salvar.isSuccess && (
        <span className="text-xs text-emerald-700 dark:text-emerald-400">
          {descreverResultado(salvar.data)}
        </span>
      )}
      {salvar.isError && (
        <span className="text-xs text-rose-600 dark:text-rose-400">{salvar.error.message}</span>
      )}
      <button
        type="button"
        disabled={desabilitado || salvar.isPending || salvar.isSuccess}
        onClick={() => {
          salvar.mutate(
            itens.map((item) => ({ jogo: item.jogo, nome: item.nome, dezenas: [...item.dezenas] })),
          );
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        {salvar.isSuccess ? (
          <IconCheck aria-hidden size="1rem" className="text-emerald-600" />
        ) : (
          <IconStar aria-hidden size="1rem" />
        )}
        {salvar.isPending ? 'Salvando…' : 'Salvar nos favoritos'}
      </button>
    </span>
  );
};

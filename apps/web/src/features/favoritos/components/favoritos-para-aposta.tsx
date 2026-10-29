import { isCodigoJogo, obterRegraJogo } from '@mega/domain';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { Carregando, Falha } from '@/components/ui/estado';
import { listarFavoritosQuery } from '../api/favoritos';
import type { Favorito } from '../types';

export interface ItemDeFavorito {
  readonly dezenas: number[];
  readonly nome: string | null;
  readonly favoritoId: number;
}

interface FavoritosParaApostaProps {
  readonly jogo: string;
  readonly aoAdicionar: (itens: readonly ItemDeFavorito[]) => void;
}

const paraItem = (favorito: Favorito): ItemDeFavorito => ({
  dezenas: favorito.dezenas,
  nome: favorito.nome ?? `Favorito #${favorito.id}`,
  favoritoId: favorito.id,
});

const botao =
  'inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';

export const FavoritosParaAposta = ({ jogo, aoAdicionar }: FavoritosParaApostaProps) => {
  const consulta = useQuery(listarFavoritosQuery());

  if (consulta.isPending) return <Carregando mensagem="Carregando favoritos…" />;
  if (consulta.isError) return <Falha erro={consulta.error} />;
  if (!isCodigoJogo(jogo)) return null;

  const regra = obterRegraJogo(jogo);
  const doJogo = consulta.data.filter((favorito) => favorito.jogo === jogo);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Usar favoritos</h3>
        {doJogo.length > 0 && (
          <button
            type="button"
            className={botao}
            onClick={() => {
              aoAdicionar(doJogo.map(paraItem));
            }}
          >
            <IconPlus aria-hidden size="0.875rem" />
            Adicionar todos ({doJogo.length})
          </button>
        )}
      </header>
      {doJogo.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Nenhum favorito para este jogo. Crie em Minha Conta › Favoritos.
        </p>
      ) : (
        <ul className="flex max-h-72 flex-col gap-2 overflow-auto">
          {doJogo.map((favorito) => (
            <li
              key={favorito.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-2.5 py-2 dark:border-slate-800"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xs font-medium">
                  {favorito.nome ?? `Favorito #${favorito.id}`}
                </span>
                <LinhaDezenas regra={regra} dezenas={favorito.dezenas} tamanho="sm" />
              </div>
              <button
                type="button"
                className={botao}
                onClick={() => {
                  aoAdicionar([paraItem(favorito)]);
                }}
              >
                <IconPlus aria-hidden size="0.875rem" />
                Adicionar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

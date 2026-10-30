import { formatarDezena, type RegraJogo } from '@mega/domain';
import { IconMinus, IconPlus } from '@tabler/icons-react';

interface DezenasBaseProps {
  readonly regra: RegraJogo;
  readonly base: readonly number[];
  readonly marcadas: ReadonlySet<number>;
  readonly aoAlternar: (dezena: number) => void;
  readonly aoAdicionarJogo: () => void;
  readonly aoRemoverDaBase: () => void;
}

const botaoSecundario =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800';

export const DezenasBase = ({
  regra,
  base,
  marcadas,
  aoAlternar,
  aoAdicionarJogo,
  aoRemoverDaBase,
}: DezenasBaseProps) => {
  const { minimo, maximo } = regra.dezenasPorAposta;
  const jogoValido = marcadas.size >= minimo && marcadas.size <= maximo;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Dezenas selecionadas ({base.length})</h3>
        <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {marcadas.size} marcadas
        </span>
      </header>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Marque {minimo} a {maximo} dezenas para criar um jogo manualmente, ou marque e remova as que
        não quiser usar na geração.
      </p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {base.map((dezena) => {
          const marcada = marcadas.has(dezena);
          return (
            <button
              key={dezena}
              type="button"
              aria-pressed={marcada}
              onClick={() => {
                aoAlternar(dezena);
              }}
              className={`h-9 rounded-lg font-mono text-sm font-semibold tabular-nums transition ${
                marcada
                  ? 'bg-jogo text-jogo-texto shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {formatarDezena(regra, dezena)}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!jogoValido}
          onClick={aoAdicionarJogo}
          className={botaoSecundario}
        >
          <IconPlus aria-hidden size="1rem" />
          Adicionar jogo
        </button>
        <button
          type="button"
          disabled={marcadas.size === 0}
          onClick={aoRemoverDaBase}
          className={`${botaoSecundario} hover:text-rose-600`}
        >
          <IconMinus aria-hidden size="1rem" />
          Remover da seleção
        </button>
      </div>
    </section>
  );
};

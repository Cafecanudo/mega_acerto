import { formatarDezena, type RegraJogo } from '@mega/domain';

interface SeletorDezenasProps {
  readonly regra: RegraJogo;
  readonly selecionadas: ReadonlySet<number>;
  readonly limite: number;
  readonly aoAlternar: (dezena: number) => void;
}

const criarUniverso = (regra: RegraJogo): number[] =>
  Array.from(
    { length: regra.universo.maximo - regra.universo.minimo + 1 },
    (_, indice) => regra.universo.minimo + indice,
  );

export const SeletorDezenas = ({
  regra,
  selecionadas,
  limite,
  aoAlternar,
}: SeletorDezenasProps) => {
  const completo = selecionadas.size >= limite;

  return (
    <div className="grid max-w-xl grid-cols-10 gap-1.5">
      {criarUniverso(regra).map((dezena) => {
        const ativa = selecionadas.has(dezena);
        return (
          <button
            key={dezena}
            type="button"
            aria-pressed={ativa}
            disabled={!ativa && completo}
            onClick={() => {
              aoAlternar(dezena);
            }}
            className={`h-9 rounded-lg font-mono text-sm font-semibold tabular-nums transition disabled:cursor-not-allowed disabled:opacity-30 ${
              ativa
                ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-emerald-950'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {formatarDezena(regra, dezena)}
          </button>
        );
      })}
    </div>
  );
};

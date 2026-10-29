import { formatarDezena, type RegraJogo } from '@mega/domain';
import { IconGridDots, IconSearch, IconX } from '@tabler/icons-react';
import { useState, type SyntheticEvent } from 'react';
import { MINIMO_ACERTOS_COMBINACOES, type ParametrosBusca } from '../api/consultas';
import { SeletorDezenas } from './seletor-dezenas';

interface BarraBuscaProps {
  readonly regra: RegraJogo;
  readonly busca: ParametrosBusca;
  readonly aoBuscar: (busca: ParametrosBusca) => void;
}

const SEPARADORES = /[\s,;]+/;

const interpretarTexto = (regra: RegraJogo, texto: string): number[] => {
  const dezenas = texto
    .split(SEPARADORES)
    .map((parte) => Number.parseInt(parte, 10))
    .filter(
      (dezena) =>
        Number.isInteger(dezena) &&
        dezena >= regra.universo.minimo &&
        dezena <= regra.universo.maximo,
    );
  return [...new Set(dezenas)].slice(0, regra.dezenasPorAposta.maximo);
};

const formatarLista = (regra: RegraJogo, dezenas: Iterable<number>): string =>
  [...dezenas]
    .sort((a, b) => a - b)
    .map((dezena) => formatarDezena(regra, dezena))
    .join(' ');

const botao =
  'inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';

export const BarraBusca = ({ regra, busca, aoBuscar }: BarraBuscaProps) => {
  const [texto, setTexto] = useState(() => formatarLista(regra, busca.dezenas));
  const [gradeAberta, setGradeAberta] = useState(false);
  const [incluirCombinacoes, setIncluirCombinacoes] = useState(busca.incluirCombinacoes);

  const limite = regra.dezenasPorAposta.maximo;
  const selecionadas = new Set(interpretarTexto(regra, texto));
  const buscaAtiva = busca.dezenas.length > 0;

  const alternar = (dezena: number) => {
    const proximas = new Set(selecionadas);
    if (!proximas.delete(dezena)) proximas.add(dezena);
    setTexto(formatarLista(regra, proximas));
  };

  const buscar = (evento?: SyntheticEvent) => {
    evento?.preventDefault();
    setGradeAberta(false);
    aoBuscar({
      dezenas: [...selecionadas].sort((a, b) => a - b),
      incluirCombinacoes,
      pagina: 1,
    });
  };

  const limpar = () => {
    setTexto('');
    setGradeAberta(false);
    aoBuscar({ dezenas: [], incluirCombinacoes, pagina: 1 });
  };

  return (
    <div className="relative flex flex-col gap-3">
      <form onSubmit={buscar} className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 focus-within:border-jogo focus-within:ring-2 focus-within:ring-jogo/30 dark:border-slate-700 dark:bg-slate-950">
          <IconSearch aria-hidden size="1.125rem" className="shrink-0 text-slate-400" />
          <input
            value={texto}
            onChange={(evento) => {
              setTexto(evento.target.value);
            }}
            placeholder={`Até ${limite} dezenas: ${formatarLista(regra, [4, 5, 30])}`}
            inputMode="numeric"
            aria-label="Dezenas para buscar"
            className="w-full bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-slate-400"
          />
          <span className="shrink-0 text-xs text-slate-400 tabular-nums">
            {selecionadas.size}/{limite}
          </span>
        </label>
        <label
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
          title={`Inclui concursos com ${MINIMO_ACERTOS_COMBINACOES} ou mais acertos entre as dezenas escolhidas`}
        >
          <input
            type="checkbox"
            checked={incluirCombinacoes}
            onChange={(evento) => {
              setIncluirCombinacoes(evento.target.checked);
            }}
            className="size-4 accent-jogo"
          />
          Combinações de até {MINIMO_ACERTOS_COMBINACOES}
        </label>
        <button
          type="button"
          aria-expanded={gradeAberta}
          className={botao}
          onClick={() => {
            setGradeAberta((aberta) => !aberta);
          }}
        >
          <IconGridDots aria-hidden size="1.125rem" />
          Grade
        </button>
        <button
          type="submit"
          disabled={selecionadas.size === 0}
          className="rounded-lg bg-jogo px-4 py-1.5 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buscar
        </button>
        {buscaAtiva && (
          <button type="button" className={botao} onClick={limpar}>
            <IconX aria-hidden size="1.125rem" />
            Limpar
          </button>
        )}
      </form>

      {gradeAberta && (
        <div className="absolute top-full right-0 z-20 mt-2 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">Escolha até {limite} dezenas</span>
            <span className="text-slate-500 dark:text-slate-400">
              {selecionadas.size}/{limite}
            </span>
          </div>
          <SeletorDezenas
            regra={regra}
            selecionadas={selecionadas}
            limite={limite}
            aoAlternar={alternar}
          />
        </div>
      )}
    </div>
  );
};

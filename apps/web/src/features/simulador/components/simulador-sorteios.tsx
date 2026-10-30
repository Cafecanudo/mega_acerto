import { sortearConcurso, type RegraJogo } from '@mega/domain';
import { IconDice5, IconTrash } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { sortearInteiro } from '@/lib/aleatorio';
import { formatarInteiro } from '@/lib/formatadores';
import type { ReferenciasSimulacao, SorteioSimulado } from '../types';
import { conferirSorteio } from '../utils';
import { LegendaMarcacoes } from './legenda-marcacoes';
import { LinhaSorteio } from './linha-sorteio';
import { PainelAoVivo } from './painel-ao-vivo';

interface SimuladorSorteiosProps {
  readonly regra: RegraJogo;
  readonly referencias: ReferenciasSimulacao;
}

type Modo = 'ao-vivo' | 'rapido';

const MODOS: readonly { readonly valor: Modo; readonly rotulo: string }[] = [
  { valor: 'ao-vivo', rotulo: 'Ao vivo' },
  { valor: 'rapido', rotulo: 'Rápido' },
];

const ATALHOS = [10, 100, 1000] as const;
const LIMITE_POR_GERACAO = 10_000;
const LIMITE_LISTA = 100_000;
const TAMANHO_PAGINA = 50;

const classeAtalho =
  'rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';

const limitarQuantidade = (valor: number): number =>
  Math.min(Math.max(Math.trunc(valor) || 1, 1), LIMITE_POR_GERACAO);

export const SimuladorSorteios = ({ regra, referencias }: SimuladorSorteiosProps) => {
  const [modo, setModo] = useState<Modo>('ao-vivo');
  const [quantidade, setQuantidade] = useState(100);
  const [sorteios, setSorteios] = useState<readonly SorteioSimulado[]>([]);
  const [pagina, setPagina] = useState(1);
  const [somentePremiados, setSomentePremiados] = useState(false);

  const conferidos = useMemo(
    () => sorteios.map((sorteio) => conferirSorteio(regra, sorteio, referencias)),
    [regra, sorteios, referencias],
  );
  const premiados = useMemo(() => conferidos.filter((sorteio) => sorteio.premiado), [conferidos]);
  const exibidos = somentePremiados ? premiados : conferidos;

  const espaco = LIMITE_LISTA - sorteios.length;
  const aGerar = Math.min(quantidade, espaco);
  const totalPaginas = Math.max(1, Math.ceil(exibidos.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const fim = exibidos.length - (paginaAtual - 1) * TAMANHO_PAGINA;
  const paginaExibida = exibidos.slice(Math.max(0, fim - TAMANHO_PAGINA), fim).reverse();

  const adicionar = useCallback((novos: readonly (readonly (readonly number[])[])[]) => {
    setSorteios((atuais) => [
      ...atuais,
      ...novos.slice(0, LIMITE_LISTA - atuais.length).map((sorteio, indice) => ({
        numero: atuais.length + indice + 1,
        sorteios: sorteio.map((dezenas) => [...dezenas].sort((a, b) => a - b)),
      })),
    ]);
  }, []);

  const adicionarUm = useCallback(
    (sorteio: readonly (readonly number[])[]) => {
      adicionar([sorteio]);
    },
    [adicionar],
  );

  const gerar = () => {
    adicionar(Array.from({ length: aGerar }, () => sortearConcurso(regra, sortearInteiro)));
  };

  const limpar = () => {
    setSorteios([]);
    setPagina(1);
  };

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div
          role="radiogroup"
          aria-label="Modo do simulador"
          className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
        >
          {MODOS.map((item) => (
            <button
              key={item.valor}
              type="button"
              role="radio"
              aria-checked={modo === item.valor}
              onClick={() => {
                setModo(item.valor);
              }}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                modo === item.valor
                  ? 'bg-jogo text-jogo-texto'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs font-medium">
            <input
              type="checkbox"
              checked={somentePremiados}
              onChange={(evento) => {
                setSomentePremiados(evento.target.checked);
                setPagina(1);
              }}
              className="accent-emerald-600"
            />
            Só premiados ({formatarInteiro(premiados.length)})
          </label>
          <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {formatarInteiro(sorteios.length)} de {formatarInteiro(LIMITE_LISTA)} sorteios
          </span>
          <button
            type="button"
            disabled={sorteios.length === 0}
            onClick={limpar}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 disabled:opacity-40 dark:text-slate-400"
          >
            <IconTrash aria-hidden size="0.875rem" />
            Limpar
          </button>
        </div>
      </div>

      {modo === 'ao-vivo' ? (
        <PainelAoVivo regra={regra} referencias={referencias} aoConcluir={adicionarUm} />
      ) : (
        <div className="flex shrink-0 flex-wrap items-end gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quantidade de sorteios
            </span>
            <input
              type="number"
              min={1}
              max={LIMITE_POR_GERACAO}
              value={quantidade}
              onChange={(evento) => {
                setQuantidade(limitarQuantidade(Number(evento.target.value)));
              }}
              className="w-32 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          {ATALHOS.map((atalho) => (
            <button
              key={atalho}
              type="button"
              onClick={() => {
                setQuantidade(atalho);
              }}
              className={classeAtalho}
            >
              {formatarInteiro(atalho)}
            </button>
          ))}
          <button
            type="button"
            disabled={aGerar === 0}
            onClick={gerar}
            className="inline-flex items-center gap-1.5 rounded-lg bg-jogo px-4 py-1.5 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconDice5 aria-hidden size="1rem" />
            Gerar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 p-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        <LegendaMarcacoes referencias={referencias} />
        {exibidos.length === 0 ? (
          <Vazio>
            {sorteios.length === 0
              ? 'Os sorteios realizados aparecem aqui, do mais recente para o mais antigo.'
              : 'Nenhum sorteio premiou suas apostas ou favoritos.'}
          </Vazio>
        ) : (
          <ol className="flex flex-col gap-1.5">
            {paginaExibida.map((sorteio) => (
              <li
                key={sorteio.numero}
                className={`flex items-center gap-3 rounded-lg border px-3 py-1.5 ${
                  sorteio.premiado
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <span className="w-16 shrink-0 text-right font-mono text-xs text-slate-400 tabular-nums">
                  #{formatarInteiro(sorteio.numero)}
                </span>
                <div className="flex flex-col gap-1">
                  {sorteio.resultados.map((resultado, indice) => (
                    <LinhaSorteio key={indice} regra={regra} resultado={resultado} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
        {exibidos.length > TAMANHO_PAGINA && (
          <Paginacao
            pagina={paginaAtual}
            tamanho={TAMANHO_PAGINA}
            total={exibidos.length}
            aoMudar={setPagina}
          />
        )}
      </div>
    </section>
  );
};

import { sortearConcurso, type RegraJogo } from '@mega/domain';
import { IconDice5, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { sortearInteiro } from '@/lib/aleatorio';
import { formatarInteiro } from '@/lib/formatadores';

interface SorteioSimulado {
  readonly numero: number;
  readonly sorteios: readonly (readonly number[])[];
}

const ATALHOS = [10, 100, 1000] as const;
const LIMITE_POR_GERACAO = 10_000;
const LIMITE_LISTA = 100_000;
const TAMANHO_PAGINA = 50;

const classeAtalho =
  'rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';

const limitarQuantidade = (valor: number): number =>
  Math.min(Math.max(Math.trunc(valor) || 1, 1), LIMITE_POR_GERACAO);

export const SimuladorSorteios = ({ regra }: { readonly regra: RegraJogo }) => {
  const [quantidade, setQuantidade] = useState(100);
  const [sorteios, setSorteios] = useState<readonly SorteioSimulado[]>([]);
  const [pagina, setPagina] = useState(1);

  const espaco = LIMITE_LISTA - sorteios.length;
  const aGerar = Math.min(quantidade, espaco);
  const totalPaginas = Math.max(1, Math.ceil(sorteios.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;

  const gerar = () => {
    const novos = Array.from({ length: aGerar }, (_, indice) => ({
      numero: sorteios.length + indice + 1,
      sorteios: sortearConcurso(regra, sortearInteiro),
    }));
    setSorteios([...sorteios, ...novos]);
  };

  const limpar = () => {
    setSorteios([]);
    setPagina(1);
  };

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:min-h-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-end gap-2">
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
        <div className="flex items-center gap-3">
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

      <div className="flex flex-col gap-3 p-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        {sorteios.length === 0 ? (
          <Vazio>Informe a quantidade e clique em Gerar para simular sorteios.</Vazio>
        ) : (
          <ol className="flex flex-col gap-1.5">
            {sorteios.slice(inicio, inicio + TAMANHO_PAGINA).map((sorteio) => (
              <li
                key={sorteio.numero}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-1.5 dark:border-slate-800"
              >
                <span className="w-16 shrink-0 text-right font-mono text-xs text-slate-400 tabular-nums">
                  #{formatarInteiro(sorteio.numero)}
                </span>
                <div className="flex flex-col gap-1">
                  {sorteio.sorteios.map((dezenas, indice) => (
                    <LinhaDezenas key={indice} regra={regra} dezenas={dezenas} tamanho="sm" />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
        {sorteios.length > TAMANHO_PAGINA && (
          <Paginacao
            pagina={paginaAtual}
            tamanho={TAMANHO_PAGINA}
            total={sorteios.length}
            aoMudar={setPagina}
          />
        )}
      </div>
    </section>
  );
};

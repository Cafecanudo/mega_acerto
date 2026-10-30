import { isCodigoJogo, obterApresentacaoJogo, obterRegraJogo, projetarCusto } from '@mega/domain';
import { IconTicket, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { Vazio } from '@/components/ui/estado';
import { Paginacao } from '@/components/ui/paginacao';
import { TotaisCusto } from '@/components/ui/totais-custo';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { LIMITE_JOGOS_POR_APOSTA, type JogoMontado } from '../types';

interface ListaJogosMontadosProps {
  readonly jogos: readonly JogoMontado[];
  readonly aviso: string | null;
  readonly valorDe: (jogo: JogoMontado) => number | null;
  readonly aoRemover: (chave: number) => void;
  readonly aoLimpar: () => void;
  readonly aoUsarNaAposta: () => void;
}

const TAMANHO_PAGINA = 50;

const ItemJogo = ({
  numero,
  jogo,
  valor,
  aoRemover,
}: {
  readonly numero: number;
  readonly jogo: JogoMontado;
  readonly valor: number | null;
  readonly aoRemover: () => void;
}) => {
  if (!isCodigoJogo(jogo.jogo)) return null;

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-10 shrink-0 text-right text-xs text-slate-400 tabular-nums">
          {formatarInteiro(numero)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {obterApresentacaoJogo(jogo.jogo)?.nome} · {jogo.nome} · {jogo.dezenas.length} dezenas ·{' '}
            {formatarMoeda(valor)}
          </span>
          <LinhaDezenas regra={obterRegraJogo(jogo.jogo)} dezenas={jogo.dezenas} tamanho="sm" />
        </div>
      </div>
      <button
        type="button"
        aria-label="Remover jogo"
        onClick={aoRemover}
        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
      >
        <IconTrash aria-hidden size="1rem" />
      </button>
    </li>
  );
};

export const ListaJogosMontados = ({
  jogos,
  aviso,
  valorDe,
  aoRemover,
  aoLimpar,
  aoUsarNaAposta,
}: ListaJogosMontadosProps) => {
  const [paginaEscolhida, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(jogos.length / TAMANHO_PAGINA));
  const pagina = Math.min(paginaEscolhida, totalPaginas);
  const inicio = (pagina - 1) * TAMANHO_PAGINA;
  const valores = jogos.map(valorDe);
  const semValor = valores.some((valor) => valor === null);
  const custo = projetarCusto(
    jogos.flatMap((jogo, indice) =>
      isCodigoJogo(jogo.jogo)
        ? [{ regra: obterRegraJogo(jogo.jogo), valor: valores[indice] ?? null }]
        : [],
    ),
  );
  const excedeLimite = jogos.length > LIMITE_JOGOS_POR_APOSTA;

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:h-full lg:min-h-0 dark:border-slate-800 dark:bg-slate-900">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold">Jogos montados ({formatarInteiro(jogos.length)})</h3>
        {jogos.length > 0 && (
          <button
            type="button"
            onClick={aoLimpar}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400"
          >
            Limpar lista
          </button>
        )}
      </header>
      {aviso && (
        <p className="shrink-0 border-b border-slate-200 bg-sky-50 px-4 py-2 text-xs text-sky-800 dark:border-slate-800 dark:bg-sky-500/10 dark:text-sky-300">
          {aviso}
        </p>
      )}
      <div className="flex flex-col gap-3 p-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        {jogos.length === 0 ? (
          <Vazio>Crie um jogo com as dezenas marcadas ou gere combinações.</Vazio>
        ) : (
          <ul className="flex flex-col gap-2">
            {jogos.slice(inicio, inicio + TAMANHO_PAGINA).map((jogo, indice) => (
              <ItemJogo
                key={jogo.chave}
                numero={inicio + indice + 1}
                jogo={jogo}
                valor={valores[inicio + indice] ?? null}
                aoRemover={() => {
                  aoRemover(jogo.chave);
                }}
              />
            ))}
          </ul>
        )}
        {jogos.length > TAMANHO_PAGINA && (
          <Paginacao
            pagina={pagina}
            tamanho={TAMANHO_PAGINA}
            total={jogos.length}
            aoMudar={setPagina}
          />
        )}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          {excedeLimite && (
            <span className="text-amber-600 dark:text-amber-400">
              O Apostar recebe até {LIMITE_JOGOS_POR_APOSTA} jogos por vez. Remova{' '}
              {formatarInteiro(jogos.length - LIMITE_JOGOS_POR_APOSTA)} para continuar.
            </span>
          )}
          {semValor && jogos.length > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              Valor não configurado. Defina em Configurações › Valores.
            </span>
          )}
          <TotaisCusto custo={custo} />
        </span>
        <button
          type="button"
          disabled={jogos.length === 0 || excedeLimite}
          onClick={aoUsarNaAposta}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconTicket aria-hidden size="1rem" />
          Usar na Aposta
        </button>
      </footer>
    </section>
  );
};

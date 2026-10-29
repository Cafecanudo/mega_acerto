import {
  formatarDezena,
  isCodigoJogo,
  obterApresentacaoJogo,
  obterRegraJogo,
  type RegraJogo,
} from '@mega/domain';
import {
  IconClover,
  IconPencil,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { LinhaDezenas } from '@/components/dezenas/linha-dezenas';
import { paths } from '@/config/paths';
import { estiloCorJogo } from '@/lib/cor-jogo';
import { formatarData, formatarInteiro } from '@/lib/formatadores';
import { useAlternarFavorita, useExcluirAposta } from '../api/apostas';
import type { Aposta } from '../types';

interface CartaoApostaProps {
  readonly aposta: Aposta;
  readonly aoEditar: (aposta: Aposta) => void;
}

const botaoIcone =
  'rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100';

const UltimoConcurso = ({
  aposta,
  regra,
}: {
  readonly aposta: Aposta;
  readonly regra: RegraJogo;
}) => {
  const ultimo = aposta.conferencia.ultimoConcurso;
  if (!ultimo) return null;
  return (
    <span className="text-sm text-slate-600 dark:text-slate-300">
      Concurso {ultimo.numero} ({formatarData(ultimo.data)}):{' '}
      <strong className="font-semibold text-slate-900 dark:text-slate-100">
        {ultimo.acertos} {ultimo.acertos === 1 ? 'acerto' : 'acertos'}
      </strong>
      {ultimo.acertos > 0 && (
        <span className="font-mono text-xs">
          {' '}
          · {ultimo.dezenasAcertadas.map((dezena) => formatarDezena(regra, dezena)).join(' ')}
        </span>
      )}
    </span>
  );
};

const Historico = ({ aposta }: { readonly aposta: Aposta }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-xs">
    <span className="text-slate-500 dark:text-slate-400">No histórico:</span>
    {aposta.conferencia.historico.map((faixa) => (
      <span
        key={faixa.acertos}
        title={`Concursos com ${faixa.acertos} acertos entre as dezenas desta aposta`}
        className={`rounded-full px-2 py-0.5 font-medium tabular-nums ${
          faixa.concursos > 0
            ? 'bg-jogo/15 text-slate-900 dark:text-slate-100'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        {faixa.nome} {formatarInteiro(faixa.concursos)}
      </span>
    ))}
  </div>
);

export const CartaoAposta = ({ aposta, aoEditar }: CartaoApostaProps) => {
  const favorita = useAlternarFavorita();
  const excluir = useExcluirAposta();
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const apresentacao = obterApresentacaoJogo(aposta.jogo);
  if (!apresentacao || !isCodigoJogo(aposta.jogo)) return null;
  const regra = obterRegraJogo(aposta.jogo);

  return (
    <article
      style={estiloCorJogo(apresentacao)}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <IconClover
            aria-hidden
            size="1.375rem"
            stroke={1.75}
            color={apresentacao.cor}
            className="shrink-0 dark:brightness-[1.8] dark:saturate-150"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {aposta.nome ?? `Aposta #${aposta.id}`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {apresentacao.nome} · {aposta.dezenas.length} dezenas
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label={aposta.favorita ? 'Remover dos favoritos' : 'Marcar como favorita'}
            aria-pressed={aposta.favorita}
            onClick={() => {
              favorita.mutate(aposta);
            }}
            className={botaoIcone}
          >
            {aposta.favorita ? (
              <IconStarFilled aria-hidden size="1.125rem" className="text-amber-500" />
            ) : (
              <IconStar aria-hidden size="1.125rem" />
            )}
          </button>
          <button
            type="button"
            aria-label="Editar aposta"
            onClick={() => {
              aoEditar(aposta);
            }}
            className={botaoIcone}
          >
            <IconPencil aria-hidden size="1.125rem" />
          </button>
          {confirmarExclusao ? (
            <button
              type="button"
              onClick={() => {
                excluir.mutate(aposta.id);
              }}
              onBlur={() => {
                setConfirmarExclusao(false);
              }}
              className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white"
            >
              Confirmar
            </button>
          ) : (
            <button
              type="button"
              aria-label="Excluir aposta"
              onClick={() => {
                setConfirmarExclusao(true);
              }}
              className={botaoIcone}
            >
              <IconTrash aria-hidden size="1.125rem" />
            </button>
          )}
        </div>
      </header>
      <LinhaDezenas regra={regra} dezenas={aposta.dezenas} tamanho="sm" />
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <UltimoConcurso aposta={aposta} regra={regra} />
        <Historico aposta={aposta} />
        <Link
          to={paths.buscaNoHistorico(aposta.jogo, aposta.dezenas)}
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-slate-500 hover:text-jogo dark:text-slate-400"
        >
          <IconSearch aria-hidden size="0.875rem" />
          Ver concursos no histórico
        </Link>
      </div>
    </article>
  );
};

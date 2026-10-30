import { combinacoes, type RegraJogo } from '@mega/domain';
import { IconArrowsShuffle, IconListNumbers } from '@tabler/icons-react';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { LIMITE_JOGOS_MONTADOS, type ModoGeracao } from '../types';
import { tamanhosPossiveis } from '../utils';

export interface ConfiguracaoGeracao {
  readonly tamanho: number;
  readonly modo: ModoGeracao;
  readonly quantidade: number;
}

interface GerarJogosProps {
  readonly regra: RegraJogo;
  readonly totalBase: number;
  readonly configuracao: ConfiguracaoGeracao;
  readonly valorPorJogo: number | null;
  readonly aoMudar: (configuracao: ConfiguracaoGeracao) => void;
  readonly aoGerar: () => void;
}

const classeCampo =
  'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950';

const OpcaoModo = ({
  ativo,
  titulo,
  descricao,
  aoEscolher,
  desabilitado,
}: {
  readonly ativo: boolean;
  readonly titulo: string;
  readonly descricao: string;
  readonly aoEscolher: () => void;
  readonly desabilitado: boolean;
}) => (
  <label
    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${
      ativo
        ? 'border-jogo bg-jogo/10'
        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'
    } ${desabilitado ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    <input
      type="radio"
      checked={ativo}
      disabled={desabilitado}
      onChange={aoEscolher}
      className="mt-1 accent-current"
    />
    <span className="flex flex-col">
      <span className="font-medium">{titulo}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{descricao}</span>
    </span>
  </label>
);

export const GerarJogos = ({
  regra,
  totalBase,
  configuracao,
  valorPorJogo,
  aoMudar,
  aoGerar,
}: GerarJogosProps) => {
  const tamanhos = tamanhosPossiveis(regra, totalBase);
  const total = combinacoes(totalBase, configuracao.tamanho);
  const todasCabem = total <= LIMITE_JOGOS_MONTADOS;
  const quantidadeGerada =
    configuracao.modo === 'todas' ? total : Math.min(configuracao.quantidade, total);
  const custo = valorPorJogo === null ? null : quantidadeGerada * valorPorJogo;
  const podeGerar =
    tamanhos.length > 0 && quantidadeGerada > 0 && (configuracao.modo === 'sortear' || todasCabem);

  if (tamanhos.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Selecione pelo menos {regra.dezenasPorAposta.minimo} dezenas para gerar jogos de{' '}
        {regra.nome}.
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold">Gerar jogos</h3>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Dezenas por jogo
        </span>
        <select
          value={configuracao.tamanho}
          onChange={(evento) => {
            aoMudar({ ...configuracao, tamanho: Number(evento.target.value) });
          }}
          className={classeCampo}
        >
          {tamanhos.map((tamanho) => (
            <option key={tamanho} value={tamanho}>
              {tamanho} dezenas
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        {formatarInteiro(total)} {total === 1 ? 'combinação possível' : 'combinações possíveis'} com{' '}
        {totalBase} dezenas · {formatarMoeda(valorPorJogo)} por jogo
      </p>
      <div className="flex flex-col gap-2">
        <OpcaoModo
          ativo={configuracao.modo === 'todas'}
          titulo="Todas as combinações"
          descricao={
            todasCabem
              ? `Lista os ${formatarInteiro(total)} jogos possíveis.`
              : `Acima do limite de ${formatarInteiro(LIMITE_JOGOS_MONTADOS)} jogos; use o sorteio.`
          }
          desabilitado={!todasCabem}
          aoEscolher={() => {
            aoMudar({ ...configuracao, modo: 'todas' });
          }}
        />
        <OpcaoModo
          ativo={configuracao.modo === 'sortear'}
          titulo="Sortear combinações"
          descricao="Escolhe jogos distintos ao acaso entre todas as combinações."
          desabilitado={false}
          aoEscolher={() => {
            aoMudar({ ...configuracao, modo: 'sortear' });
          }}
        />
        {configuracao.modo === 'sortear' && (
          <label className="flex items-center gap-2 pl-6 text-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quantidade
            </span>
            <input
              type="number"
              min={1}
              max={Math.min(total, LIMITE_JOGOS_MONTADOS)}
              value={configuracao.quantidade}
              onChange={(evento) => {
                aoMudar({ ...configuracao, quantidade: Math.max(1, Number(evento.target.value)) });
              }}
              className={`${classeCampo} w-24 tabular-nums`}
            />
          </label>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {formatarInteiro(quantidadeGerada)} {quantidadeGerada === 1 ? 'jogo' : 'jogos'} ·{' '}
          <strong className="font-semibold">{formatarMoeda(custo)}</strong>
        </span>
        <button
          type="button"
          disabled={!podeGerar}
          onClick={aoGerar}
          className="inline-flex items-center gap-1.5 rounded-lg bg-jogo px-3 py-1.5 text-sm font-semibold text-jogo-texto transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {configuracao.modo === 'todas' ? (
            <IconListNumbers aria-hidden size="1rem" />
          ) : (
            <IconArrowsShuffle aria-hidden size="1rem" />
          )}
          Gerar
        </button>
      </div>
    </section>
  );
};

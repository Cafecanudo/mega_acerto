import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Cartao } from '@/components/ui/cartao';
import { Carregando, Falha } from '@/components/ui/estado';
import { formatarInteiro, formatarMoeda } from '@/lib/formatadores';
import { balancoApostasQuery, type BalancoApostas, type BalancoPeriodo } from '../api/apostas';

type Periodo = keyof Pick<BalancoApostas, 'total' | 'ultimos12Meses'>;

const PERIODOS: readonly { readonly chave: Periodo; readonly rotulo: string }[] = [
  { chave: 'ultimos12Meses', rotulo: '12 meses' },
  { chave: 'total', rotulo: 'Todo o período' },
];

const classeSaldo = (saldo: number): string => {
  if (saldo > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (saldo < 0) return 'text-rose-600 dark:text-rose-400';
  return '';
};

const Indicador = ({
  rotulo,
  valor,
  classe = '',
}: {
  readonly rotulo: string;
  readonly valor: string;
  readonly classe?: string;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {rotulo}
    </span>
    <span className={`text-lg font-semibold tabular-nums ${classe}`}>{valor}</span>
  </div>
);

const SeletorPeriodo = ({
  periodo,
  aoMudar,
}: {
  readonly periodo: Periodo;
  readonly aoMudar: (periodo: Periodo) => void;
}) => (
  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
    {PERIODOS.map(({ chave, rotulo }) => (
      <button
        key={chave}
        type="button"
        aria-pressed={periodo === chave}
        onClick={() => {
          aoMudar(chave);
        }}
        className={`rounded-md px-2.5 py-1 transition ${
          periodo === chave
            ? 'bg-white shadow-sm dark:bg-slate-950'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        {rotulo}
      </button>
    ))}
  </div>
);

const ConteudoBalanco = ({
  balanco,
  aguardando,
}: {
  readonly balanco: BalancoPeriodo;
  readonly aguardando: BalancoApostas['aguardando'];
}) => {
  const saldo = Math.round((balanco.premios - balanco.gasto) * 100) / 100;
  const retorno = balanco.gasto > 0 ? balanco.premios / balanco.gasto : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Indicador rotulo="Gasto" valor={formatarMoeda(balanco.gasto)} />
        <Indicador rotulo="Prêmios" valor={formatarMoeda(balanco.premios)} />
        <Indicador rotulo="Saldo" valor={formatarMoeda(saldo)} classe={classeSaldo(saldo)} />
        <Indicador rotulo="Retorno por R$ 1" valor={formatarMoeda(retorno)} />
      </div>
      <ul className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        <li>
          {formatarInteiro(balanco.apostas)}{' '}
          {balanco.apostas === 1 ? 'aposta sorteada' : 'apostas sorteadas'}
          {balanco.incompletas > 0 &&
            ` · ${formatarInteiro(balanco.incompletas)} sem valor ou prêmio divulgado`}
        </li>
        {aguardando.apostas > 0 && (
          <li>
            {formatarMoeda(aguardando.valor)} em {formatarInteiro(aguardando.apostas)}{' '}
            {aguardando.apostas === 1 ? 'aposta aguardando' : 'apostas aguardando'} sorteio
          </li>
        )}
        <li>Nas loterias da Caixa, o retorno esperado de cada R$ 1 apostado é menor que R$ 1.</li>
      </ul>
    </div>
  );
};

export const BalancoApostasCartao = () => {
  const consulta = useQuery(balancoApostasQuery());
  const [periodo, setPeriodo] = useState<Periodo>('ultimos12Meses');

  return (
    <Cartao titulo="Balanço" acoes={<SeletorPeriodo periodo={periodo} aoMudar={setPeriodo} />}>
      {consulta.isPending && <Carregando />}
      {consulta.isError && <Falha erro={consulta.error} />}
      {consulta.isSuccess && (
        <ConteudoBalanco balanco={consulta.data[periodo]} aguardando={consulta.data.aguardando} />
      )}
    </Cartao>
  );
};
